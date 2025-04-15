import { Router } from "express";
import ProfileController from "../controllers/ProfileController.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/profile").get(ProfileController.index);
router
  .route("/profile")
  .put(uploadImage.single("avatar"), ProfileController.update);

export default router;
