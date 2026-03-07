import uploadService from '../services/upload.service.js';
import path from 'path';
import { UPLOAD_CONFIG, getDestinationPath } from '../config/upload.config.js';

// Controller to handle candidate document upload
// expects `req.file` (from multer) and authenticated user on `req.user` or `req.body.userId`
async function uploadCandidateDocAndSave(req, res) {
  try {
    const file = req.file;
    const { docKey, dbColumn } = req.body;
    const userId = (req.user && req.user.id) || req.body.userId;

    const result = await uploadService.uploadCandidateDocAndSave(file, docKey, userId, dbColumn);

    if (result.success) {
      return res.json({ data: { url: result.url } });
    }

    return res.status(400).json({ message: result.message || 'Upload failed' });
  } catch (err) {
    console.error('upload.controller.uploadCandidateDocAndSave error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}



/**
 * Serve a private file from uploads/private/*
 * URL pattern: /api/uploads/secure/:type/:filename
 * Requires req.user to be set by authentication middleware
 */
function serveSecureFile(req, res) {
  const { type, filename } = req.params;
  const typeKey = type.toUpperCase();
  const config = UPLOAD_CONFIG.TYPES[typeKey];

  if (!config || config.public) {
    return res.status(404).json({ message: 'Type de fichier inconnu ou non sécurisé' });
  }

  // TODO: add authorization checks (owner, admin, etc.)
  const filePath = path.join(__dirname, '../../', getDestinationPath(typeKey), filename);

  res.sendFile(filePath, err => {
    if (err) {
      console.error('[UPLOAD] error sending secure file', err);
      return res.status(err.code === 'ENOENT' ? 404 : 500).end();
    }
  });
}

export { uploadCandidateDocAndSave, serveSecureFile };