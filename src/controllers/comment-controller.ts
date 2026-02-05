import { commentService } from "@/services/comment-service";
import { CommentContext } from "@/types/comment";
import { PostContext } from "@/types/post";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";
const getCtx = (req: Request): CommentContext => {
    return {
        userId: req.user.id,
        userRole: req.user.role,
        postId: req.params.postId as string,
        commentId: req.params.commentId as string,
    }
}

export const createComment = asyncHandler(async (req, res) => {
    const { status, message, comment } = await commentService.createComment(getCtx(req), req.body);
    return apiResponse(res, status, message, comment);
})

export const updateComment = asyncHandler(async (req, res) => {
    const { status, message, comment } = await commentService.updateComment(getCtx(req), req.body);
    return apiResponse(res, status, message, comment);
})

export const deleteComment = asyncHandler(async (req, res) => {
    const { status, message } = await commentService.deleteComment(getCtx(req));
    return apiResponse(res, status, message, null);
})

export const toggleLikeComment = asyncHandler(async (req, res) => { })

export const getAllPostComments = asyncHandler(async (req, res) => {
    const { status, message, comments } = await commentService.getAllPostComments(getCtx(req));
    return apiResponse(res, status, message, comments);
})