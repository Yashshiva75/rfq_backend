// Import Config
import config from "../../../config/constant";
import i18n from "../../../config/i18n";

// Import Helpers
import authHelper from "../helper/auth.helper";

// Import Repos
import userRepo from "../../user/repos/user.repo";
import userRoleRepo from "../../user_role/repos/userRole.repo";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";

/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : User Sign Up Service
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
const signUp = async (container: any): Promise<any> => {
  try {
    const {
      input: { body },
    } = container;

    // Validate body exists
    if (!body) {
      const err: any = new Error("Request body is missing");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const { name, email, password, role, roleId } = body;

    // 1. Validate Full Name
    if (!name || typeof name !== "string" || !name.trim()) {
      const err: any = new Error("Full name is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    // 2. Validate Email
    if (!email || typeof email !== "string" || !email.trim()) {
      const err: any = new Error("Email address is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      const err: any = new Error("Invalid email format");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    // 3. Validate Password
    if (!password || typeof password !== "string") {
      const err: any = new Error("Password is required");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    if (password.length < 6) {
      const err: any = new Error("Password must be at least 6 characters long");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
    }

    // 4. Check if Email Already Exists
    const emailExists = await userRepo.checkEmailExists(cleanEmail);
    if (emailExists) {
      const err: any = new Error(
        i18n.__("auth.email_exists") || "A user with this email address already exists"
      );
      err.statusCode = StatusCodes.CONFLICT;
      throw err;
    }

    // 5. Resolve Role according to schema
    let targetRoleId: number | null = null;

    if (roleId && !isNaN(Number(roleId))) {
      const foundRole = await userRoleRepo.getRoleById(Number(roleId));
      if (!foundRole) {
        const err: any = new Error("Invalid role ID specified");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
      }
      targetRoleId = foundRole.id;
    } else if (role && typeof role === "string" && role.trim()) {
      const foundRole = await userRoleRepo.getRoleByName(role.trim().toLowerCase());
      if (!foundRole) {
        const err: any = new Error(`Role '${role}' not found`);
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
      }
      targetRoleId = foundRole.id;
    } else {
      // Default to buyer role, fallback to user
      let defaultRole = await userRoleRepo.getRoleByName(config.system_roles.BUYER || "buyer");
      if (!defaultRole) {
        defaultRole = await userRoleRepo.getRoleByName(config.system_roles.USER || "user");
      }
      if (!defaultRole) {
        const allRoles = await userRoleRepo.getAllRoles();
        if (allRoles.length > 0) {
          defaultRole = allRoles[0];
        }
      }

      if (!defaultRole) {
        const err: any = new Error("No default user role found in database");
        err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw err;
      }

      targetRoleId = defaultRole.id;
    }

    // 6. Create User in Database
    const newUser = await userRepo.createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      roleId: targetRoleId,
    });

    container.derived.user = newUser;
    container.derived.user_roles = newUser.role?.name ? [newUser.role.name] : [];

    // 7. Generate JWT Tokens
    const accessToken = await authHelper.generateAccessToken(container);
    const refreshToken = await authHelper.generateRefreshToken(container);

    // 8. Prepare Output Payload
    container.output.result = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role?.name || null,
        roleId: newUser.roleId,
      },
    };
    container.output.message = "User registered successfully";

    return container;
  } catch (error) {
    throw error;
  }
};

export default signUp;
