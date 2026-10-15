// Import Config
import config from "../config/constant";
import i18n from "../config/i18n";

// Import Repos
import userRepo from "../app/user/repos/user.repo";

// Import Helpers
import responseHelper from "../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export class PassportAuth {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Extract token from request headers
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  public extractToken(req: Request): string | null {
    const authHeader =
      (req.headers["authorization"] as string) ||
      (req.headers["Authorization"] as string) ||
      (req.headers["authentication-token"] as string);

    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }

    return authHeader.trim();
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Authenticate JWT Token Middleware
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  authenticate = async (req: any, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        const error: any = new Error(
          i18n.__("auth.token_required") || "Authentication token is required"
        );
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
      }

      const secretKey: any = config.app.JWT_SECRET_KEY;
      let decoded: any;

      try {
        decoded = jwt.verify(token, secretKey);
      } catch (jwtError: any) {
        const error: any = new Error(
          i18n.__("auth.invalid_token") || "Invalid or expired authentication token"
        );
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
      }

      // Verify user existence in database
      const userId = decoded.id || decoded.user_id;
      let user: any = null;

      if (userId) {
        user = await userRepo.getUserById(Number(userId));
      } else if (decoded.email) {
        user = await userRepo.getUserByEmail(decoded.email);
      }

      if (!user) {
        const error: any = new Error(
          i18n.__("auth.user_not_found") || "Authenticated user not found or deactivated"
        );
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
      }

      // Attach authenticated user to request context
      req.user = user;
      req.logged_in_user = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        role: user.role?.name || null,
        roles: user.role?.name ? [user.role.name] : decoded.roles || [],
      };

      next();
    } catch (error: any) {
      const statusCode = await responseHelper.getStatusCode(error);
      const errorResponse = await responseHelper.validationErrorResponse(error);
      return res.status(statusCode).json(errorResponse);
    }
  };

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : JWT Middleware Alias for passportAuth.authenticateJwt
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  authenticateJwt = this.authenticate;

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Programmatic login verification for container flow
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async loginUser(req: any, container: any): Promise<void> {
    try {
      const {
        input: { body },
      } = container;

      const user = await userRepo.getUserByEmail(body.email);
      if (!user) {
        const error: any = new Error(
          i18n.__("auth.invalid_credentials") || "Invalid email or password"
        );
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
      }

      container.derived.user = user;
      container.derived.user_roles = user.role?.name ? [user.role.name] : [];
    } catch (error) {
      throw error;
    }
  }
}

export default new PassportAuth();
