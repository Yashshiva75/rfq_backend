// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Repos
import categoryRepo from "../repos/category.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Create Category Service
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const createCategory = async (container: any) => {
  try {
    const {
      input: { body },
    } = container;

    const { name } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      const err: any = new Error("Category name is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const category = await categoryRepo.createCategory(name);

    container.derived.category = category;
    container.output.result = category;
    container.output.message = "Category created or retrieved successfully";
  } catch (error) {
    throw error;
  }
};

export default createCategory;
