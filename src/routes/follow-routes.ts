import { getAllFollowRequests, respondToFollowRequest, sendFollowRequest } from "@/controllers/follow-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";


const router = Router({ mergeParams: true }) // because we need to access :username from parent router (userRouter)
// /users/:username/follow/ - send follow request
// /follow/follow-requests - get all follow requests for the authenticated user
// /follow/:followReqId/respond - accept or reject follow request


router.use(verifyJWT)
router.put('/', sendFollowRequest);
router.put('/:followReqId/respond', respondToFollowRequest);
router.get('/follow-requests', getAllFollowRequests);



export { router as followRouter }
export default router