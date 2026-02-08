import { getUserProfile } from "@/controllers/user-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";
import { followRouter } from "./follow-routes";
import { validateParams } from "@/middlewares/validate-params";


const router = Router()
router.use('/:username/follow', followRouter) // delegate follow related routes to followRouter

router.use(verifyJWT);

router.get('/:username/profile', validateParams('username', false), getUserProfile);




export { router as userRouter }
export default router