import {
  createComment,
  deleteComment,
  getAllPostComments,
  getCommentReplies,
  updateComment,
} from "@/controllers/comment-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { commentUpdateSchema, createCommentSchema } from "@/schemas/comment";
import { Router } from "express";
import { validateParams } from "@/middlewares/validate-params";

const router = Router({ mergeParams: true });

router.use(verifyJWT);
router.route("/").post(validateBody(createCommentSchema), createComment).get(getAllPostComments);
router
  .route("/:commentId")
  .patch(validateParams("commentId", true), validateBody(commentUpdateSchema), updateComment)
  .delete(validateParams("commentId", true), deleteComment);

router.route("/:commentId/replies").get(validateParams("commentId", true), getCommentReplies);

export { router as commentRouter };
export default router;
