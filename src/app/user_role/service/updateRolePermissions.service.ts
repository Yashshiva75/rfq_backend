/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Admin Update Role Permissions Service
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Repos & Libraries
import userRoleRepo from "../repos/userRole.repo";
import prisma from "../../../library/prisma.library";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

const updateRolePermissions = async (container: any) => {
  try {
    const {
      input: { params, body },
    } = container;

    const roleId = Number(params.id);
    if (!roleId) {
      const error: any = new Error("Valid role ID is required");
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }

    // 1. Verify role exists
    const existingRole = await userRoleRepo.getRoleById(roleId);
    if (!existingRole) {
      const error: any = new Error("Role not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    let finalPermissionIds: number[] = [];

    // 2. Resolve permission IDs
    if (Array.isArray(body?.permissionIds)) {
      finalPermissionIds = body.permissionIds.map(Number).filter(Boolean);
    } else if (Array.isArray(body?.permissions)) {
      const perms = await prisma.permission.findMany({
        where: {
          name: {
            in: body.permissions.map((p: string) => String(p).trim()),
          },
        },
      });
      finalPermissionIds = perms.map((p) => p.id);
    } else {
      const error: any = new Error("permissionIds (array of numbers) or permissions (array of strings) is required");
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }

    // 3. Update permissions transactionally
    const updatedRole = await userRoleRepo.updateRolePermissions(roleId, finalPermissionIds);

    container.output.result = {
      id: updatedRole?.id,
      name: updatedRole?.name,
      permissions: (updatedRole?.permissions || []).map((rp: any) => rp.permission?.name || rp.name),
      message: `Permissions for role '${updatedRole?.name}' updated successfully`,
    };
  } catch (error) {
    throw error;
  }
};

export default updateRolePermissions;
