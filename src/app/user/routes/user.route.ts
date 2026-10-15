import { Router } from "express";
import userController from "../controllers/user.controller";
import { passportAuth, authorization } from "../../../middleware";

const router = Router();

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : User Routes
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Get current user profile
router.get("/profile", passportAuth.authenticate, userController.getProfile);

// Get all users (Admin only)
router.get(
  "/",
  passportAuth.authenticate,
  authorization.hasRole("admin"),
  userController.list
);

// Get user by ID (Authenticated)
router.get("/:id", passportAuth.authenticate, userController.getById);

export default router;
