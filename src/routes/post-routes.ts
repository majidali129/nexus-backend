
import { createPost, deletePost, getAllPosts, getPostDetails, getPostLikes, togglePostLike, updatePost } from "@/controllers/post-controller";
import { validateBody } from "@/middlewares/validate-request";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { createPostSchema, updatedPostSchema } from "@/schemas/post";
import { Router } from "express";
import { commentRouter } from "./post-comment-routes";
import { bookmarkRouter } from "./bookmark-routes";
import { validateParams } from "@/middlewares/validate-params";

const router = Router()

router.use('/:postId/comments', commentRouter)
router.use('/:postId/bookmarks', bookmarkRouter)

router.use(verifyJWT);
router.route('/').post(validateBody(createPostSchema), createPost).get(getAllPosts);

router.route('/:postId').patch(validateParams('postId', true), validateBody(updatedPostSchema), updatePost).get(validateParams('postId', true), getPostDetails).delete(validateParams('postId', true), deletePost);
router.route('/:postId/likes').put(validateParams('postId', true), togglePostLike)
.get(validateParams('postId', true), getPostLikes);

export { router as postRouter };
export default router;