import { Router } from "express";
import NewsController from "../controllers/NewsController.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
// import { useRedisLData } from "../middlewares/redis.middleware.js";

const router = Router({ mergeParams: true });

// router.route("").get(useRedisLData, NewsController.index); // with custom-redis middleware
router.route("").get(NewsController.index);
router
  .route("")
  .post(authenticate, uploadImage.single("image"), NewsController.store);
router
  .route("/:id")
  .put(authenticate, uploadImage.single("image"), NewsController.update);
// router.route("/:id").get(useRedisLData, NewsController.show); // with custom-redis middleware
router.route("/:id").get(NewsController.show);
router.route("/:id").delete(authenticate, NewsController.destroy);

export default router;
