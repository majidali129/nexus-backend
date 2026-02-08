
import { createPost, deletePost, getAllPosts, getPostDetails, updatePost } from "@/controllers/post-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { createPostSchema, updatedPostSchema } from "@/schemas/post";
import { Router } from "express";
import { commentRouter } from "./post-comment-routes";
import { likeRouter } from "./like-routes";
import { bookmarkRouter } from "./bookmark-routes";
import { validateParams } from "@/middlewares/validate-params";

const router = Router()

router.use('/:postId/comments', commentRouter)
router.use('/:postId/bookmarks', bookmarkRouter)
router.use('/:resourceId/likes', likeRouter);


router.use(verifyJWT);
router.route('/').post(validateBody(createPostSchema), createPost).get(getAllPosts);

router.route('/:postId').patch(validateParams('postId', true), validateBody(updatedPostSchema), updatePost).get(validateParams('postId', true), getPostDetails).delete(validateParams('postId', true), deletePost);

export { router as postRouter };
export default router;