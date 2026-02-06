

import { createComment, deleteComment, getAllPostComments, updateComment } from "@/controllers/comment-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { commentUpdateSchema, createCommentSchema } from "@/schemas/comment";
import { Router } from "express";

const router = Router({ mergeParams: true });
// /posts/:postId/comments
// /posts/:postId/comments/:commentId

router.use(verifyJWT);
router.route('/').post(validateBody(createCommentSchema), createComment).get(getAllPostComments);
router.route('/:commentId').patch(validateBody(commentUpdateSchema), updateComment).delete(deleteComment);

export { router as postCommentRouter };
export default router;