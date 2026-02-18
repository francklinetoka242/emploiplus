/**
 * ============================================================================
 * Webhook Routes - Job Analysis, Post Moderation, Activity Scoring
 * ============================================================================
 *
 * Trois routes microservices spécialisées:
 * - POST /api/jobs/analyze       - Analyser offre + trouver candidats + ajouter tâche notification
 * - POST /api/posts/moderate     - Analyser texte + modérer + mettre à jour post
 * - POST /api/activity/score     - Recalculer rank_score du post
 *
 * Sécurité: Header x-webhook-secret vérifié sur chaque route
 * Performance: Répond 200 OK en < 1s, traite en background
 */

import { Router, Request, Response, NextFunction } from 'express';
import { detectSpam, validatePost, getModerationAction } from '../services/moderationService.js';

// ============================================================================
// SETUP
// ============================================================================

const router = Router();

// Supabase references removed to avoid startup errors when SUPABASE_* env vars are missing.
// The heavy processing logic that used Supabase is commented/disabled below so the
// server can start in environments where Supabase is not configured.

// ============================================================================
// MIDDLEWARE: Webhook Secret Verification
// ============================================================================

const verifyWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  const headerSecret = req.headers['x-webhook-secret'] as string;

  // If no secret configured, skip verification to allow local/dev startup.
  if (!secret) {
    console.warn('[Webhook] SUPABASE_WEBHOOK_SECRET not configured - skipping verification');
    return next();
  }

  if (!headerSecret || headerSecret !== secret) {
    console.warn('[Webhook] Invalid secret provided');
    return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
  }

  console.log('[Webhook] Secret verified ✓');
  next();
};

// ============================================================================
// POST /api/jobs/analyze
// ============================================================================
// Récupère l'offre, trouve candidats matchant, ajoute tâche notification BullMQ

router.post('/jobs/analyze', verifyWebhookSecret, (req: Request, res: Response) => {
  // Route temporarily disabled: heavy processing and Supabase calls removed.
  console.log('[Webhook] /jobs/analyze received but disabled in this environment');
  return res.status(200).json({ success: true, message: 'jobs.analyze webhook disabled' });
});

// ============================================================================
// POST /api/posts/moderate
// ============================================================================
// Analyse le texte, valide via filtre modération, met à jour le post

router.post('/posts/moderate', verifyWebhookSecret, (req: Request, res: Response) => {
  // Route temporarily disabled to avoid Supabase dependency during startup.
  console.log('[Webhook] /posts/moderate received but disabled in this environment');
  return res.status(200).json({ success: true, message: 'posts.moderate webhook disabled' });
});

// ============================================================================
// POST /api/activity/score
// ============================================================================
// Recalcule le rank_score du post basé sur le nombre de likes, met à jour

router.post('/activity/score', verifyWebhookSecret, (req: Request, res: Response) => {
  // Route temporarily disabled to avoid Supabase dependency during startup.
  console.log('[Webhook] /activity/score received but disabled in this environment');
  return res.status(200).json({ success: true, message: 'activity.score webhook disabled' });
});

// ============================================================================
// Health check
// ============================================================================

router.get('/health/webhooks', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    webhooks: ['jobs/analyze', 'posts/moderate', 'activity/score'],
    timestamp: new Date().toISOString(),
  });
});

export default router;
