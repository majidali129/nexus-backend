
import { createPost, deletePost, getAllPosts, getPostDetails, updatePost } from "@/controllers/post-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { createPostSchema, updatedPostSchema } from "@/schemas/post";
import { Router } from "express";
import { commentRouter } from "./post-comment-routes";
import { likeRouter } from "./like-routes";

const router = Router()

router.use('/:postId/comments', commentRouter)
router.use('/:resourceId/likes', likeRouter);


router.use(verifyJWT);
router.route('/').post(validateBody(createPostSchema), createPost).get(getAllPosts);
router.route('/:postId').patch(validateBody(updatedPostSchema), updatePost).get(getPostDetails).delete(deletePost);

export { router as postRouter };
export default router;