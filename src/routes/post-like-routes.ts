
import { getLikes, toggleLike } from "@/controllers/like-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router({ mergeParams: true });
// /posts/:postId/likes

router.use(verifyJWT);
router.route('/toggle-like').post(toggleLike); // /posts/:postId/likes/toggle-like?resource=post|comment|story
router.route('/').get(getLikes); // /posts/:postId/likes?resource=post|comment|story

export { router as postLikeRouter }
export default router;