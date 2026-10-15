// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import quotationRepo from "../repos/quotation.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Get Quotation By ID Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const getQuotationById = async (container: any) => {
  try {
    const {
      input: { params, logged_in_user },
    } = container;

    const id = Number(params?.id);
    if (isNaN(id) || id <= 0) {
      const err: any = new Error("Valid numeric quotation ID is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const quotation = await quotationRepo.getQuotationById(id);
    if (!quotation) {
      const err: any = new Error(`Quotation with ID ${id} not found`);
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }

    container.derived.quotation = quotation;
    container.output.result = quotation;
  } catch (error) {
    throw error;
  }
};

export default getQuotationById;
