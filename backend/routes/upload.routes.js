import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import { UPLOAD_CONFIG, getDestinationPath } from '../config/upload.config.js';
const upload = multer({ dest: 'tmp/' });
import { requireUser } from '../middleware/auth.middleware.js';
import { uploadCandidateDocAndSave } from '../controllers/upload.controller.js';

// POST /api/uploads/candidate - accept a single file under field 'file'
// requires user token (candidate/company)
router.post('/candidate', requireUser, upload.single('file'), uploadCandidateDocAndSave);

// GET /api/uploads/secure/:type/:filename
// protected route for serving private files (CV, identity, etc.)
router.get('/secure/:type/:filename', requireUser, (req, res) => {
  const { type, filename } = req.params;
  const typeKey = type.toUpperCase();
  const config = UPLOAD_CONFIG.TYPES[typeKey];
  if (!config) {
    return res.status(404).json({ message: 'Type de fichier inconnu' });
  }
  if (config.public) {
    return res.status(400).json({ message: 'Ce fichier est accessible publiquement' });
  }

  const filePath = path.join(__dirname, '../../', getDestinationPath(typeKey), filename);

  // TODO: apply ownership/authorization checks based on req.user
  res.sendFile(filePath, err => {
    if (err) {
      console.error('Erreur en envoyant fichier sécurisé', err);
      return res.status(err.code === 'ENOENT' ? 404 : 500).end();
    }
  });
});

export default router;
