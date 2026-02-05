import { UserContext } from "@/types/user";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";

const getCtx = (req: Request): UserContext => {
    return {
        userId: req.user.id,
        username: req.user.username || req.params.username as string,
    }
}

export const getUserProfile = asyncHandler(async (req, res) => { })

export const toggleFollowUser = asyncHandler(async (req, res) => { })