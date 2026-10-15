// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import quotationRepo from "../repos/quotation.repo";

// Import Helpers
import rfqHelper from "../../rfq/helper/rfq.helper";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Revise Quotation Service (Updates line prices/delivery & creates revision snapshot)
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const reviseQuotation = async (container: any) => {
  try {
    const {
      input: { params, body, logged_in_user },
    } = container;

    const user = logged_in_user;
    if (!user || !user.id) {
      const err: any = new Error(
        i18n.__("auth.unauthorized") || "Authentication required to revise quotation"
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

    const { currency, deliveryTime, lineItems } = body || {};

    if (lineItems !== undefined) {
      if (!Array.isArray(lineItems) || lineItems.length === 0) {
        const err: any = new Error("Line items must be a non-empty array when provided");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
      }

      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        if (!item.rfqLineItemId || isNaN(Number(item.rfqLineItemId))) {
          const err: any = new Error(`Line item #${i + 1} requires a valid rfqLineItemId`);
          err.statusCode = StatusCodes.BAD_REQUEST;
          throw err;
        }
        if (
          item.unitPrice === undefined ||
          isNaN(Number(item.unitPrice)) ||
          Number(item.unitPrice) < 0
        ) {
          const err: any = new Error(
            `Line item #${i + 1} requires a valid non-negative unitPrice`
          );
          err.statusCode = StatusCodes.BAD_REQUEST;
          throw err;
        }
      }
    }

    const isAdmin = rfqHelper.isAdmin(user);

    const revised = await quotationRepo.reviseQuotation({
      quotationId: id,
      vendorId: user.id,
      isAdmin,
      currency,
      deliveryTime,
      lineItems,
    });

    container.derived.quotation = revised;
    container.output.result = revised;
    container.output.message = `Quotation revised successfully (Revision #${revised.revisions?.[0]?.revisionNo || 2})`;
  } catch (error) {
    throw error;
  }
};

export default reviseQuotation;
