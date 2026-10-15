// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import userRepo from "../repos/user.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Get User Profile Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const getProfile = async (container: any) => {
  try {
    const {
      input: { logged_in_user },
    } = container;

    const user = logged_in_user;
    if (!user || !user.id) {
      const err: any = new Error(
        i18n.__("auth.unauthorized") || "Authentication required"
      );
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }

    const userDetails = await userRepo.getUserById(Number(user.id));
    if (!userDetails) {
      const err: any = new Error("User not found");
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }

    const { password, ...safeUser } = userDetails as any;

    container.derived.user = safeUser;
    container.output.result = safeUser;
  } catch (error) {
    throw error;
  }
};

export default getProfile;
