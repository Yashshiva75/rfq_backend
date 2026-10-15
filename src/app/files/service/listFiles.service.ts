// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import fileRepo from "../repos/file.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List Files Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listFiles = async (container: any) => {
  try {
    const {
      input: { query },
    } = container;

    const rfqId = query?.rfqId ? Number(query.rfqId) : undefined;
    const quotationId = query?.quotationId ? Number(query.quotationId) : undefined;
    const uploadedBy = query?.uploadedBy ? Number(query.uploadedBy) : undefined;

    const files = await fileRepo.getFiles({ rfqId, quotationId, uploadedBy });
    container.output.result = files;
  } catch (error) {
    throw error;
  }
};

export default listFiles;
