// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Helpers
import authHelper from "../helper/auth.helper";

// Import Repos
import userRepo from "../../user/repos/user.repo";

// Import Thirdparty
import moment from "moment";
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : User Login  
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const userLogin = async (container: any) => {
  try {
    const {
      input: { body },
    } = container;

    // Fetch user from database
    const user = await userRepo.getUserByEmail(body.email);

    if (!user) {
      const err: any = new Error(i18n.__("auth.invalid_credentials") || "Invalid email or password");
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
    }

    // Verify password if present
    if (body.password && user.password) {
      const isMatch = await authHelper.comparePassword(body.password, user.password);
      if (!isMatch) {
        const err: any = new Error(i18n.__("auth.invalid_credentials") || "Invalid email or password");
        err.statusCode = StatusCodes.UNAUTHORIZED;
        throw err;
      }
    }

    container.derived.user = user;
    container.derived.user_roles = user.role?.name ? [user.role.name] : [];

    //
    // Prepare the Payload for accessToken
    //
    container.output.result.access_token = await authHelper.generateAccessToken(container);

    //
    // Prepare the Payload for refreshToken
    //
    container.output.result.refresh_token = await authHelper.generateRefreshToken(container);

    //
    // Prepare response of user details
    //
    container.output.result.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name || null,
    };
  } catch (error) {
    throw error;
  }
};

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Update user details 
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const updateUserDetails = async (container: any) => {
  try {
    const {
      derived: { user },
    } = container;

    if (user && user.status === config.status_type.DEACTIVE) {
      const updateDetails = {
        updatedAt: moment.utc().toDate(),
      };

      await userRepo.updateUserDetails(user.id, updateDetails);
    }
  } catch (error) {
    throw error;
  }
};

export { updateUserDetails };
export default userLogin;
