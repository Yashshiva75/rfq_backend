/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : File Attachment Routes
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
import { Router } from "express";
import fileController from "../controllers/file.controller";
import { passportAuth, uploadMiddleware } from "../../../middleware";

const router = Router();

// Upload PDF/XLSX file attachment (multipart/form-data with field 'file')
router.post(
  "/upload",
  passportAuth.authenticate,
  uploadMiddleware.single("file"),
  fileController.upload
);

// List attachments (with ?rfqId=X or ?quotationId=Y)
router.get("/", passportAuth.authenticate, fileController.list);

// Get file attachment details / download link with privacy guards
router.get("/:id", passportAuth.authenticate, fileController.getById);

// Delete file attachment
router.delete("/:id", passportAuth.authenticate, fileController.delete);

export default router;
