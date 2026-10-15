// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import quotationRepo from "../repos/quotation.repo";

// Import Helpers
import rfqHelper from "../../rfq/helper/rfq.helper";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";
import { QuotationStatus } from "../../../generated/prisma/enums";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Update Quotation Status Service / Award Flow
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const updateQuotationStatus = async (container: any) => {
  try {
    const {
      input: { params, body, logged_in_user },
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
      const err: any = new Error("Valid numeric quotation ID is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const { status } = body;
    if (!status || !Object.values(QuotationStatus).includes(status.toUpperCase())) {
      const err: any = new Error(
        `Invalid status. Valid values: ${Object.values(QuotationStatus).join(", ")}`
      );
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const upperStatus = status.toUpperCase() as QuotationStatus;
    const isAdmin = rfqHelper.isAdmin(user);

    const updated = await quotationRepo.updateQuotationStatus(
      id,
      upperStatus,
      user.id,
      isAdmin
    );

    container.derived.quotation = updated;
    container.output.result = updated;
    container.output.message =
      upperStatus === QuotationStatus.ACCEPTED
        ? `Quotation #${updated.quoteNo} successfully awarded! Competing quotes marked as REJECTED and RFQ status updated to AWARDED.`
        : `Quotation status updated to ${upperStatus}`;
  } catch (error) {
    throw error;
  }
};

export default updateQuotationStatus;
