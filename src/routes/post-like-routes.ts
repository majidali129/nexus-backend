
import { getPostLikes, toggleLikePost } from "@/controllers/like-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router()

router.use(verifyJWT);
router.route('/toggle-like').post(toggleLikePost);
router.route('/').get(getPostLikes)

export { router as postLikeRouter }
export default router;