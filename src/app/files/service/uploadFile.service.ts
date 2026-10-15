/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Upload File to Cloudinary Service (with local disk fallback)
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Libraries & Helpers
import prisma from "../../../library/prisma.library";
import { uploadBufferToCloudinary } from "../../../library/cloudinary.library";
import fileRepo from "../repos/file.repo";
import rfqHelper from "../../rfq/helper/rfq.helper";
import config from "../../../config/constant";

// Import Thirdparty
import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";

const uploadFile = async (container: any) => {
  try {
    const {
      input: { file, body, logged_in_user },
    } = container;

    if (!file) {
      const error: any = new Error("File is required. Only PDF and XLSX files are accepted.");
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }

    const userId = Number(logged_in_user?.id || logged_in_user?.user_id);
    const isAdmin = rfqHelper.isAdmin(logged_in_user);

    const rfqId = body?.rfqId ? Number(body.rfqId) : undefined;
    const quotationId = body?.quotationId ? Number(body.quotationId) : undefined;

    let targetFolder = "mini_rfq/general";
    let quotationRecord: any = null;

    // 1. If linking to Quotation: verify existence, vendor ownership and deadline
    if (quotationId) {
      quotationRecord = await prisma.quotation.findUnique({
        where: { id: quotationId },
        include: { rfq: true },
      });

      if (!quotationRecord) {
        const error: any = new Error("Quotation not found");
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
      }

      if (!isAdmin && quotationRecord.vendorId !== userId) {
        const error: any = new Error("Only the submitting vendor or an Admin can attach documents to this quotation");
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
      }

      // Deadline check
      if (quotationRecord.rfq && new Date(quotationRecord.rfq.deadline).getTime() < Date.now()) {
        const error: any = new Error("Cannot attach files after the RFQ submission deadline has passed");
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
      }

      targetFolder = `mini_rfq/quotations/quote_${quotationId}`;
    } else if (rfqId) {
      // 2. If linking solely to RFQ (Specification / Drawings): verify RFQ existence and buyer/admin ownership
      const rfq = await prisma.rFQ.findUnique({
        where: { id: rfqId },
      });

      if (!rfq) {
        const error: any = new Error("RFQ not found");
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
      }

      if (!isAdmin && rfq.createdById !== userId) {
        const error: any = new Error("Only the RFQ creator or an Admin can attach specification files to this RFQ");
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
      }

      targetFolder = `mini_rfq/rfqs/rfq_${rfqId}`;
    }

    let fileUrl = "";

    // 3. Attempt Cloudinary upload first
    try {
      if (config.cloudinary.CLOUD_NAME && config.cloudinary.API_KEY && config.cloudinary.API_SECRET) {
        const uploadResult = await uploadBufferToCloudinary(file.buffer, {
          folder: targetFolder,
          originalName: file.originalname,
          resourceType: "raw",
        });
        fileUrl = uploadResult.secure_url;
      } else {
        throw new Error("Cloudinary credentials not configured");
      }
    } catch (cErr: any) {
      console.warn("Cloudinary upload failed or missing permissions; falling back to local storage:", cErr?.message || cErr);

      // Local fallback
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.originalname);
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, file.buffer);

      const backendUrl = config.app.BACKEND_URL || "http://localhost:5000";
      fileUrl = `${backendUrl}/uploads/${safeName}`;
    }

    // 4. Save metadata in database
    const fileRecord = await fileRepo.createFile({
      fileName: file.originalname,
      storageKey: fileUrl,
      mimeType: file.mimetype,
      uploadedBy: userId,
      rfqId: rfqId || quotationRecord?.rfqId || undefined,
      quotationId,
    });

    container.output.result = {
      ...fileRecord,
      url: fileUrl,
    };
  } catch (error) {
    throw error;
  }
};

export default uploadFile;
