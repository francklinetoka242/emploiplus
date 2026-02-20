import express from 'express';
import { listFaqs, getFaq, createFaq, updateFaq, deleteFaq } from '../controllers/faqs.controller.js';

const router = express.Router();

router.get('/', listFaqs);
router.get('/:id', getFaq);
router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;
