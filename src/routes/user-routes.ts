import { getUserProfile } from "@/controllers/user-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";
import { followRouter } from "./follow-routes";


const router = Router({ mergeParams: true })
router.use('/:username/follow', followRouter) // delegate follow related routes to followRouter

router.use(verifyJWT);

router.get('/:username/profile', getUserProfile);




export { router as userRouter }
export default router