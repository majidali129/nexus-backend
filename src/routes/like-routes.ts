
import { getLikes, toggleLike } from "@/controllers/like-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router({ mergeParams: true });
// /resource/:resourceId/likes

router.use(verifyJWT);
router.route('/').put(toggleLike);
router.route('/').get(getLikes);

export { router as likeRouter }
export default router;