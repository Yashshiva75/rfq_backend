// Import Services
import listRoles from "../service/listRoles.service";

// Import Helpers
import responseHelper from "../../../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class UserRoleController {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : List all user roles
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async list(req: Request, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      //
      // Fetch roles list
      //
      await listRoles(container);

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

export default new UserRoleController();
