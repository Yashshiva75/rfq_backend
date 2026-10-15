// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import userRepo from "../repos/user.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Get All Users Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const getAllUsers = async (container: any) => {
  try {
    const {
      input: { query },
    } = container;

    const page = query?.page ? Number(query.page) : 1;
    const perPage = query?.limit ? Number(query.limit) : 10;

    const result = await userRepo.getAllUsers({}, { page, perPage });

    const safeUsers = result.users.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });

    container.output.result = safeUsers;
    container.output.meta = {
      total: result.totalCount,
      page: result.page,
      limit: result.perPage,
      totalPages: Math.ceil(result.totalCount / result.perPage),
    };
  } catch (error) {
    throw error;
  }
};

export default getAllUsers;
