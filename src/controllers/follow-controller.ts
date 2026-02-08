import { followService } from "@/services/follow-service";
import { FollowContext } from "@/types/follow";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";

const getCtx = (req: Request): FollowContext => {
    return {
        currentUserId: req.user.id,
        currentUsername: req.user.username,
        targetUsername: req.params.username as string, // for sending follow requests
        followReqId: req.params.followReqId as string, // for responding to follow requests
    }
}


export const sendFollowRequest = asyncHandler(async (req, res) => {
    const { status, message } = await followService.sendFollowRequest(getCtx(req));
    return apiResponse(res, status, message, null);
})

export const respondToFollowRequest = asyncHandler(async (req, res) => {
    const { status, message } = await followService.respondToFollowRequest(getCtx(req), req.query);
    return apiResponse(res, status, message, null);
});

export const getAllFollowRequests = asyncHandler(async (req, res) => {
    const { status, message, followRequests, pagination } = await followService.getAllFollowRequests(getCtx(req), req.query);
    return apiResponse(res, status, message, {
        followRequests,
        pagination,
    });
});