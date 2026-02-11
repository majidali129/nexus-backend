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
  };
};

export const getUserProfile = asyncHandler(async (req, res) => {
  const { status, message, profile } = await userService.getUserProfile(getCtx(req));
  return apiResponse(res, status, message, { profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { status, message, profile } = await userService.updateProfile(getCtx(req), req.body);
  return apiResponse(res, status, message, { profile });
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { status, message, profilePhoto } = await userService.uploadProfilePhoto(
    getCtx(req),
    req.file!,
  );
  return apiResponse(res, status, message, { profilePhoto });
});
export const uploadCoverPhoto = asyncHandler(async (req, res) => {
  const { status, message, coverPhoto } = await userService.uploadCoverPhoto(
    getCtx(req),
    req.file!,
  );
  return apiResponse(res, status, message, { coverPhoto });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { status, message, users, pagination } = await userService.searchUsers(
    getCtx(req),
    req.query as { q: string; limit?: string; skip?: string },
  );
  return apiResponse(res, status, message, { users, pagination });
});
