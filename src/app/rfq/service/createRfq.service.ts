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
✨: @uses : Create RFQ Service (Draft or Published)
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const createRfq = async (container: any) => {
  try {
    const {
      input: { body, logged_in_user },
    } = container;

    const user = logged_in_user;
    if (!user || !user.id) {
      const err: any = new Error(
        i18n.__("auth.unauthorized") || "Authentication required to create RFQ"
      );
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }

    const {
      title,
      description,
      location,
      currency,
      optionalBudget,
      totalPriceRfq,
      deadline,
      status,
      category,
      categories,
      lineItems,
    } = body;

    // Field Validations
    if (!title || typeof title !== "string" || !title.trim()) {
      const err: any = new Error("RFQ title is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      const err: any = new Error("RFQ description is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      const err: any = new Error("Delivery location is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    if (!deadline) {
      const err: any = new Error("Quotation submission deadline is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      const err: any = new Error("Invalid submission deadline format");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    // Format Categories using Helper
    const { categoryNames, categoryIds } = rfqHelper.formatCategories(category, categories);

    // Format Line Items using Helper
    const formattedLineItems = rfqHelper.formatLineItems(lineItems);

    if (formattedLineItems.length === 0) {
      const err: any = new Error("At least one line item (name, quantity, unit) is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    // Validate each line item
    for (let i = 0; i < formattedLineItems.length; i++) {
      const item = formattedLineItems[i];
      if (!item.name) {
        const err: any = new Error(`Line item #${i + 1} requires a name`);
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
      }
      if (isNaN(item.quantity) || item.quantity <= 0) {
        const err: any = new Error(`Line item #${i + 1} requires a valid positive quantity`);
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
      }
    }

    let parsedStatus: RfqStatus = RfqStatus.DRAFT;
    if (status && typeof status === "string") {
      const upper = status.trim().toUpperCase();
      if (upper === "OPEN" || upper === "PUBLISHED") {
        parsedStatus = RfqStatus.PUBLISHED;
      } else if (Object.values(RfqStatus).includes(upper as any)) {
        parsedStatus = upper as RfqStatus;
      }
    }

    const createdRfq = await rfqRepo.createRfq({
      title,
      description,
      location,
      currency,
      optionalBudget,
      totalPriceRfq,
      deadline: deadlineDate,
      status: parsedStatus,
      createdById: user.id,
      categoryNames,
      categoryIds,
      lineItems: formattedLineItems,
    });

    container.derived.rfq = createdRfq;
    container.output.result = createdRfq;
    container.output.message =
      createdRfq.status === RfqStatus.PUBLISHED
        ? "RFQ created and published successfully"
        : "RFQ draft saved successfully";
  } catch (error) {
    throw error;
  }
};

export default createRfq;
