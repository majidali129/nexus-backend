import { postService } from "@/services/post-service";
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

export const createPost = asyncHandler(async (req, res) => {
    const result = await postService.createPost()
    return apiResponse(res, 201, "Post created successfully", result);
})

export const updatePost = asyncHandler(async (req, res) => { })

export const deletePost = asyncHandler(async (req, res) => { })

export const getPostDetails = asyncHandler(async (req, res) => { })

export const getAllPosts = asyncHandler(async (req, res) => { })