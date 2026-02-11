import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { CreatePostInput, UpdatePostInput } from "@/schemas/post";
import { PostContext } from "@/types/post";
import { Types } from "mongoose";
import { Like } from "@/models/like-model";
import { withTransaction } from "@/utils/with-transaction";
import { PostLikedEvent } from "@/events/event-types";
import { emitter } from "@/lib/event-bus";
import { EVENT_NAMES } from "@/events/event-names";
import { randomUUID } from "node:crypto";
import { config } from "@/config/env";
import { Follow } from "@/models/follow-model";

class PostService {
  async createPost(ctx: PostContext, data: CreatePostInput) {
    const post = await Post.create({
      ...data,
      authorId: ctx.userId,
    });

    if (!post) {
      throw new ApiError(500, "Failed to create post");
    }

    return {
      status: 201,
      message: "Post created successfully",
      post,
    };
  }
  async updatePost(ctx: PostContext, data: UpdatePostInput) {
    const post = await Post.findOneAndUpdate(
      {
        _id: ctx.postId!,
        authorId: ctx.userId,
      },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      { new: true },
    ).exec();

    if (!post) {
      throw new ApiError(401, "Unauthorized access");
    }

    return {
      status: 200,
      message: "Post updated successfully",
      post,
    };
  }
  async deletePost(ctx: PostContext) {
    const deletedPost = await Post.findOneAndDelete({
      _id: ctx.postId!,
      authorId: ctx.userId,
    }).exec();
    if (!deletedPost) {
      throw new ApiError(401, "Unauthorized access. Only authors allowed to delete");
    }

    return {
      status: 200,
      message: "Post deleted successfully",
    };
  }
  async getPostDetails(ctx: PostContext) {
    const result = await Post.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(ctx.postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          recentComments: {
            $slice: ["$comments", 5],
          },
        },
      },
      {
        $project: {
          "author.username": 1,
          "author.profilePhoto": 1,
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
        },
      },
    ]);

    const postDetails = result[0];

    if (!postDetails) {
      throw new ApiError(404, "Post not found");
    }

    return {
      status: 200,
      message: "Post details fetched successfully",
      post: postDetails,
    };
  }
  async getAllPosts(
    ctx: PostContext,
    query: { lastId?: string; limit?: string; filter?: "following" },
  ) {
    // TODO: filtering ( followings, trending )
    const limit = query.limit ? parseInt(query.limit, 10) : config.DEFAULT_RESPONSE_LIMIT;
    const match: any = { isDeleted: false };

    if (query.lastId) {
      match._id = { $lt: new Types.ObjectId(query.lastId) };
    }

    if (query.filter === "following") {
      const followingIds = await Follow.find({
        followerId: ctx.userId,
        status: "accepted",
      }).distinct("followingId");
      match.authorId = { $in: followingIds };
    }

    const [posts, totalCount] = await Promise.all([
      Post.aggregate([
        {
          $match: match,
        },
        {
          $sort: { createdAt: -1 }, // Newest first
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
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
            "author.profilePhoto": 1,
            "author.fullName": 1,
            "author._id": 1,
          },
        },
      ]).limit(limit),
      Post.countDocuments(match).exec(),
    ]);

    return {
      status: 200,
      message: "Posts fetched successfully",
      posts,
      pagination: {
        total: totalCount,
        limit,
        nextCursor: posts.length > 0 ? posts[posts.length - 1]._id : null,
        hasMore: posts.length < totalCount,
      },
    };
  }

  async togglePostLike(ctx: PostContext) {
    if (!ctx.postId) {
      throw new ApiError(400, "Resource ID is required");
    }

    const post = await Post.findById(ctx.postId).lean();
    if (!post) {
      throw new ApiError(404, "Post not found or no longer exists");
    }

    const isAlreadyLiked = await Like.exists({
      resourceType: "post",
      resourceId: ctx.postId,
      userId: ctx.userId,
    }).lean();

    if (isAlreadyLiked) {
      // Unlike the target resource
      return withTransaction(async (session) => {
        await Like.deleteOne(
          {
            resourceType: "post",
            resourceId: ctx.postId,
            userId: ctx.userId,
          },
          { session },
        );

        await Post.findByIdAndUpdate(ctx.postId, { $inc: { likesCount: -1 } }, { session });

        const eventData: PostLikedEvent = {
          eventId: randomUUID(),
          timestamp: Date.now(),
          postId: new Types.ObjectId(ctx.postId),
          postAuthorId: post.authorId,
          likedByUserId: new Types.ObjectId(ctx.userId),
          likedByUsername: ctx.username,
        };

        emitter.emit(EVENT_NAMES.POST_LIKED, eventData);

        return {
          status: 200,
          message: `post unliked successfully`,
        };
      });
    } else {
      // Like the target resource
      return withTransaction(async (session) => {
        await Like.create(
          [
            {
              resourceType: "post",
              resourceId: ctx.postId,
              userId: ctx.userId,
            },
          ],
          { session },
        );

        await Post.findByIdAndUpdate(ctx.postId, { $inc: { likesCount: 1 } }, { session });

        const eventData: PostLikedEvent = {
          eventId: randomUUID(),
          timestamp: Date.now(),
          postId: new Types.ObjectId(ctx.postId),
          postAuthorId: post.authorId,
          likedByUserId: new Types.ObjectId(ctx.userId),
          likedByUsername: ctx.username,
        };

        emitter.emit(EVENT_NAMES.POST_LIKED, eventData);

        return {
          status: 201,
          message: `post liked successfully`,
        };
      });
    }
  }

  async getPostLikes(ctx: PostContext) {
    const likes = await Like.aggregate([
      {
        $match: {
          resourceType: "post",
          resourceId: new Types.ObjectId(ctx.postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          _id: 0,
          "user._id": 1,
          "user.username": 1,
          "user.fullName": 1,
          "user.profilePhoto": 1,
          createdAt: 1,
        },
      },
    ]);

    return {
      status: 200,
      message: "Likes retrieved successfully",
      likes,
    };
  }
}

export const postService = new PostService();
