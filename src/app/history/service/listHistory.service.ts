// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import historyRepo from "../repos/history.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List History Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listHistory = async (container: any) => {
  try {
    const {
      input: { query },
    } = container;

    const rfqId = query?.rfqId ? Number(query.rfqId) : undefined;
    const quotationId = query?.quotationId ? Number(query.quotationId) : undefined;
    const limit = query?.limit ? Number(query.limit) : 50;

    const history = await historyRepo.getHistory({ rfqId, quotationId, limit });
    container.output.result = history;
  } catch (error) {
    throw error;
  }
};

export default listHistory;
