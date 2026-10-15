// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import userRoleRepo from "../repos/userRole.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List User Roles Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listRoles = async (container: any) => {
  try {
    const roles = await userRoleRepo.getAllRoles();
    container.output.result = roles;
  } catch (error) {
    throw error;
  }
};

export default listRoles;
