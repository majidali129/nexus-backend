
import { addStory, getStoryViews, getUserStories, removeStory, updateStory, viewStory } from "@/controllers/story-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";
import { likeRouter } from "./like-routes";
import { validateParams } from "@/middlewares/validate-params";

const router = Router()

router.use('/:resourceId/likes', likeRouter);

router.use(verifyJWT);

router.route('/').post(addStory).get(getUserStories);
router.route('/:storyId').patch(validateParams('storyId', true), updateStory).delete(validateParams('storyId', true), removeStory).get(validateParams('storyId', true), viewStory)
router.route('/:storyId/views').get(validateParams('storyId', true), getStoryViews);

export { router as storyRouter }
export default router;