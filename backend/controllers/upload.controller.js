import uploadService from '../services/upload.service.js';

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

export { uploadCandidateDocAndSave };
