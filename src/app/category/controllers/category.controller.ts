// Import Services
import listCategory from "../service/listCategory.service";
import createCategory from "../service/createCategory.service";

// Import Helpers
import responseHelper from "../../../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class CategoryController {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get all categories (seeds defaults if empty)
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
      // Fetch categories
      //
      await listCategory(container);

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
  ✨: @uses : Create or fetch existing category
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async create(req: Request, res: Response, next?: NextFunction) {
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
      // Create or get category
      //
      await createCategory(container);

      //
      // send the response
      //
      res
        .status(StatusCodes.CREATED)
        .json(await responseHelper.successResponse(container.output));
    } catch (error: any) {
      res
        .status(await responseHelper.getStatusCode(error))
        .json(await responseHelper.validationErrorResponse(error));
    }
  }
}

export default new CategoryController();
