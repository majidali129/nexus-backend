import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { CreatePostInput, UpdatePostInput } from "@/schemas/post";
import { PostContext } from "@/types/post";
import { Types } from "mongoose";

class PostService {
    async createPost(ctx: PostContext, data: CreatePostInput) {
        const post = await Post.create({
            ...data,
            authorId: ctx.userId,
        });

        if (!post) {
            throw new ApiError(500, "Failed to create post");
        };

        return {
            status: 201,
            message: "Post created successfully",
            post,
        }
    }
    async updatePost(ctx: PostContext, data: UpdatePostInput) {
        const post = await Post.findOneAndUpdate({
            _id: ctx.postId!,
            authorId: ctx.userId
        }, {
            $set: {
                ...data,
                updatedAt: new Date()
            }
        }, { new: true }).exec();

        if (!post) {
            throw new ApiError(401, 'Unauthorized access');
        };

        return {
            status: 200,
            message: 'Post updated successfully',
            post
        }
    }
    async deletePost(ctx: PostContext) {
        const deletedPost = await Post.findOneAndDelete({
            _id: ctx.postId!,
            authorId: ctx.userId
        }).exec();
        if (!deletedPost) {
            throw new ApiError(401, 'Unauthorized access. Only authors allowed to delete')
        };

        return {
            status: 200,
            message: 'Post deleted successfully',
        }
    }
    async getPostDetails(ctx: PostContext) {

        const result = await Post.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(ctx.postId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: "$author",

            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "postId",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    recentComments: {
                        $slice: ["$comments", 5]
                    }
                }
            },
            {
                $project: {
                    "author.username": 1,
                    "author.profilePicture": 1,
                    "author.fullName": 1,
                    "author._id": 1,
                    caption: 1,
                    media: 1,
                    type: 1,
                    visibility: 1,
                    hashtags: 1,
                    feelings: 1,
                    taggedUsers: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    bookmarksCount: 1,
                    sharesCount: 1,
                    recentComments: 1,
                    viewsCount: 1,
                    isDeleted: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            }

        ]);

        const postDetails = result[0];

        if (!postDetails) {
            throw new ApiError(404, "Post not found");
        }

        return {
            status: 200,
            message: "Post details fetched successfully",
            post: postDetails,
        }

    }
    async getAllPosts() {
        // TODO: Implement pagination ( cursor based ) and filtering ( followings, trending, latest )
        const matchStage: any = { isDeleted: false };
        const result = await Post.aggregate([
            {
                $match: matchStage
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author"
                }
            }, {
                $unwind: "$author",
            },
            {
                $project: {
                    caption: 1,
                    media: 1,
                    type: 1,
                    visibility: 1,
                    hashtags: 1,
                    feelings: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    bookmarksCount: 1,
                    sharesCount: 1,
                    viewsCount: 1,
                    createdAt: 1,
                    "author.username": 1,
                    "author.profilePicture": 1,
                    "author.fullName": 1,
                    "author._id": 1,
                }
            }
        ]);

        return {
            status: 200,
            message: "Posts fetched successfully",
            posts: result,
        }

    }
}


export const postService = new PostService();