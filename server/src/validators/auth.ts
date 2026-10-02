import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
    role: Joi.string().valid('user', 'admin')
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
