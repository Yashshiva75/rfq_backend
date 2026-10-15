import { Router } from "express";
import fileController from "../controllers/file.controller";
import { passportAuth } from "../../../middleware";

const router = Router();

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : File Attachment Routes
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

router.get("/", passportAuth.authenticate, fileController.list);

export default router;
