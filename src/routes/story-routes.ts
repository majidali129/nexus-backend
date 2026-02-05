
import { addStory, getStoryLikes, getStoryViews, getUserStories, removeStory, toggleLikeStory, updateStory, viewStory } from "@/controllers/story-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";

const router = Router()

router.use(verifyJWT);

router.route('/').post(addStory).get(getUserStories);
router.route('/:storyId').patch(updateStory).delete(removeStory).get(viewStory)
router.route('/:storyId/toggle-like').post(toggleLikeStory);
router.route('/:storyId/views').get(getStoryViews);
router.route('/:storyId/likes').get(getStoryLikes);

export { router as storyRouter }
export default router;