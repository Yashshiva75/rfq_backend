// Import Config
import config from "../../../config/constant";

// Import Thirdparty
import prisma from "../../../library/prisma.library";

class RfqHelper {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Check if user has Admin privileges
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  isAdmin(user: any): boolean {
    if (!user) return false;
    const rId = Number(user.roleId || user.role_id || user.role?.id);
    if (rId === 1) return true;

    const roleName = typeof user.role === "string" ? user.role : (user.role?.name || user.role_name);
    if (
      roleName &&
      [
        config.system_roles.ADMIN.toLowerCase(),
        config.system_roles.SUPER_ADMIN.toLowerCase(),
      ].includes(String(roleName).toLowerCase().trim())
    ) {
      return true;
    }

    if (Array.isArray(user.roles)) {
      return user.roles.some((r: any) => {
        const name = typeof r === "string" ? r : (r?.name || r?.role_name);
        return (
          name &&
          [
            config.system_roles.ADMIN.toLowerCase(),
            config.system_roles.SUPER_ADMIN.toLowerCase(),
          ].includes(String(name).toLowerCase().trim())
        );
      });
    }

    return false;
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Check if user has Vendor privileges
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  isVendor(user: any): boolean {
    if (!user) return false;
    const rId = Number(user.roleId || user.role_id || user.role?.id);
    if (rId === 3) return true;

    const roleName = typeof user.role === "string" ? user.role : (user.role?.name || user.role_name);
    if (
      roleName &&
      String(roleName).toLowerCase().trim() === config.system_roles.VENDOR.toLowerCase()
    ) {
      return true;
    }

    if (Array.isArray(user.roles)) {
      return user.roles.some((r: any) => {
        const name = typeof r === "string" ? r : (r?.name || r?.role_name);
        return (
          name &&
          String(name).toLowerCase().trim() === config.system_roles.VENDOR.toLowerCase()
        );
      });
    }

    return false;
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Check if user has Buyer privileges
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  isBuyer(user: any): boolean {
    if (!user) return false;
    const rId = Number(user.roleId || user.role_id || user.role?.id);
    if (rId === 2) return true;

    const roleName = typeof user.role === "string" ? user.role : (user.role?.name || user.role_name);
    if (
      roleName &&
      String(roleName).toLowerCase().trim() === config.system_roles.BUYER.toLowerCase()
    ) {
      return true;
    }

    if (Array.isArray(user.roles)) {
      return user.roles.some((r: any) => {
        const name = typeof r === "string" ? r : (r?.name || r?.role_name);
        return (
          name &&
          String(name).toLowerCase().trim() === config.system_roles.BUYER.toLowerCase()
        );
      });
    }

    return false;
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Format Category inputs from container body
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  formatCategories(
    category: any,
    categories: any
  ): { categoryNames: string[]; categoryIds: number[] } {
    const categoryNames: string[] = [];
    const categoryIds: number[] = [];

    const rawCategories = [
      ...(Array.isArray(categories) ? categories : categories ? [categories] : []),
      ...(Array.isArray(category) ? category : category ? [category] : []),
    ];

    for (const item of rawCategories) {
      if (typeof item === "number" && !isNaN(item)) {
        categoryIds.push(item);
      } else if (typeof item === "string" && item.trim()) {
        categoryNames.push(item.trim());
      }
    }

    return { categoryNames, categoryIds };
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Format and validate line items
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  formatLineItems(lineItems: any[]): any[] {
    if (!Array.isArray(lineItems)) return [];
    return lineItems.map((item: any) => ({
      name: String(item.name || "").trim(),
      description: item.description ? String(item.description).trim() : undefined,
      quantity: Number(item.quantity) || 1,
      unit: String(item.unit || "units").trim(),
      specifications: item.specifications ? String(item.specifications).trim() : undefined,
    }));
  }
}

export default new RfqHelper();
