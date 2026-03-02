import express from 'express';
const router = express.Router();
import { getServices } from '../controllers/service.controller.js';

// GET /api/services - retrieve all available services
// no authentication required, public endpoint
router.get('/', getServices);

export default router;
