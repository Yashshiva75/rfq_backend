// Import Services
import userLogin from "../service/signIn.service";
import signUp from "../service/signUp.service";
import resetPassword from "../service/resetPassword.service";
import verifyUser from "../service/verifyUser.service";
import verifyOTP from "../service/verifyOTP.service";

// Import Helpers
import authHelper from "../helper/auth.helper";
import responseHelper from "../../../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class AuthController {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Login User
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          headers: req.headers,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Authenticate & login user
      //
      await userLogin(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.OK)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get JWT Tokens
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getTokens(req: any, res: Response, next: NextFunction) {
    try {
      const container: any = {
        input: {
          logged_in_user: req.logged_in_user,
          body: req.body,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Prepare the Payload for accessToken
      //
      container.output.result.access_token =
        await authHelper.generateAccessToken(container);

      //
      // Prepare the Payload for refreshToken
      //
      container.output.result.refresh_token =
        await authHelper.generateRefreshToken(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.OK)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : User Sign Up
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async signUp(req: Request, res: Response, next: NextFunction) {
    console.log('in signup')
    try {
      const container: any = {
        input: {
          body: req.body,
          headers: req.headers,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Register user
      //
      await signUp(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.OK)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Reset User Password
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          headers: req.headers,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Reset user password
      //
      await resetPassword(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.OK)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Verify User & Send OTP
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          headers: req.headers,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Verify user
      //
      await verifyUser(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.OK)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Verify User OTP
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          headers: req.headers,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Verify user OTP
      //
      await verifyOTP(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.OK)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }
}

export default new AuthController();
