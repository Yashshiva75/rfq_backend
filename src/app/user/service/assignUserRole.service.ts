/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Admin Assign User Role Service
👑: @created : 16/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Repos
import userRepo from "../repos/user.repo";
import userRoleRepo from "../../user_role/repos/userRole.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

const assignUserRole = async (container: any) => {
  try {
    const {
      input: { params, body },
    } = container;

    const userId = Number(params.id);
    if (!userId) {
      const error: any = new Error("Valid user ID is required");
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }

    // 1. Verify user exists
    const existingUser = await userRepo.getUserById(userId);
    if (!existingUser) {
      const error: any = new Error("User not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    // 2. Identify target role
    let targetRole: any = null;
    const requestedRoleId = body?.roleId ? Number(body.roleId) : undefined;
    const requestedRoleName = body?.roleName || body?.role;

    if (requestedRoleId) {
      targetRole = await userRoleRepo.getRoleById(requestedRoleId);
    } else if (requestedRoleName) {
      targetRole = await userRoleRepo.getRoleByName(String(requestedRoleName));
    } else {
      const error: any = new Error("roleId or roleName is required");
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }

    if (!targetRole) {
      const error: any = new Error("Role not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    // 3. Update user role
    const updatedUser = await userRepo.assignRoleToUser(userId, targetRole.id);

    container.output.result = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      roleId: updatedUser.roleId,
      role: {
        id: updatedUser.role.id,
        name: updatedUser.role.name,
        permissions: (updatedUser.role.permissions || []).map((rp: any) => rp.permission?.name || rp.name),
      },
      message: `User role successfully updated to ${targetRole.name}`,
    };
  } catch (error) {
    throw error;
  }
};

export default assignUserRole;
