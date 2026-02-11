import { Router } from "express";
import { authRouter } from "./auth-routes";
import { postRouter } from "./post-routes";
import { commentRouter } from "./post-comment-routes";
import { bookmarkRouter } from "./bookmark-routes";
import { notificationRouter } from "./notification-routes";
import { storyRouter } from "./story-routes";
import { accountRouter } from "./account-routes";
import { userRouter } from "./user-routes";
import { followRouter } from "./follow-routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);
router.use("/bookmarks", bookmarkRouter);
router.use("/notification", notificationRouter);
router.use("/stories", storyRouter);
router.use("/accounts", accountRouter);
router.use("/users", userRouter);
router.use("/follow", followRouter);

export { router as appRouter };
export default router;
