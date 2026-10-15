'use strict';
// Import Config
import i18n from '../config/i18n';

// Import Services

// Import Middleware

// Import Controllers

// Import Interface

// Import Validators

// Import Helpers

// Import Repos

// Import Transformers

// Import Libraries
 
// Import Models

// Import Thirdparty
import statusCodes from 'http-status-codes';

class ResponseHelper {
    
    
    //
    // Success Format the response
    //
    async successResponse (data:any)  {

        let responseFormat : any = {
            status: 'success',
            data: data.result
        };

        if('meta' in data) {

            responseFormat.meta = data.meta;

        }

        if('message' in data) {

            responseFormat.message = data.message;

        }

        return responseFormat

    }

    //
    // Format Validation error response
    //
    async validationErrorResponse(data:any) {

        let validationErrorFormat : any = {
            status: 'error',
        };

        if ('validationErrors' in data) {

            validationErrorFormat.errors = data.validationErrors;

        }

        if('message' in data) {

            validationErrorFormat.message = data.message;

        }
        
        return validationErrorFormat

    }

    //
    // Get the status code
    //
    async getStatusCode(error: any) {
        const code = error.statusCode || error.status;
        return isNaN(code) ? 500 : Number(code);
    }

    //
    // Format validation error
    //
    async getValidationError(errors: any) {
        console.log('error in getValidationError', errors);

        try {
            const errFormat: any = new Error(i18n.__('validation_error'));
            errFormat.validationErrors = errors;
            errFormat.statusCode = statusCodes.BAD_REQUEST;
            throw errFormat;
        } catch (err) {
            throw err;
        }
    }
}

export default new ResponseHelper()
