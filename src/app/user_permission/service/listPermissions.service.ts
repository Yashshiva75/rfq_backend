// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import userPermissionRepo from "../repos/userPermission.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List Permissions Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listPermissions = async (container: any) => {
  try {
    const permissions = await userPermissionRepo.getAllPermissions();
    container.output.result = permissions;
  } catch (error) {
    throw error;
  }
};

export default listPermissions;
