// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import quotationRepo from "../repos/quotation.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List Quotations Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listQuotation = async (container: any) => {
  try {
    const {
      input: { query, logged_in_user },
    } = container;

    const user = logged_in_user;
    const { rfqId, status } = query || {};

    const quotes = await quotationRepo.getQuotations({
      userId: user?.id,
      userRole: user?.role,
      rfqId: rfqId ? Number(rfqId) : undefined,
      status: status as string,
    });

    container.output.result = quotes;
  } catch (error) {
    throw error;
  }
};

export default listQuotation;
