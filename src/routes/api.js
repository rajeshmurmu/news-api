import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const router = Router({ mergeParams: true });

router.route("/auth/register").post(AuthController.register);
router.route("/auth/login").post(AuthController.login);
router.route("/auth/logout").get(authenticate, AuthController.logout);
router.route("/auth/send-email").post(AuthController.sendEmail);

// * profile routes
import profileRoutes from "./profile.routes.js";

router.use("/users", authenticate, profileRoutes);

// * profile routes
import newsRoutes from "./news.routes.js";

router.use("/news", newsRoutes);

export default router;
