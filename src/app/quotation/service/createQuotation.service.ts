// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import quotationRepo from "../repos/quotation.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";
import { QuotationStatus } from "../../../generated/prisma/enums";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Create Quotation Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const createQuotation = async (container: any) => {
  try {
    const {
      input: { body, logged_in_user },
    } = container;

    const user = logged_in_user;
    if (!user || !user.id) {
      const err: any = new Error(
        i18n.__("auth.unauthorized") || "Authentication required to submit quotation"
      );
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }

    const { rfqId, currency, deliveryTime, status, lineItems } = body;

    if (!rfqId || isNaN(Number(rfqId))) {
      const err: any = new Error("Valid RFQ ID is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      const err: any = new Error("At least one quotation line item with pricing is required");
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
        const err: any = new Error(`Line item #${i + 1} requires a valid non-negative unitPrice`);
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
      }
    }

    const quotation = await quotationRepo.createQuotation({
      rfqId: Number(rfqId),
      vendorId: user.id,
      currency,
      deliveryTime,
      status: QuotationStatus.SUBMITTED,
      lineItems,
    });

    container.derived.quotation = quotation;
    container.output.result = quotation;
    container.output.message = "Quotation submitted successfully";
  } catch (error) {
    throw error;
  }
};

export default createQuotation;
