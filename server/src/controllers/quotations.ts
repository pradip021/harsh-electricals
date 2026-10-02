import { Response, NextFunction } from 'express';
import asyncHandler from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import Quotation from '../models/Quotation';
import { AuthRequest } from '../middleware/auth';
import { ExistingQuotation, prepareQuotationPayload } from '../utils/quotationTable';
import { resolveItemUnits } from '../utils/units';
import { resolveSignatureConfig } from '../utils/signature';

// @desc    Get all quotations
// @route   GET /api/v1/quotations
// @access  Private
export const getQuotations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const quotations = await Quotation.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: quotations.length,
        data: quotations,
    });
});

// @desc    Get single quotation
// @route   GET /api/v1/quotations/:id
// @access  Private
export const getQuotation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
        return next(new ErrorResponse(`Quotation not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns quotation
    if (quotation.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this quotation`, 401));
    }

    res.status(200).json({
        success: true,
        data: quotation,
    });
});

// @desc    Create new quotation
// @route   POST /api/v1/quotations
// @access  Private
export const createQuotation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const payload = { ...prepareQuotationPayload(req.body), ...resolveSignatureConfig(req.body) };
    await resolveItemUnits(req.user.id, payload.items);

    const quotation = await Quotation.create({ ...payload, user: req.user.id });

    res.status(201).json({
        success: true,
        data: quotation,
    });
});

// @desc    Update quotation
// @route   PUT /api/v1/quotations/:id
// @access  Private
export const updateQuotation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
        return next(new ErrorResponse(`Quotation not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns quotation
    if (quotation.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this quotation`, 401));
    }

    const existing = quotation.toObject({ flattenMaps: true }) as unknown as ExistingQuotation;
    const payload = {
        ...prepareQuotationPayload(req.body, existing),
        ...resolveSignatureConfig(req.body, { signature: quotation.signature, signatureMode: quotation.signatureMode }),
    };
    // Units are resolved against the owner's definitions, even when an admin edits the quotation.
    await resolveItemUnits(quotation.user.toString(), payload.items);

    quotation = await Quotation.findByIdAndUpdate(req.params.id, payload, {
        returnDocument: 'after',
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: quotation,
    });
});

// @desc    Delete quotation
// @route   DELETE /api/v1/quotations/:id
// @access  Private
export const deleteQuotation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
        return next(new ErrorResponse(`Quotation not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns quotation
    if (quotation.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this quotation`, 401));
    }

    await quotation.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
