/**
 * TEMPLATE - Routes Module
 * 
 * Utilisez ce fichier comme template pour créer de nouvelles routes
 * 
 * Exemple: Pour créer src/routes/users.ts
 * 1. Copiez ce fichier
 * 2. Renommez les imports et fonctions
 * 3. Implémentez la logique métier
 * 4. Enregistrez dans routes/index.ts
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import { userAuth, adminAuth } from '../middleware/auth.js';
// import { getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = Router();

/**
 * Public Routes
 */

// Example: Get all items (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // TODO: Implement logic
    
    res.json({
      success: true,
      message: 'Not implemented yet',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

// Example: Get single item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement logic
    
    res.json({
      success: true,
      message: 'Not implemented yet',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

/**
 * Protected Routes (User Auth Required)
 */

// Example: Create item (requires authentication)
router.post('/', userAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { /* data */ } = req.body;
    
    // TODO: Implement logic
    
    res.status(201).json({
      success: true,
      message: 'Not implemented yet',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

// Example: Update item (requires authentication)
router.put('/:id', userAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { /* data */ } = req.body;
    
    // TODO: Implement logic
    
    res.json({
      success: true,
      message: 'Not implemented yet',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

// Example: Delete item (requires authentication)
router.delete('/:id', userAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    // TODO: Implement logic
    
    res.json({
      success: true,
      message: 'Not implemented yet',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

/**
 * Admin Routes
 */

// Example: Admin action (requires admin role)
router.post('/admin/action', adminAuth, async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).userId;
    const { /* data */ } = req.body;
    
    // TODO: Implement logic
    
    res.json({
      success: true,
      message: 'Not implemented yet',
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

export default router;

/**
 * COMMENT UTILISER CE TEMPLATE
 * 
 * 1. Créer un nouveau fichier: src/routes/example.ts
 * 
 * 2. Copier le contenu de ce template
 * 
 * 3. Modifier les imports:
 *    import { getExample, createExample } from '../controllers/exampleController.js';
 * 
 * 4. Remplacer les routes par votre logique:
 *    router.get('/', getExample);
 *    router.post('/', userAuth, createExample);
 * 
 * 5. Enregistrer dans routes/index.ts:
 *    import exampleRoutes from './example.js';
 *    app.use('/api/example', exampleRoutes);
 * 
 * 6. Créer le controller: src/controllers/exampleController.ts
 * 
 * 7. Implémenter la logique métier dans le controller
 * 
 * PATTERN RECOMMANDÉ:
 * - Routes minces: juste router.METHOD(path, middleware, handler)
 * - Logique dans controllers: getExample, createExample, etc.
 * - Requêtes DB dans models ou services
 * 
 * EXEMPLE COMPLET DISPONIBLE:
 * - Routes: src/routes/auth.ts
 * - Controller: src/controllers/authController.ts
 */
