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

export const bookmarkPost = asyncHandler(async (req, res) => { })

export const removeBookmark = asyncHandler(async (req, res) => { })

export const getAllBookmarks = asyncHandler(async (req, res) => { })