// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import rfqRepo from "../repos/rfq.repo";

// Import Helpers
import rfqHelper from "../helper/rfq.helper";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Delete or Cancel RFQ Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const deleteRfq = async (container: any) => {
  try {
    const {
      input: { params, logged_in_user },
    } = container;

    const user = logged_in_user;
    if (!user || !user.id) {
      const err: any = new Error(
        i18n.__("auth.unauthorized") || "Authentication required"
      );
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }

    const id = Number(params?.id);
    if (isNaN(id) || id <= 0) {
      const err: any = new Error("Valid numeric RFQ ID is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const existingRfq = await rfqRepo.getRfqById(id);
    if (!existingRfq) {
      const err: any = new Error(`RFQ with ID ${id} was not found`);
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }

    // Permission check: only creator or Admin can delete/cancel
    const isAdmin = rfqHelper.isAdmin(user);
    if (existingRfq.createdById !== user.id && !isAdmin) {
      const err: any = new Error(
        i18n.__("auth.forbidden") || "You do not have permission to delete this RFQ"
      );
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
    }

    await rfqRepo.deleteRfq(id, user.id);

    container.output.result = { id };
    container.output.message = "RFQ removed or cancelled successfully";
  } catch (error) {
    throw error;
  }
};

export default deleteRfq;
