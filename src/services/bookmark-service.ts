

import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { CreatePostInput, UpdatePostInput } from "@/schemas/post";
import { PostContext } from "@/types/post";
import { Types } from "mongoose";
import { BookmarkContext } from "@/types/bookmark";
import { Bookmark } from "@/models/bookmark-model";
import { withTransaction } from "@/utils/with-transaction";

class BookmarkService {
    async bookmarkPost(ctx: BookmarkContext) {
        const isBookmarked = await Bookmark.exists({
            userId: new Types.ObjectId(ctx.userId),
            postId: new Types.ObjectId(ctx.postId!)
        }).lean();

        if (isBookmarked) {
            throw new ApiError(400, 'Post is already bookmarked');
        };

        return withTransaction(async (session) => {
            const bookmark = await Bookmark.create([{
                userId: ctx.userId,
                postId: ctx.postId!
            }], { session });

            await Post.findByIdAndUpdate(ctx.postId, { $inc: { bookmarksCount: 1 } }, { session });

            return {
                status: 201,
                message: 'Post bookmarked successfully',
                bookmark: bookmark[0]
            }
        });
    };

    async removeBookmark(ctx: BookmarkContext) {

        return withTransaction(async (session) => {
            const bookmark = await Bookmark.findOneAndDelete({
                userId: new Types.ObjectId(ctx.userId),
                postId: new Types.ObjectId(ctx.postId!)
            }, { session }).lean();

            await Post.findByIdAndUpdate(ctx.postId, { $inc: { bookmarksCount: -1 } }, { session });

            return {
                status: 200,
                message: 'Bookmark removed successfully',
                bookmark
            }
        });
    };

    async getAllBookmarks(ctx: BookmarkContext) {
        const result = await Bookmark.aggregate([
            {
                $match: { userId: new Types.ObjectId(ctx.userId) }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'postId',
                    foreignField: '_id',
                    as: 'post'
                }
            },
            {
                $unwind: '$post'
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    "post._id": 1,
                    "post.caption": 1,
                    "post.media": 1,
                    "post.type": 1,
                    "post.hashtags": 1,
                }
            }
        ]);

        return {
            status: 200,
            message: 'Bookmarks retrieved successfully',
            bookmarks: result
        }
    }
}

export const bookmarkService = new BookmarkService();