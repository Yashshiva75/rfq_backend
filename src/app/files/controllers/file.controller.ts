/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : File Attachment Controller
👑: @created : 15/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

// Import Services
import listFiles from "../service/listFiles.service";
import uploadFile from "../service/uploadFile.service";
import getFile from "../service/getFile.service";
import deleteFile from "../service/deleteFile.service";

// Import Helpers
import responseHelper from "../../../helpers/response.helper";

// Import Thirdparty
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class FileController {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Upload PDF/XLSX file to Cloudinary
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async upload(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          file: req.file,
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          logged_in_user: req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      await uploadFile(container);

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
  ✨: @uses : List uploaded files / attachments
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
          logged_in_user: req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      await listFiles(container);

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
  ✨: @uses : Get file details / guarded access
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getById(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          params: req.params,
          query: req.query,
          headers: req.headers,
          logged_in_user: req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      await getFile(container);

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
  ✨: @uses : Delete file attachment
  👑: @created : 16/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async delete(req: any, res: Response, next?: NextFunction) {
    try {
      const container: any = {
        input: {
          params: req.params,
          headers: req.headers,
          logged_in_user: req.user,
        },
        derived: {},
        output: {
          result: {},
        },
      };

      await deleteFile(container);

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

export default new FileController();
