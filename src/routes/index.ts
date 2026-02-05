import { Router } from "express";
import { authRouter } from "./auth-routes";
import { postRouter } from "./post-routes";
import { postCommentRouter } from "./post-comment-routes";
import { postLikeRouter } from "./post-like-routes";
import { postBookmarkRouter } from "./post-bookmark-routes";
import { notificationRouter } from "./notification-routes";
import { storyRouter } from "./story-routes";
import { accountRouter } from "./account-routes";
import { userRouter } from "./user-routes";



const router = Router()


router.use('/auth', authRouter);
router.use('/posts', postRouter)
router.use('/comments', postCommentRouter);
router.use('/likes', postLikeRouter);
router.use('/bookmarks', postBookmarkRouter);
router.use('/notification', notificationRouter);
router.use('/stories', storyRouter);
router.use('/accounts', accountRouter);
router.use('/users', userRouter);


export { router as appRouter }
export default router;