

import { createComment, deleteComment, getAllPostComments, getCommentReplies, updateComment } from "@/controllers/comment-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { commentUpdateSchema, createCommentSchema } from "@/schemas/comment";
import { Router } from "express";
import { likeRouter } from "./like-routes";

const router = Router({ mergeParams: true });
router.use('/:resourceId/likes', likeRouter);


router.use(verifyJWT);
router.route('/').post(validateBody(createCommentSchema), createComment).get(getAllPostComments);
router.route('/:commentId').patch(validateBody(commentUpdateSchema), updateComment).delete(deleteComment);

router.route('/:commentId/replies').get(getCommentReplies)

export { router as commentRouter };
export default router;