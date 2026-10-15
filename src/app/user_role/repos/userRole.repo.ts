// Import Config
import prisma from "../../../library/prisma.library";
import config from "../../../config/constant";

// Import Interface
import GUID from "../../../interface/GUIDInterface";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

class UserRoleRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get Role by Name
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getRoleByName(name: string) {
    try {
      const role = await prisma.role.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get Role by ID
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getRoleById(id: number) {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get All Roles
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getAllRoles() {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      });

      return roles;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Create Role
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async createRole(name: string) {
    try {
      const role = await prisma.role.create({
        data: {
          name: name.trim().toLowerCase(),
        },
      });

      return role;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get Permissions for Role
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getRolePermissions(roleId: number) {
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
        include: {
          permission: true,
        },
      });

      return rolePermissions.map((rp: any) => rp.permission);
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Update permissions assigned to a role
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async updateRolePermissions(roleId: number, permissionIds: number[]) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Remove existing permissions for this role
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        // 2. Assign new permissions
        if (permissionIds && permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permId) => ({
              roleId,
              permissionId: permId,
            })),
          });
        }

        // 3. Return updated role with permissions
        return await tx.role.findUnique({
          where: { id: roleId },
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new UserRoleRepo();
