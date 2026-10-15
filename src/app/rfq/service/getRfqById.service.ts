// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import rfqRepo from "../repos/rfq.repo";

// Import Helpers
import rfqHelper from "../helper/rfq.helper";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";
import { RfqStatus } from "../../../generated/prisma/enums";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Get RFQ by ID Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const getRfqById = async (container: any) => {
  try {
    const {
      input: { params, logged_in_user },
    } = container;

    const id = Number(params?.id);
    if (isNaN(id) || id <= 0) {
      const err: any = new Error("Valid numeric RFQ ID is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const rfq = await rfqRepo.getRfqById(id);
    if (!rfq) {
      const err: any = new Error(`RFQ with ID ${id} was not found`);
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }

    // Permission / Visibility Check:
    // If RFQ is in DRAFT status, only the creator or Admin can view it.
    // If RFQ is PUBLISHED, all vendors, buyers, and admins can view it.
    const user = logged_in_user;
    const isAdmin = rfqHelper.isAdmin(user);
    if (rfq.status === RfqStatus.DRAFT && rfq.createdById !== user?.id && !isAdmin) {
      const err: any = new Error("You do not have permission to view this draft RFQ");
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
    }

    container.derived.rfq = rfq;
    container.output.result = rfq;
  } catch (error) {
    throw error;
  }
};

export default getRfqById;
