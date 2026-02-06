import { getUserProfile, respondToFollowRequest, sendFollowRequest } from "@/controllers/user-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";


const router = Router()

router.use(verifyJWT);

router.get('/users/:username', getUserProfile);

router.put('/users/:username/follow', sendFollowRequest);
router.put('/users/:username/follow/respond/:followReqId', respondToFollowRequest);




export { router as userRouter }
export default router