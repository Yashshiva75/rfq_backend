// Import Services
import getProfile from "../service/getProfile.service";
import getAllUsers from "../service/getAllUsers.service";
import getUserById from "../service/getUserById.service";
import assignUserRole from "../service/assignUserRole.service";

// Import Helpers
import responseHelper from "../../../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class UserController {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get logged-in user profile
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getProfile(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          logged_in_user: req.logged_in_user || req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Fetch user profile
      //
      await getProfile(container);

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
  ✨: @uses : List all users (admin)
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async list(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          logged_in_user: req.logged_in_user || req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Fetch all users
      //
      await getAllUsers(container);

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
  ✨: @uses : Get user by ID
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getById(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          logged_in_user: req.logged_in_user || req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Fetch user by id
      //
      await getUserById(container);

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
  ✨: @uses : Assign role to user (admin only)
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async assignRole(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          logged_in_user: req.logged_in_user || req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      await assignUserRole(container);

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

export default new UserController();
