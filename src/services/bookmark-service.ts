import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { Types } from "mongoose";
import { BookmarkContext } from "@/types/bookmark";
import { Bookmark } from "@/models/bookmark-model";
import { withTransaction } from "@/utils/with-transaction";
import { config } from "@/config/env";

class BookmarkService {
  async bookmarkPost(ctx: BookmarkContext) {
    if (!ctx.postId) {
      throw new ApiError(400, "Post ID is required");
    }
    const isBookmarked = await Bookmark.exists({
      userId: new Types.ObjectId(ctx.userId),
      postId: new Types.ObjectId(ctx.postId!),
    }).lean();

    if (isBookmarked) {
      throw new ApiError(400, "Post is already bookmarked");
    }

    return withTransaction(async (session) => {
      const bookmark = await Bookmark.create(
        [
          {
            userId: ctx.userId,
            postId: ctx.postId!,
          },
        ],
        { session },
      );

      await Post.findByIdAndUpdate(ctx.postId, { $inc: { bookmarksCount: 1 } }, { session }).exec();

      return {
        status: 201,
        message: "Post bookmarked successfully",
        bookmark: bookmark[0],
      };
    });
  }

  async removeBookmark(ctx: BookmarkContext) {
    return withTransaction(async (session) => {
      const bookmark = await Bookmark.findOneAndDelete(
        {
          userId: new Types.ObjectId(ctx.userId),
          postId: new Types.ObjectId(ctx.postId!),
        },
        { session },
      ).lean();

      await Post.findByIdAndUpdate(ctx.postId, { $inc: { bookmarksCount: -1 } }, { session });

      return {
        status: 200,
        message: "Bookmark removed successfully",
        bookmark,
      };
    });
  }

  async getAllBookmarks(ctx: BookmarkContext, query: { limit?: string; skip?: string }) {
    const limit = query.limit ? parseInt(query.limit) : config.DEFAULT_RESPONSE_LIMIT || 20;
    const skip = query.skip ? parseInt(query.skip) : 0;

    const [bookmarks, totalCount] = await Promise.all([
      Bookmark.aggregate([
        {
          $match: { userId: new Types.ObjectId(ctx.userId) },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "posts",
            localField: "postId",
            foreignField: "_id",
            as: "post",
          },
        },
        {
          $unwind: "$post",
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
          },
        },
      ])
        .limit(limit)
        .skip(skip)
        .exec(),
      Bookmark.countDocuments({ userId: new Types.ObjectId(ctx.userId) }).exec(),
    ]);

    return {
      status: 200,
      message: "Bookmarks retrieved successfully",
      bookmarks,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
    };
  }
}

export const bookmarkService = new BookmarkService();
