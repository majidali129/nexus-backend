import { getUserProfile, toggleFollowUser } from "@/controllers/user-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";


const router = Router()

router.use(verifyJWT);

router.get('/users/:username', getUserProfile);

router.put('/users/:username/follow', toggleFollowUser);




export { router as userRouter }
export default router