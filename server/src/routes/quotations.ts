import express from 'express';
import {
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation
} from '../controllers/quotations';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';
import { createQuotationSchema, updateQuotationSchema, quotationValidationOptions } from '../validators/quotation';

const router = express.Router();

router.use(protect); // All quotation routes are protected

router
    .route('/')
    .get(getQuotations)
    .post(validate(createQuotationSchema, quotationValidationOptions), createQuotation);

router
    .route('/:id')
    .get(getQuotation)
    .put(validate(updateQuotationSchema, quotationValidationOptions), updateQuotation)
    .delete(deleteQuotation);

export default router;
