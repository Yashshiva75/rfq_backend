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
✨: @uses : Update RFQ Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const updateRfq = async (container: any) => {
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

    // Permission check: only RFQ creator or Admin can edit
    const isAdmin = rfqHelper.isAdmin(user);
    if (existingRfq.createdById !== user.id && !isAdmin) {
      const err: any = new Error(
        i18n.__("auth.forbidden") || "You do not have permission to modify this RFQ"
      );
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
    }

    // Restrict editing terminal statuses
    if (
      [RfqStatus.CLOSED, RfqStatus.AWARDED].includes(
        existingRfq.status as any
      )
    ) {
      const err: any = new Error(
        `Cannot edit an RFQ in '${existingRfq.status}' status`
      );
      err.statusCode = StatusCodes.BAD_REQUEST;
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

    let categoryNames: string[] | undefined;
    let categoryIds: number[] | undefined;

    if (category !== undefined || categories !== undefined) {
      const formatted = rfqHelper.formatCategories(category, categories);
      categoryNames = formatted.categoryNames;
      categoryIds = formatted.categoryIds;
    }

    let formattedLineItems;
    if (lineItems !== undefined && Array.isArray(lineItems)) {
      formattedLineItems = rfqHelper.formatLineItems(lineItems);
    }

    let parsedStatus: RfqStatus | undefined = undefined;
    if (status && typeof status === "string") {
      const upper = status.trim().toUpperCase();
      if (upper === "OPEN" || upper === "PUBLISHED") {
        parsedStatus = RfqStatus.PUBLISHED;
      } else if (Object.values(RfqStatus).includes(upper as any)) {
        parsedStatus = upper as RfqStatus;
      }
    }

    const updatedRfq = await rfqRepo.updateRfq(
      id,
      {
        title,
        description,
        location,
        currency,
        optionalBudget,
        totalPriceRfq,
        deadline,
        status: parsedStatus,
        categoryNames,
        categoryIds,
        lineItems: formattedLineItems,
      },
      user.id
    );

    container.derived.rfq = updatedRfq;
    container.output.result = updatedRfq;
    container.output.message = "RFQ updated successfully";
  } catch (error) {
    throw error;
  }
};

export default updateRfq;
