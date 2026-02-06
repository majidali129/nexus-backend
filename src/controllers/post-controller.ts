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
    const { status, message, post } = await postService.createPost(getCtx(req), req.body)
    return apiResponse(res, status, message, { post });
})

export const updatePost = asyncHandler(async (req, res) => {
    const { status, message, post } = await postService.updatePost(getCtx(req), req.body)
    return apiResponse(res, status, message, { post });
})

export const deletePost = asyncHandler(async (req, res) => {
    const { status, message } = await postService.deletePost(getCtx(req))
    return apiResponse(res, status, message, null);
})

export const getPostDetails = asyncHandler(async (req, res) => {
    const { status, message, post } = await postService.getPostDetails(getCtx(req))
    return apiResponse(res, status, message, { post });
})

export const getAllPosts = asyncHandler(async (req, res) => {
    const { status, message, posts } = await postService.getAllPosts();
    return apiResponse(res, status, message, { posts });
})