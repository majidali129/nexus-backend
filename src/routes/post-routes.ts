
import { createPost, deletePost, getAllPosts, getPostDetails, updatePost } from "@/controllers/post-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { createPostSchema, updatedPostSchema } from "@/schemas/post";
import { Router } from "express";
import { postCommentRouter } from "./post-comment-routes";
import { postLikeRouter } from "./post-like-routes";

const router = Router()

router.use('/:postId/comments', postCommentRouter)
router.use('/:postId/likes', postLikeRouter);


router.use(verifyJWT);
router.route('/').post(validateBody(createPostSchema), createPost).get(getAllPosts);
router.route('/:postId').patch(validateBody(updatedPostSchema), updatePost).get(getPostDetails).delete(deletePost);

export { router as postRouter };
export default router;