import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { CreateCommentInput, UpdateCommentInput } from "@/schemas/comment";
import { CommentContext, IComment } from "@/types/comment";
import { Comment } from "@/models/comment-model";
import { withTransaction } from "@/utils/with-transaction";
import { isOwner } from "@/utils/is-owner";
import { Types } from "mongoose";
import { CommentCreatedEvent, CommentRepliedEvent } from "@/events/event-types";
import { randomUUID } from "node:crypto";
import { emitter } from "@/lib/event-bus";
import { EVENT_NAMES } from "@/events/event-names";
import { config } from "@/config/env";

class CommentService {
  async createComment(ctx: CommentContext, data: CreateCommentInput) {
    const post = await Post.findById(ctx.postId).select("_id authorId").lean().exec();
    if (!post) {
      throw new ApiError(404, "Post not found or no longer available");
    }

    return withTransaction(async (session) => {
      if (data.parentCommentId) {
        const parentComment = await Comment.aggregate([
          {
            $match: {
              _id: new Types.ObjectId(data.parentCommentId),
              postId: new Types.ObjectId(ctx.postId),
              isDeleted: false,
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
            $project: {
              "author._id": 1,
              "author.username": 1,
              _id: 1,
              content: 1,
              repliesCount: 1,
              postId: 1,
            },
          },
        ]).exec();

        if (!parentComment.length) {
          throw new ApiError(404, "Parent comment not found or no longer available");
        }

        const reply = await Comment.create(
          [
            {
              ...data,
              postId: ctx.postId,
              authorId: ctx.userId,
            },
          ],
          { session },
        );

        await Post.findByIdAndUpdate(
          ctx.postId,
          {
            $inc: { commentsCount: 1 },
          },
          { session },
        ).exec();

        await Comment.findOneAndUpdate(
          {
            _id: data.parentCommentId,
            postId: ctx.postId,
            isDeleted: false,
          },
          {
            $inc: { repliesCount: 1 },
          },
          { new: true, session },
        )
          .lean()
          .exec();

        const eventData: CommentRepliedEvent = {
          eventId: randomUUID(),
          timestamp: Date.now(),
          parentCommentId: parentComment[0]._id,
          parentCommentAuthorId: parentComment[0].author._id,
          postId: parentComment[0].postId,
          replyId: reply[0]._id,
          replyAuthorId: new Types.ObjectId(ctx.userId),
          replyAuthorUsername: ctx.username,
          content: data.content,
        };

        emitter.emit(EVENT_NAMES.COMMENT_REPLIED, eventData);

        return {
          status: 201,
          message: "Replied successfully",
          comment: reply[0],
        };
      } else {
        const comment = await Comment.create(
          [
            {
              ...data,
              postId: ctx.postId,
              authorId: ctx.userId,
            },
          ],
          { session },
        );

        await Post.findByIdAndUpdate(
          ctx.postId,
          {
            $inc: { commentsCount: 1 },
          },
          { session },
        ).exec();

        const eventData: CommentCreatedEvent = {
          eventId: randomUUID(),
          timestamp: Date.now(),
          commentId: comment[0]._id,
          postId: new Types.ObjectId(ctx.postId),
          postAuthorId: post.authorId,
          commentAuthorId: new Types.ObjectId(ctx.userId),
          commentAuthorUsername: ctx.username,
          content: data.content,
        };

        emitter.emit(EVENT_NAMES.COMMENT_CREATED, eventData);

        return {
          status: 201,
          message: "Comment posted successfully",
          comment: comment[0],
        };
      }
    });
  }

  async updateComment(ctx: CommentContext, data: UpdateCommentInput) {
    const comment = await Comment.findById(ctx.commentId).lean().exec();

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (!isOwner(comment.authorId.toString(), ctx.userId)) {
      throw new ApiError(401, "Unauthorized: You can only edit your own comments");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      ctx.commentId,
      {
        ...data,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true },
    ).exec();
    return {
      status: 200,
      message: "Comment updated successfully",
      comment: updatedComment,
    };
  }

  async deleteComment(ctx: CommentContext) {
    const comment = await Comment.findOne({
      _id: ctx.commentId,
      postId: ctx.postId,
    })
      .select("authorId parentCommentId postId isDeleted")
      .lean()
      .exec();

    if (!comment || comment.isDeleted) {
      throw new ApiError(404, "Comment not found or already deleted");
    }

    if (!isOwner(comment.authorId.toString(), ctx.userId)) {
      throw new ApiError(401, "Unauthorized: You can only delete your own comments");
    }

    // TODO: add cron job to permanently delete comments that are soft deleted after 10 days & update post stats
    return withTransaction(async (session) => {
      // Soft delete the comment & replies
      await Comment.updateMany(
        {
          parentCommentId: ctx.commentId,
          isDeleted: false,
        },
        {
          isDeleted: true,
        },
        { session },
      ).exec();

      await Comment.updateOne(
        {
          _id: ctx.commentId,
          isDeleted: false,
        },
        {
          isDeleted: true,
        },
        { session },
      ).exec();

      return {
        status: 200,
        message: "Comment and its replies deleted successfully",
      };
    });
  }

  async getAllPostComments(ctx: CommentContext, query: { limit?: string; skip?: string }) {
    const limit = query.limit ? parseInt(query.limit) : config.DEFAULT_RESPONSE_LIMIT || 20;
    const skip = query.skip ? parseInt(query.skip) : 0;

    const [comments, totalCount] = await Promise.all([
      Comment.aggregate<IComment>([
        {
          $match: {
            postId: new Types.ObjectId(ctx.postId),
            isDeleted: false,
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
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            content: 1,
            postId: 1,
            likesCount: 1,
            parentCommentId: 1,
            repliesCount: 1,
            isEdited: 1,
            editedAt: 1,
            "author._id": 1,
            "author.username": 1,
            "author.profilePhoto": 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
        .limit(limit)
        .skip(skip)
        .exec(),

      Comment.countDocuments({ postId: new Types.ObjectId(ctx.postId), isDeleted: false }).exec(),
    ]);

    return {
      status: 200,
      message: "Comments fetched successfully",
      comments,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
    };
  }

  async getCommentReplies(ctx: CommentContext) {
    const comments = await Comment.aggregate<IComment>([
      {
        $match: {
          parentCommentId: new Types.ObjectId(ctx.commentId),
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
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
          content: 1,
          postId: 1,
          likesCount: 1,
          parentCommentId: 1,
          repliesCount: 1,
          isEdited: 1,
          editedAt: 1,
          "author._id": 1,
          "author.username": 1,
          "author.profilePhoto": 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]).exec();

    return {
      status: 200,
      message: "Replies fetched successfully",
      comments,
    };
  }
}

export const commentService = new CommentService();
