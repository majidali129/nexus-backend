import { userService } from "@/services/user-service";
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
    return apiResponse(res, status, message, { profile });
})
