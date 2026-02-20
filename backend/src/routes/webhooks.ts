/**
 * ============================================================================
 * Webhook Routes - DEPRECATED (Supabase → PostgreSQL Migration)
 * ============================================================================
 *
 * ⚠️ DEPRECATED: This file uses Supabase webhooks which are obsolete.
 * 
 * TODO (Future): Refactor using only PostgreSQL triggers or
 * application-level events instead of Supabase webhooks.
 * 
 * Endpoints (DISABLED):
 * - POST /api/webhooks/jobs/notify  - Nouvelle offre d'emploi
 * - POST /api/webhooks/matching/update - Mise à jour profil/CV
 *
 * Status: Commented out pending PostgreSQL event system implementation
 */

import express, { Router, Request, Response } from 'express';

// TODO: Replace with PostgreSQL-based event handling
// import crypto from 'crypto';
// import { verifyWebhookSecret } from '../middleware/auth.js';
// import { notificationQueue } from '../services/notificationQueue.js';
// import { pool } from '../config/database.js';

// ============================================================================
// SETUP
// ============================================================================

const router = Router();

// ============================================================================
// TYPES (DEPRECATED)
// ============================================================================

// TODO: Migrate to PostgreSQL triggers
/*
interface JobPostingWebhook {
  id: string;
  title: string;
  description: string;
  company_id: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  required_skills: string[];
  experience_level: 'Junior' | 'Intermédiaire' | 'Senior';
  created_at: string;
}

interface MatchingCandidate {
  id: string;
  email: string;
  push_token?: string;
  skills: string[];
  experience_level: 'Junior' | 'Intermédiaire' | 'Senior';
  target_salary_min?: number;
}
*/

// ============================================================================
// POST /api/webhooks/jobs/notify - DEPRECATED
// ============================================================================

/**
 * DEPRECATED: This endpoint is disabled pending PostgreSQL event system.
 * 
 * Previously: Supabase webhook for new job postings
 * Events: INSERT on public.jobs
 * 
 * TODO: Implement using PostgreSQL NOTIFY/LISTEN or application-level events
 */

/*
router.post('/webhooks/jobs/notify', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const job = req.body.record || req.body;
    console.log(`[Webhook Jobs] New job posting: ${job.id} (${job.title})`);

    if (!job.id || !job.title || !job.company_id) {
      res.status(400).json({ error: 'Missing required job fields' });
      return;
    }

    console.log(`[Webhook Jobs] Searching for candidates matching: ${job.required_skills?.join(', ')}`);

    const { rows: candidates } = await pool.query(
      `SELECT id, email, push_token, skills, experience_level, target_salary_min
       FROM candidates
       WHERE is_active = true AND notifications_enabled = true
       LIMIT 5000`,
      []
    );

    const matchingCandidates = candidates || [];
    console.log(`[Webhook Jobs] Found ${matchingCandidates.length} matching candidates`);

    // TODO: Re-implement with PostgreSQL event system
    // Old Supabase code kept for reference
    // const notificationTitle = `Nouvelle offre d'emploi: ${job.title}`;
    // await notificationQueue.add(...);
    // await pool.query(...);
    // res.status(200).json({...});

    res.status(503).json({
      success: false,
      message: 'Webhooks disabled - Pending PostgreSQL migration',
    });
  } catch (error) {
    console.error('[Webhook Jobs] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
*/

// ============================================================================
// POST /api/webhooks/matching/update - DEPRECATED
// ============================================================================

/**
 * DEPRECATED: This endpoint is disabled pending PostgreSQL event system.
 * 
 * Previously: Supabase webhook for candidate profile updates
 * Events: UPDATE on public.candidates
 * 
 * TODO: Implement using PostgreSQL NOTIFY/LISTEN or application-level events
 */

/*
router.post('/webhooks/matching/update', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const candidateRecord = req.body.record || req.body;
    const oldRecord = req.body.old_record;

    const candidateId = candidateRecord.id;
    const skillsChanged = oldRecord?.skills !== candidateRecord.skills;
    const experienceChanged = oldRecord?.experience_level !== candidateRecord.experience_level;

    console.log(`[Webhook Matching] Updating profile for candidate: ${candidateId}`);

    if (!skillsChanged && !experienceChanged) {
      res.status(200).json({ message: 'No changes to process' });
      return;
    }

    // TODO: Re-implement with PostgreSQL event system
    // Old Supabase code:
    // const { data: activeJobs } = await supabase
    //   .from('jobs')
    //   .select('id, title, required_skills, experience_level, salary_min, salary_max')
    //   .eq('status', 'active')
    //   .limit(500);

    res.status(503).json({
      success: false,
      message: 'Webhooks disabled - Pending PostgreSQL migration',
    });
  } catch (error) {
    console.error('[Webhook Matching] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
*/

// ============================================================================
// Temporary placeholder endpoint (webhooks disabled)
// ============================================================================

router.get('/webhooks/status', (req: Request, res: Response) => {
  res.status(503).json({
    status: 'disabled',
    message: 'Webhook routes are deprecated and awaiting PostgreSQL event system implementation',
    todo: 'Implement PostgreSQL NOTIFY/LISTEN or application-level events',
    timestamp: new Date().toISOString(),
  });
});

export default router;
