// Import Config
import config from "../config/constant";
import i18n from "../config/i18n";

// Import Helpers
import responseHelper from "../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class Authorization {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Role Based Authorization Middleware Factory
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  hasRole(...allowedRoles: string[]) {
    return async (req: any, res: Response, next: NextFunction) => {
      try {
        const loggedInUser = req.logged_in_user || req.user;

        if (!loggedInUser) {
          const error: any = new Error(
            i18n.__("auth.unauthorized") || "User is not authenticated"
          );
          error.statusCode = StatusCodes.UNAUTHORIZED;
          throw error;
        }

        const userRoles: string[] = loggedInUser.roles || [loggedInUser.role];
        const normalizedUserRoles = userRoles
          .filter(Boolean)
          .map((r: string) => r.toLowerCase().trim());

        // Admins and Super Admins bypass role checks
        const isAdmin = normalizedUserRoles.some((r) =>
          [
            config.system_roles.ADMIN.toLowerCase(),
            config.system_roles.SUPER_ADMIN.toLowerCase(),
          ].includes(r)
        );

        if (isAdmin) {
          return next();
        }

        const normalizedAllowedRoles = allowedRoles
          .flat()
          .map((r: string) => r.toLowerCase().trim());

        const hasAccess = normalizedUserRoles.some((r) =>
          normalizedAllowedRoles.includes(r)
        );

        if (!hasAccess) {
          const error: any = new Error(
            i18n.__("auth.forbidden") ||
              "Access denied: You do not have permission to access this resource"
          );
          error.statusCode = StatusCodes.FORBIDDEN;
          throw error;
        }

        next();
      } catch (error: any) {
        const statusCode = await responseHelper.getStatusCode(error);
        const errorResponse = await responseHelper.validationErrorResponse(error);
        return res.status(statusCode).json(errorResponse);
      }
    };
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Permission Based Authorization Middleware Factory
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  hasPermission(...requiredPermissions: string[]) {
    return async (req: any, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (!user) {
          const error: any = new Error(
            i18n.__("auth.unauthorized") || "User is not authenticated"
          );
          error.statusCode = StatusCodes.UNAUTHORIZED;
          throw error;
        }

        // Check if admin
        const roleName = user.role?.name?.toLowerCase();
        if (
          roleName === config.system_roles.ADMIN.toLowerCase() ||
          roleName === config.system_roles.SUPER_ADMIN.toLowerCase()
        ) {
          return next();
        }

        // Extract permission names from role relations
        const userPermissions: string[] = (
          user.role?.permissions || []
        ).map((rp: any) => rp.permission?.name || rp.name);

        const normalizedRequired = requiredPermissions
          .flat()
          .map((p) => p.toLowerCase().trim());

        const hasAllPermissions = normalizedRequired.every((required) =>
          userPermissions
            .map((p) => p.toLowerCase().trim())
            .includes(required)
        );

        if (!hasAllPermissions) {
          const error: any = new Error(
            i18n.__("auth.forbidden") ||
              "Access denied: Missing required permissions"
          );
          error.statusCode = StatusCodes.FORBIDDEN;
          throw error;
        }

        next();
      } catch (error: any) {
        const statusCode = await responseHelper.getStatusCode(error);
        const errorResponse = await responseHelper.validationErrorResponse(error);
        return res.status(statusCode).json(errorResponse);
      }
    };
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Buyer Role Guard Middleware
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  isBuyer = this.hasRole(config.system_roles.BUYER);

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Vendor Role Guard Middleware
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  isVendor = this.hasRole(config.system_roles.VENDOR);

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Admin Role Guard Middleware
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  isAdmin = this.hasRole(config.system_roles.ADMIN);
}

export default new Authorization();
