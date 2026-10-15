import { Router } from "express";
import authController from "../controllers/auth.controller";

const router = Router();

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Auth Routes
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

router.post("/login", authController.login);
router.post("/signup", authController.signUp);
router.post("/tokens", authController.getTokens);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-user", authController.verifyUser);
router.post("/verify-otp", authController.verifyOTP);

export default router;
