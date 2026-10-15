// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import userRepo from "../repos/user.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Get User by ID Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const getUserById = async (container: any) => {
  try {
    const {
      input: { params },
    } = container;

    const id = Number(params?.id);
    if (isNaN(id) || id <= 0) {
      const err: any = new Error("Valid numeric user ID is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const user = await userRepo.getUserById(id);
    if (!user) {
      const err: any = new Error(`User with ID ${id} was not found`);
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }

    const { password, ...safeUser } = user as any;

    container.derived.user = safeUser;
    container.output.result = safeUser;
  } catch (error) {
    throw error;
  }
};

export default getUserById;
