import express from 'express';
import * as DocumentationController from '../controllers/documentation.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route: obtenir un document par slug (pas d'authentification requise)
router.get('/public/:slug', DocumentationController.getPublicDocument);

// Protection pour les routes admin
const adminProtection = [requireAdmin, requireRoles('super_admin', 'admin')];

// Important: Mettre les routes avec des chemins spécifiques avant les routes dynamiques

// GET /api/documentations/stats - obtenir les statistiques
router.get('/stats', ...adminProtection, DocumentationController.getDocumentStats);

// GET /api/documentations - obtenir tous les documents
router.get('/', ...adminProtection, DocumentationController.getAllDocuments);

// POST /api/documentations - créer un document
router.post('/', ...adminProtection, DocumentationController.createDocument);

// GET /api/documentations/:id - obtenir un document par ID
router.get('/:id', ...adminProtection, DocumentationController.getDocumentById);

// PUT /api/documentations/:id - mettre à jour un document
router.put('/:id', ...adminProtection, DocumentationController.updateDocument);

// PATCH /api/documentations/:id/publish - publier/dépublier un document
router.patch('/:id/publish', ...adminProtection, DocumentationController.toggleDocumentPublish);

// DELETE /api/documentations/:id - supprimer un document
router.delete('/:id', ...adminProtection, DocumentationController.deleteDocument);

export default router;
