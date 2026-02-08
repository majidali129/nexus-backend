

import { bookmarkPost, getAllBookmarks, removeBookmark } from "@/controllers/bookmark-controller";
import { validateParams } from "@/middlewares/validate-params";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router({ mergeParams: true })
// /posts/:postId/bookmarks

router.use(verifyJWT);
router.route('/').get(getAllBookmarks).put(bookmarkPost)
router.route('/:bookmarkId').delete(validateParams('bookmarkId', true), removeBookmark);

export { router as bookmarkRouter };
export default router;