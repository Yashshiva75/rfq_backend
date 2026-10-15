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
✨: @uses : Compare RFQ Quotations Service (Side-by-side comparison for buyers/admins)
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const compareRfqQuotes = async (container: any) => {
  try {
    const {
      input: { params, query, logged_in_user },
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

    const rfq = await rfqRepo.getRfqById(id);
    if (!rfq) {
      const err: any = new Error(`RFQ with ID ${id} was not found`);
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }

    // Permission check: only RFQ creator or Admin can access comparison view
    const isAdmin = rfqHelper.isAdmin(user);
    if (rfq.createdById !== user.id && !isAdmin) {
      const err: any = new Error(
        "Only the RFQ creator (buyer) or an administrator can access the quotation comparison view"
      );
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
    }

    const { sortBy, sortOrder } = query || {};

    const comparison = await rfqRepo.compareRfqQuotes(id, {
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    });

    container.derived.comparison = comparison;
    container.output.result = comparison;
    container.output.message = `Comparison for RFQ #${id} "${rfq.title}" generated successfully`;
  } catch (error) {
    throw error;
  }
};

export default compareRfqQuotes;
