// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import categoryRepo from "../repos/category.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : List Categories Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const listCategory = async (container: any) => {
  try {
    const categories = await categoryRepo.getAllCategories();
    container.output.result = categories;
  } catch (error) {
    throw error;
  }
};

export default listCategory;
