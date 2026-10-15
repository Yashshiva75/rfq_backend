/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Delete File Service
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Repos & Helpers
import fileRepo from "../repos/file.repo";
import rfqHelper from "../../rfq/helper/rfq.helper";
import { deleteFromCloudinary } from "../../../library/cloudinary.library";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

const deleteFile = async (container: any) => {
  try {
    const {
      input: { params, logged_in_user },
    } = container;

    const fileId = Number(params.id);
    const file = await fileRepo.getFileById(fileId);

    if (!file) {
      const error: any = new Error("File not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    const userId = Number(logged_in_user?.id || logged_in_user?.user_id);
    const isAdmin = rfqHelper.isAdmin(logged_in_user);

    if (!isAdmin && file.uploadedBy !== userId) {
      const error: any = new Error("Only the uploader or an Admin can delete this file");
      error.statusCode = StatusCodes.FORBIDDEN;
      throw error;
    }

    // Try deleting from Cloudinary if public_id can be extracted from URL
    try {
      if (file.storageKey && file.storageKey.includes("cloudinary.com")) {
        const parts = file.storageKey.split("/");
        const filenameWithExt = parts.slice(-2).join("/"); // folder/filename
        const publicId = filenameWithExt.replace(/\.[^/.]+$/, "");
        await deleteFromCloudinary(publicId, "raw");
      }
    } catch (cErr) {
      console.warn("Could not delete from Cloudinary:", cErr);
    }

    await fileRepo.deleteFile(fileId);
    container.output.result = { message: "File attachment deleted successfully", id: fileId };
  } catch (error) {
    throw error;
  }
};

export default deleteFile;
