import { Response, NextFunction } from 'express';
import asyncHandler from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import Unit from '../models/Unit';
import Quotation from '../models/Quotation';
import { AuthRequest } from '../middleware/auth';
import { isReservedUnitName, normalizeUnitName, unitNameKey } from '../utils/units';

const DUPLICATE_KEY_ERROR = 11000;

const assertValidName = (name: string) => {
    if (!name) throw new ErrorResponse('Unit name is required', 400);
    if (isReservedUnitName(name)) throw new ErrorResponse(`"${name}" is a built-in unit and cannot be used as a custom unit`, 409);
};

const loadOwnedUnit = async (req: AuthRequest) => {
    const unit = await Unit.findById(req.params.id);
    if (!unit) throw new ErrorResponse(`Unit not found with id of ${req.params.id}`, 404);
    if (unit.user.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse(`User ${req.user.id} is not authorized to modify this unit`, 401);
    }
    return unit;
};

// @desc    Get custom units of the current user
// @route   GET /api/v1/units
// @access  Private
export const getUnits = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const units = await Unit.find({ user: req.user.id }).sort('nameKey');

    res.status(200).json({
        success: true,
        count: units.length,
        data: units,
    });
});

// @desc    Create custom unit
// @route   POST /api/v1/units
// @access  Private
export const createUnit = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const name = normalizeUnitName(req.body.name);
    assertValidName(name);

    const nameKey = unitNameKey(name);
    if (await Unit.exists({ user: req.user.id, nameKey })) {
        return next(new ErrorResponse(`A custom unit named "${name}" already exists`, 409));
    }

    try {
        const unit = await Unit.create({ user: req.user.id, name, nameKey });
        res.status(201).json({ success: true, data: unit });
    } catch (err: any) {
        if (err.code === DUPLICATE_KEY_ERROR) {
            return next(new ErrorResponse(`A custom unit named "${name}" already exists`, 409));
        }
        throw err;
    }
});

// @desc    Rename custom unit (items referencing it pick up the new name)
// @route   PUT /api/v1/units/:id
// @access  Private
export const updateUnit = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const unit = await loadOwnedUnit(req);
    const name = normalizeUnitName(req.body.name);
    assertValidName(name);

    const nameKey = unitNameKey(name);
    if (nameKey !== unit.nameKey && await Unit.exists({ user: unit.user, nameKey, _id: { $ne: unit._id } })) {
        return next(new ErrorResponse(`A custom unit named "${name}" already exists`, 409));
    }

    unit.name = name;
    unit.nameKey = nameKey;
    try {
        await unit.save();
    } catch (err: any) {
        if (err.code === DUPLICATE_KEY_ERROR) {
            return next(new ErrorResponse(`A custom unit named "${name}" already exists`, 409));
        }
        throw err;
    }

    // Items store a display copy of the name next to the unitId; keep it in sync for PDFs/views.
    const result = await Quotation.updateMany(
        { user: unit.user, 'items.unitId': unit._id },
        { $set: { 'items.$[item].unit': name } },
        { arrayFilters: [{ 'item.unitId': unit._id }] }
    );

    res.status(200).json({
        success: true,
        data: unit,
        updatedQuotations: result.modifiedCount,
    });
});

// @desc    Delete custom unit (refused while saved quotations still use it)
// @route   DELETE /api/v1/units/:id
// @access  Private
export const deleteUnit = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const unit = await loadOwnedUnit(req);

    const inUse = await Quotation.countDocuments({ user: unit.user, 'items.unitId': unit._id });
    if (inUse > 0) {
        return next(new ErrorResponse(
            `"${unit.name}" is used in ${inUse} saved quotation${inUse === 1 ? '' : 's'}. Change those items to another unit before deleting it.`,
            409
        ));
    }

    await unit.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
