
import { addStory, getStoryViews, getUserStories, removeStory, updateStory, viewStory } from "@/controllers/story-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";
import { likeRouter } from "./like-routes";

const router = Router()

router.use('/:resourceId/likes', likeRouter);

router.use(verifyJWT);

router.route('/').post(addStory).get(getUserStories);
router.route('/:storyId').patch(updateStory).delete(removeStory).get(viewStory)
router.route('/:storyId/views').get(getStoryViews);

export { router as storyRouter }
export default router;