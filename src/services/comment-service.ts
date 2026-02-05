import { ApiError } from "@/utils/api-error";
import { Post } from "@/models/post-model";
import { CreateCommentInput, UpdateCommentInput } from "@/schemas/comment";
import { CommentContext, IComment } from "@/types/comment";
import { Comment } from "@/models/comment-model";
import { withTransaction } from "@/utils/with-transaction";
import { isOwner } from "@/utils/is-owner";
import { Types } from "mongoose";

class CommentService {
    async createComment(ctx: CommentContext, data: CreateCommentInput) {

        const post = await Post.findById(ctx.postId).select("_id").lean().exec();
        if (!post) {
            throw new ApiError(404, "Post not found or no longer available");
        };

        return withTransaction(async (session) => {

            const comment = await Comment.create([{
                ...data,
                postId: ctx.postId,
                authorId: ctx.userId,
            }], { session });

            if (data.parentCommentId) {

                const parentComment = await Comment.findOneAndUpdate({
                    _id: data.parentCommentId,
                    postId: ctx.postId,
                    isDeleted: false
                }, {
                    $inc: { repliesCount: 1 }
                }, { new: true, session }).lean().exec();

                if (!parentComment) {
                    throw new ApiError(404, "Parent comment not found or no longer available");
                }
            };

            return {
                status: 201,
                message: "Comment created successfully",
                comment: comment[0]
            }
        })



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
            { new: true }
        ).exec();
        return {
            status: 200,
            message: "Comment updated successfully",
            comment: updatedComment
        }
    }

    async deleteComment(ctx: CommentContext) {
        const comment = await Comment.findOne({
            _id: ctx.commentId,
            postId: ctx.postId
        }).select("authorId parentCommentId postId isDeleted").lean().exec();

        if (!comment || comment.isDeleted) {
            throw new ApiError(404, "Comment not found or already deleted");
        }

        if (!isOwner(comment.authorId.toString(), ctx.userId)) {
            throw new ApiError(401, "Unauthorized: You can only delete your own comments");
        }

        return withTransaction(async (session) => {
            // Soft delete the comment & replies
            await Comment.updateMany({
                parentCommentId: ctx.commentId,
                isDeleted: false
            }, {
                isDeleted: true,
                deletedAt: new Date()
            }, { session }).exec();

            await Comment.updateOne({
                _id: ctx.commentId,
                isDeleted: false
            }, {
                isDeleted: true,
                deletedAt: new Date()
            }, { session }).exec();

            return {
                status: 200,
                message: "Comment and its replies deleted successfully"
            }
        })
    }
    async toggleLikeComment(ctx: CommentContext) { }

    async getAllPostComments(ctx: CommentContext) {
        // TODO: implement pagination

        const comments = await Comment.aggregate<IComment>([
            {
                $match: {
                    postId: new Types.ObjectId(ctx.postId),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author"
                },
            },
            {
                $unwind: "$author"
            },
            {
                $sort: { createdAt: -1 }
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
                    "author.avatarUrl": 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]).exec();

        return {
            status: 200,
            message: "Comments fetched successfully",
            comments
        }
    }
}


export const commentService = new CommentService();