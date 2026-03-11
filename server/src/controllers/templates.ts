import { Response, NextFunction } from 'express';
import asyncHandler from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import Template from '../models/Template';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all templates
// @route   GET /api/v1/templates
// @access  Private
export const getTemplates = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Return custom templates for user + system templates
    // For now, just user's templates
    const templates = await Template.find({ 
        $or: [
            { user: req.user.id },
            { isCustom: false }
        ]
    }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: templates.length,
        data: templates,
    });
});

// @desc    Create new template
// @route   POST /api/v1/templates
// @access  Private
export const createTemplate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    req.body.user = req.user.id;

    const template = await Template.create(req.body);

    res.status(201).json({
        success: true,
        data: template,
    });
});

// @desc    Delete template
// @route   DELETE /api/v1/templates/:id
// @access  Private
export const deleteTemplate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const template = await Template.findById(req.params.id);

    if (!template) {
        return next(new ErrorResponse(`Template not found with id of ${req.params.id}`, 404));
    }

    if (template.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this template`, 401));
    }

    await template.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
