import Joi from 'joi';
import { MAX_UNIT_NAME_LENGTH } from '../utils/units';

export const unitSchema = Joi.object({
    name: Joi.string().trim().min(1).max(MAX_UNIT_NAME_LENGTH).required().messages({
        'string.empty': 'Unit name is required',
        'any.required': 'Unit name is required',
        'string.max': `Unit name must be at most ${MAX_UNIT_NAME_LENGTH} characters`,
        'string.base': 'Unit name must be text',
    }),
});

export const unitValidationOptions: Joi.ValidationOptions = { stripUnknown: { objects: true } };
