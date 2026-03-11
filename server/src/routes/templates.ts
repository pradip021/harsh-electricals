import express from 'express';
import {
    getTemplates,
    createTemplate,
    deleteTemplate
} from '../controllers/templates';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getTemplates)
    .post(createTemplate);

router
    .route('/:id')
    .delete(deleteTemplate);

export default router;
