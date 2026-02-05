

import { createComment, deleteComment, getAllPostComments, toggleLikeComment, updateComment } from "@/controllers/comment-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router()

router.use(verifyJWT);
router.route('/').post(createComment).get(getAllPostComments);
router.route('/:commentId').patch(updateComment).delete(deleteComment);
router.route('/:commentId/toggle-like').post(toggleLikeComment);

export { router as postCommentRouter };
export default router;