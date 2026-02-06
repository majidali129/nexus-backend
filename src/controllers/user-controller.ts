import { userService } from "@/services/user-service";
import { FOLLOW_STATUS } from "@/types/follow";
import { UserContext } from "@/types/user";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";

const getCtx = (req: Request): UserContext => {
    return {
        currentUserId: req.user.id,
        currentUsername: req.user.username,
        targetUsername: req.params.username as string, // for target users profile
    }
}

export const getUserProfile = asyncHandler(async (req, res) => {
    const { status, message, profile } = await userService.getUserProfile(getCtx(req));
    return apiResponse(res, status, message, profile);
})

export const sendFollowRequest = asyncHandler(async (req, res) => {
    const { status, message } = await userService.sendFollowRequest(getCtx(req));
    return apiResponse(res, status, message, null);
})

export const respondToFollowRequest = asyncHandler(async (req, res) => {
    const { status, message } = await userService.respondToFollowRequest(getCtx(req), req.params.followReqId as string, req.query.status as FOLLOW_STATUS.ACCEPTED | FOLLOW_STATUS.BLOCKED);
    return apiResponse(res, status, message, null);
});

export const getAllFollowRequests = asyncHandler(async (req, res) => {
    const { status, message, followRequests, pagination } = await userService.getAllFollowRequests(getCtx(req), req.query);
    return apiResponse(res, status, message, {
        followRequests,
        pagination,
    });
})