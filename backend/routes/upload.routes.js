const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'tmp/' });
const { authenticateJWT } = require('../middleware/auth.middleware');
const { uploadCandidateDocAndSave } = require('../controllers/upload.controller');

// POST /api/uploads/candidate - accept a single file under field 'file'
// requires authentication
router.post('/candidate', authenticateJWT, upload.single('file'), uploadCandidateDocAndSave);

module.exports = router;
