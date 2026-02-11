import {
  getUserProfile,
  searchUsers,
  updateProfile,
  uploadCoverPhoto,
  uploadProfilePhoto,
} from "@/controllers/user-controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { Router } from "express";
import { followRouter } from "./follow-routes";
import { validateParams } from "@/middlewares/validate-params";
import { upload } from "@/lib/multer";
import { validateBody } from "@/middlewares/validate-request";
import { updateProfileSchema } from "@/schemas/user";

const router = Router();
router.use("/:username/follow", followRouter); // delegate follow related routes to followRouter

router.use(verifyJWT);

router.get("/:username/profile", validateParams("username", false), getUserProfile);
router.put(
  "/:userId/profile",
  validateParams("userId", true),
  validateBody(updateProfileSchema),
  updateProfile,
);
router.put(
  "/:userId/photos/profile",
  validateParams("userId", true),
  upload.single("profilePhoto"),
  uploadProfilePhoto,
);
router.put(
  "/:userId/photos/cover",
  validateParams("userId", true),
  upload.single("coverPhoto"),
  uploadCoverPhoto,
);

router.get("/search", searchUsers);

export { router as userRouter };
export default router;
