import express from 'express';
const router = express.Router();
import multer from 'multer';
const upload = multer({ dest: 'tmp/' });
import { requireUser } from '../middleware/auth.middleware.js';
import { uploadCandidateDocAndSave } from '../controllers/upload.controller.js';

// POST /api/uploads/candidate - accept a single file under field 'file'
// requires user token (candidate/company)
router.post('/candidate', requireUser, upload.single('file'), uploadCandidateDocAndSave);

export default router;
