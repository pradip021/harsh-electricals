import express from 'express';
import {
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation
} from '../controllers/quotations';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All quotation routes are protected

router
    .route('/')
    .get(getQuotations)
    .post(createQuotation);

router
    .route('/:id')
    .get(getQuotation)
    .put(updateQuotation)
    .delete(deleteQuotation);

export default router;
