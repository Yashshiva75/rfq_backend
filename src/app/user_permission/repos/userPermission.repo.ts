// Import Config
import prisma from "../../../library/prisma.library";

class UserPermissionRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : List all permissions
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getAllPermissions() {
    try {
      return await prisma.permission.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new UserPermissionRepo();
