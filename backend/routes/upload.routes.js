import express from 'express';
const router = express.Router();
import multer from 'multer';
const upload = multer({ dest: 'tmp/' });
import { requireUser } from '../middleware/auth.middleware.js';
import { uploadCandidateDocAndSave } from '../controllers/upload.controller.js';

// POST /api/uploads/candidate - accept a single file under field 'file'
// requires user token (candidate/company)
// choose storage destination based on docKey provided in body
import { createMulterForType } from '../config/upload.config.js';
// reuse the mapping defined in upload.service (or repeat minimal mapping here)
const DOC_TYPE_MAP = {
  cv: 'CV',
  lm: 'RESUME',
  diplome: 'DIPLOMA',
  certificat_travail: 'DIPLOMA',
  cni: 'IDENTITY',
  passeport: 'IDENTITY',
  carte_residence: 'IDENTITY',
  nui: 'IDENTITY',
  recepisse_acpe: 'IDENTITY'
};

function multerByDocKey(req, res, next) {
  const key = req.body.docKey;
  const type = DOC_TYPE_MAP[key] || 'CV';
  const uploader = createMulterForType(type);
  uploader.single('file')(req, res, next);
}

router.post('/candidate', requireUser, multerByDocKey, uploadCandidateDocAndSave);

// GET /api/uploads/secure/:type/:filename
// protected route for serving private files (CV, identity, etc.)
import { serveSecureFile } from '../controllers/upload.controller.js';
router.get('/secure/:type/:filename', requireUser, serveSecureFile);


export default router;
