

import { bookmarkPost, getAllBookmarks, removeBookmark } from "@/controllers/bookmark-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router({ mergeParams: true })
// /posts/:postId/bookmarks

router.use(verifyJWT);
router.route('/').get(getAllBookmarks).put(bookmarkPost)
router.route('/:bookmarkId').delete(removeBookmark);

export { router as bookmarkRouter };
export default router;