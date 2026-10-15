// Import Config
import prisma from "../../../library/prisma.library";

const DEFAULT_CATEGORIES = [
  "Industrial Automation",
  "Metals & Mining",
  "Information Technology",
  "Mechanical Components",
  "Electrical & Electronics",
  "Chemicals & Plastics",
  "Logistics & Packaging",
  "Construction Materials",
];

class CategoryRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get all categories (seeds defaults if empty)
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getAllCategories() {
    try {
      let categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });

      if (categories.length === 0) {
        for (const catName of DEFAULT_CATEGORIES) {
          await prisma.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName },
          });
        }
        categories = await prisma.category.findMany({
          orderBy: { name: "asc" },
        });
      }

      return categories;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Upsert category by name
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async createCategory(name: string) {
    try {
      return await prisma.category.upsert({
        where: { name: name.trim() },
        update: {},
        create: { name: name.trim() },
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new CategoryRepo();
