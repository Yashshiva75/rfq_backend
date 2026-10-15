// Import Services
import createQuotation from "../service/createQuotation.service";
import listQuotation from "../service/listQuotation.service";
import getQuotationById from "../service/getQuotationById.service";
import updateQuotationStatus from "../service/updateQuotationStatus.service";
import reviseQuotation from "../service/reviseQuotation.service";

// Import Helpers
import responseHelper from "../../../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class QuotationController {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Submit or draft a quote for a published RFQ
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async create(req: any, res: Response, next?: NextFunction) {
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
      // Submit quotation
      //
      await createQuotation(container);

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

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : List quotations filtered by role & RFQ
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
      // Fetch quotations list
      //
      await listQuotation(container);

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
  ✨: @uses : Get single quotation by ID
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
      // Fetch single quotation
      //
      await getQuotationById(container);

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
  ✨: @uses : Update quotation status (SHORTLIST, ACCEPT, REJECT, WITHDRAW)
  👑: @created : 15/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async updateStatus(req: any, res: Response, next?: NextFunction) {
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
      // Update quotation status
      //
      await updateQuotationStatus(container);

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
  ✨: @uses : Revise submitted quotation (prices, delivery) before deadline
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async revise(req: any, res: Response, next?: NextFunction) {
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
      // Revise quotation
      //
      await reviseQuotation(container);

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

export default new QuotationController();
