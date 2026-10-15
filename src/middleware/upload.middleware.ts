/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Multer File Upload Middleware
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
import multer from "multer";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";

// Use memory storage to stream directly to Cloudinary
const storage = multer.memoryStorage();

// Allowed MIME types and extensions for PDF and XLSX
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
];

const ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".xls"];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const originalName = file.originalname || "";
  const ext = originalName.toLowerCase().slice(originalName.lastIndexOf("."));
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeAllowed || isExtAllowed) {
    cb(null, true);
  } else {
    const error: any = new Error(
      "Invalid file type. Only PDF and XLSX/XLS files are allowed."
    );
    error.statusCode = StatusCodes.BAD_REQUEST;
    cb(error);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter,
});

export default upload;
