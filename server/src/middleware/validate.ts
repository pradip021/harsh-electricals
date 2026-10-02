import { Request, Response, NextFunction } from 'express';
import { ObjectSchema, ValidationOptions } from 'joi';
import ErrorResponse from '../utils/errorResponse';

const validate = (schema: ObjectSchema, options: ValidationOptions = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, ...options });
        
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new ErrorResponse(message, 400));
        }

        req.body = value;
        next();
    };
};

export default validate;
