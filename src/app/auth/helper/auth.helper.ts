// Import Config
import config from "../../../config/constant";

// Import Thirdparty
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

class AuthHelper {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Compare Password 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async comparePassword(password: string, user_password: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, user_password);
      return Boolean(isMatch);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Generate Access token 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async generateAccessToken(container: any): Promise<string> {
    try {
      const user = container.input.logged_in_user || container.derived?.user || {};
      const payload: any = {
        id: user.id,
        user_id: user.id,
        email: user.email,
        user_uuid: user.uuid || user.id,
        roles: container.input.logged_in_user
          ? container.input.logged_in_user.roles
          : container.derived?.user_roles || (user.role?.name ? [user.role.name] : []),
        company_uuid: container.input.logged_in_user
          ? container.input.logged_in_user.company_uuid
          : container.derived?.user?.company_uuid,
        app_type: container.input.app_type
          ? container.input.app_type
          : container.input.body?.type,
        type: config.app.TOKEN_TYPE.access_token,
      };

      const secretKey: any = config.app.JWT_SECRET_KEY;
      return jwt.sign(payload, secretKey, { expiresIn: "30d" });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Generate refresh token 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async generateRefreshToken(container: any): Promise<string> {
    try {
      const user = container.input.logged_in_user || container.derived?.user || {};
      const payload: any = {
        id: user.id,
        user_id: user.id,
        email: user.email,
        user_uuid: user.uuid || user.id,
        roles: container.input.logged_in_user
          ? container.input.logged_in_user.roles
          : container.derived?.user_roles || (user.role?.name ? [user.role.name] : []),
        company_uuid: container.input.logged_in_user
          ? container.input.logged_in_user.company_uuid
          : container.derived?.user?.company_uuid,
        app_type: container.input.app_type
          ? container.input.app_type
          : container.input.body?.type,
        type: config.app.TOKEN_TYPE.refresh_token,
      };

      const secretKey: any = config.app.JWT_SECRET_KEY;
      return jwt.sign(payload, secretKey, { expiresIn: "90d" });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Generate Hash password 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async generateHashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Random hash generator 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async generateRandomHashCode(): Promise<string> {
    try {
      return crypto
        .createHash("md5")
        .update(crypto.randomBytes(10).toString("hex"))
        .digest("hex");
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Generate random OTP 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async generateOTP(): Promise<string> {
    try {
      const randomBytes = crypto.randomBytes(2);
      const otp = (randomBytes.readUIntBE(0, 2) % 9000) + 1000;
      return otp.toString();
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthHelper();
