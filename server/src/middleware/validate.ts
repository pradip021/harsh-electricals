import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import ErrorResponse from '../utils/errorResponse';

const validate = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new ErrorResponse(message, 400));
        }

        next();
    };
};

export default validate;
