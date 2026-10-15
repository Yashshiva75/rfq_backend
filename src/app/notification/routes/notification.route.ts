import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { passportAuth } from "../../../middleware";

const router = Router();

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Notification Routes
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

router.get("/", passportAuth.authenticate, notificationController.list);

export default router;
