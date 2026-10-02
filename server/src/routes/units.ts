import express from 'express';
import {
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit
} from '../controllers/units';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';
import { unitSchema, unitValidationOptions } from '../validators/unit';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getUnits)
    .post(validate(unitSchema, unitValidationOptions), createUnit);

router
    .route('/:id')
    .put(validate(unitSchema, unitValidationOptions), updateUnit)
    .delete(deleteUnit);

export default router;
