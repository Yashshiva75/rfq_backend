// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List Notifications Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listNotifications = async (container: any) => {
  try {
    const {
      input: { logged_in_user },
    } = container;

    // Return notifications list structure
    container.output.result = [];
    container.output.message = "No unread notifications";
  } catch (error) {
    throw error;
  }
};

export default listNotifications;
