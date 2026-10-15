/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Get & Guard File Access Service
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Repos & Helpers
import fileRepo from "../repos/file.repo";
import rfqHelper from "../../rfq/helper/rfq.helper";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

const getFile = async (container: any) => {
  try {
    const {
      input: { params, logged_in_user },
    } = container;

    const fileId = Number(params.id);
    const file = await fileRepo.getFileById(fileId);

    if (!file) {
      const error: any = new Error("File attachment not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    const userId = Number(logged_in_user?.id || logged_in_user?.user_id);
    const isAdmin = rfqHelper.isAdmin(logged_in_user);
    const isVendor = rfqHelper.isVendor(logged_in_user);

    // If Admin or the original uploader, grant access
    if (isAdmin || file.uploadedBy === userId) {
      container.output.result = {
        ...file,
        url: file.storageKey,
      };
      return;
    }

    // Access control for RFQ attachments:
    // - RFQ buyer: Allowed
    // - Any vendor: Allowed to see buyer specifications
    if (file.rfqId) {
      const isRfqBuyer = file.rfq?.createdById === userId;
      if (isRfqBuyer || isVendor) {
        container.output.result = {
          ...file,
          url: file.storageKey,
        };
        return;
      }
    }

    // Access control for Quotation attachments:
    // - Quotation vendor: Allowed
    // - RFQ buyer evaluating quotes: Allowed
    // - Other competing vendors: STRICTLY FORBIDDEN
    if (file.quotationId) {
      const isQuoteVendor = file.quotation?.vendorId === userId;
      const isRfqBuyer = file.quotation?.rfq?.createdById === userId;

      if (isQuoteVendor || isRfqBuyer) {
        container.output.result = {
          ...file,
          url: file.storageKey,
        };
        return;
      }

      const error: any = new Error("Access denied. You cannot view another vendor's quotation attachments.");
      error.statusCode = StatusCodes.FORBIDDEN;
      throw error;
    }

    // Fallback: general files
    container.output.result = {
      ...file,
      url: file.storageKey,
    };
  } catch (error) {
    throw error;
  }
};

export default getFile;
