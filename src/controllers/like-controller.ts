import { likeService } from "@/services/like-service";
import { LikeContext, ResourceType } from "@/types/like";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";

const getCtx = (req: Request): LikeContext => {
    return {
        userId: req.user.id,
        userRole: req.user.role,
        resourceId: req.params.resourceId as string,
        resourceType: req.params.resourceType as ResourceType
    }
}

export const toggleLike = asyncHandler(async (req, res) => {
    const { status, message } = await likeService.toggleLike(getCtx(req))
    return apiResponse(res, status, message, null);
})
export const getLikes = asyncHandler(async (req, res) => {
    const { status, message, likes } = await likeService.getLikes(getCtx(req));
    return apiResponse(res, status, message, { likes });
})