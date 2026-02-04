
import { createPost, deletePost, getAllPosts, getPostDetails, updatePost } from "@/controllers/post-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router()

router.use(verifyJWT);
router.route('/').post(createPost).get(getAllPosts);
router.route('/:postId').patch(updatePost).get(getPostDetails).delete(deletePost);

export { router as authRouter }
export default router;