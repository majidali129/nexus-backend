

import { bookmarkPost, getAllBookmarks, removeBookmark } from "@/controllers/bookmark-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router()

router.use(verifyJWT);
router.route('/').get(getAllBookmarks);
router.route('/add').post(bookmarkPost);
router.route('/:bookmarkId/remove').delete(removeBookmark);

export { router as postBookmarkRouter };
export default router;