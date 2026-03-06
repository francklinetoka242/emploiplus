import express from 'express';
const router = express.Router();
import multer from 'multer';
import aiController from '../controllers/ai.controller.js';

// Configure multer for PDF file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('[MULTER] fileFilter called for file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      console.log('[MULTER] ✅ PDF accepted');
      cb(null, true);
    } else {
      console.log('[MULTER] ❌ Non-PDF rejected:', file.mimetype);
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

/**
 * POST /api/ai/extract-cv
 * Extract factual data from a CV without scoring
 * 
 * Body: FormData with:
 *   - file: PDF file (CV)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "name": "...",
 *     "education": ["...", "..."],
 *     "experience_years": 5,
 *     "skills": ["...", "..."]
 *   }
 * }
 */
router.post('/extract-cv', upload.single('file'), aiController.extractCvData);

/**
 * POST /api/ai/analyze-cv
 * Analyze a CV against a job offer using Gemini AI
 * 
 * Body: JSON with:
 *   - jobId: ID of the job offer
 *   - cvData: Pre-extracted CV data object OR FormData with:
 *     - file: PDF file (CV)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "jobId": "...",
 *     "jobTitle": "...",
 *     "company": "...",
 *     "score_matching": 85,
 *     "matched_elements": ["...", "..."],
 *     "missing_requirements": ["...", "..."],
 *     "points_forts": ["...", "..."],
 *     "competences_manquantes": ["...", "..."],
 *     "lettre_motivation": "..."
 *   }
 * }
 */
// ✅ Add detailed logging middleware
router.post('/analyze-cv', (req, res, next) => {
  console.log('[ROUTE] ========== ANALYZE-CV ROUTE START ==========');
  console.log('[ROUTE] POST /api/ai/analyze-cv request received');
  console.log('[ROUTE] Headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent']?.substring(0, 50)
  });
  console.log('[ROUTE] URL:', req.url);
  console.log('[ROUTE] Query:', req.query);
  next();
}, upload.single('file'), (req, res, next) => {
  console.log('[ROUTE] ========== AFTER MULTER ==========');
  console.log('[ROUTE] After multer.single("file") middleware');
  console.log('[ROUTE] req.file:', req.file ? '✅ EXISTS' : '❌ MISSING');
  if (req.file) {
    console.log('[ROUTE] File details:');
    console.log('[ROUTE]   - fieldname:', req.file.fieldname);
    console.log('[ROUTE]   - originalname:', req.file.originalname);
    console.log('[ROUTE]   - mimetype:', req.file.mimetype);
    console.log('[ROUTE]   - size:', req.file.size, 'bytes');
    console.log('[ROUTE]   - buffer length:', req.file.buffer?.length || 0);
  }
  console.log('[ROUTE] req.body:', req.body);
  console.log('[ROUTE] Body keys:', Object.keys(req.body || {}));
  for (let [key, value] of Object.entries(req.body || {})) {
    console.log('[ROUTE]   - ' + key + ':', value);
  }
  console.log('[ROUTE] ========== CALLING CONTROLLER ==========');
  next();
}, aiController.analyzeCv);

// ===== ERROR HANDLING FOR MULTER =====
// Middleware d'erreur pour Multer - doit être défini APRÈS les routes
router.use((error, req, res, next) => {
  console.log('[ROUTE ERROR] Error handler middleware triggered');
  console.log('[ROUTE ERROR] Error type:', error.constructor.name);
  console.log('[ROUTE ERROR] Error message:', error.message);
  console.log('[ROUTE ERROR] Error code:', error.code);
  console.log('[ROUTE ERROR] Is MulterError?', error instanceof multer.MulterError);
  console.log('[ROUTE ERROR] Stack:', error.stack?.substring(0, 200));
  
  if (error instanceof multer.MulterError) {
    console.log('[ROUTE ERROR] ⚠️  Multer error code:', error.code);
    if (error.code === 'LIMIT_FILE_SIZE') {
      console.log('[ROUTE ERROR] File size exceeded');
      return res.status(413).json({ 
        message: 'Fichier trop volumineux. La taille maximale autorisée est de 50 MB.' 
      });
    }
    console.log('[ROUTE ERROR] Other multer error:', error.code);
    return res.status(400).json({ 
      message: `Erreur d'upload: ${error.message}` 
    });
  }
  
  if (error.message && error.message.includes('acceptés')) {
    console.log('[ROUTE ERROR] Non-PDF file rejected');
    return res.status(400).json({ 
      message: error.message 
    });
  }
  
  console.log('[ROUTE ERROR] Passing to next middleware');
  next(error);
});

/**
 * POST /api/ai/send-application
 * Send a job application with the analyzed CV and motivation letter
 * 
 * Body: JSON with:
 *   - jobId: ID of the job offer
 *   - candidateEmail: Candidate's email
 *   - companyEmail: Company contact email
 *   - letter: Motivation letter (can be edited by candidate)
 *   - matchingScore: CV matching score (0-100)
 *   - strengths: Array of candidate strengths
 *   - message: Additional message from candidate (optional)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Candidature envoyée avec succès",
 *   "data": {
 *     "applicationId": "app_...",
 *     "status": "sent",
 *     "recipientEmail": "...",
 *     "sentAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 */
router.post('/send-application', aiController.sendApplication);

export default router;
