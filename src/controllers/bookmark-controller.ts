import { bookmarkService } from "@/services/bookmark-service";
import { BookmarkContext } from "@/types/bookmark";
import { apiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { Request } from "express";
const getCtx = (req: Request): BookmarkContext => {
    return {
        userId: req.user.id,
        postId: req.params.postId as string
    }
}

export const bookmarkPost = asyncHandler(async (req, res) => {
    const { status, message, bookmark } = await bookmarkService.bookmarkPost(getCtx(req));
    return apiResponse(res, status, message, { bookmark });
})

export const removeBookmark = asyncHandler(async (req, res) => {
    const { status, message, bookmark } = await bookmarkService.removeBookmark(getCtx(req));
    return apiResponse(res, status, message, { bookmark });
})

export const getAllBookmarks = asyncHandler(async (req, res) => {
    const { status, message, bookmarks } = await bookmarkService.getAllBookmarks(getCtx(req));
    return apiResponse(res, status, message, { bookmarks });
})