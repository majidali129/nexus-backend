import { PostContext } from "@/types/post";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";
const getCtx = (req: Request): PostContext => {
    return {
        userId: req.user.id,
        role: req.user.role,
        postId: req.params.postId as string
    }
}

export const createComment = asyncHandler(async (req, res) => { })

export const updateComment = asyncHandler(async (req, res) => { })

export const deleteComment = asyncHandler(async (req, res) => { })

export const toggleLikeComment = asyncHandler(async (req, res) => { })

export const getAllPostComments = asyncHandler(async (req, res) => { })