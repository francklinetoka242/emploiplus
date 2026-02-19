// backend/src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from 'nodemailer';
import { pool, isConnected, connectedPromise } from "./config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';
import { OAuth2Client } from "google-auth-library";
import { NewsfeedService } from "./services/newsfeedService.js";
import { SearchService } from "./services/searchService.js";
import { calculateMatchScore, generateCareerRoadmap, clearMatchingCacheForUser } from "./services/matchingService.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getSuggestions,
  getNetworkActivity,
  blockUser,
  unblockUser,
  isFollowing,
  getFollowingUsers,
  getFollowerUsers,
} from "./services/followService.js";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadCount,
  toggleMessageImportant,
  deleteMessage,
  deleteConversation,
  getMessageSubjects,
  createMessageSubject,
  reportMessage,
  hasConversation,
  getUnreadConversationsCount,
} from "./services/messagingService.js";
// ⚠️ DISABLED: Webhook and microservice imports commented out to allow server startup without Supabase
// import webhookMicroservices from "./routes/webhook-microservices.js";
// import { jobAnalysisQueue, postModerationQueue, activityScoringQueue, initializeQueues } from "./services/microserviceQueues.js";
const app = express();
// Mount modular auth routes if present
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/admin-auth.js';

//




// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
    }
  }
}
// Security middlewares
app.use(helmet());
// CORS: allow origins configured via CORS_ORIGINS env (comma-separated), fallback to localhost during dev + production domain
// Include production domain (emploiplus-group.com), common dev ports (Vite default 5173 and alternate 5174) and local network
const rawOrigins = process.env.CORS_ORIGINS || 'https://emploiplus-group.com,http://localhost:5173,http://localhost:5174,http://192.168.0.14:5173,http://192.168.0.14:5174';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim());
app.use(cors({ 
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true); // allow non-browser requests like curl/postman
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error('Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-webhook-secret']
}));
// Limit JSON body size to mitigate large payload attacks
// Increased to 10mb to allow base64 image uploads from the frontend
app.use(express.json({ limit: '10mb' }));
// Rate limiter for API endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api/', apiLimiter);
// ensure /api/auth endpoints available (routes/auth.ts)
app.use('/api/auth', authRoutes as any);
// Admin authentication routes (routes/admin-auth.ts)
app.use('/api/admin', adminAuthRoutes as any);

// ⚠️ DISABLED: Webhook microservices routes commented out to allow server startup without Supabase
// Uncomment when ready to enable webhooks
// app.use('/api', webhookMicroservices as any);
// JWT secret must come from env in production
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const userAuth = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ success: false, message: 'Token manquant' });
    const token = (auth.split(' ')[1] || "");
    try {
        console.log('userAuth token present:', !!token, 'masked:', token ? `${token.slice(0, 8)}...` : '');
        const decoded: any = jwt.verify(token, JWT_SECRET);
        console.log('userAuth decoded id:', decoded?.id, 'role:', decoded?.role);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        console.error('userAuth verify error:', (err as any)?.stack || (err as any)?.message || err);
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};
// Admin auth middleware - only allow admin roles
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ success: false, message: 'Token manquant' });
    const token = (auth.split(' ')[1] || "");
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const allowed = ['admin', 'super_admin', 'admin_content'];
        if (!decoded.role || !allowed.includes(decoded.role)) {
            return res.status(403).json({ success: false, message: 'Accès admin requis' });
        }
        req.userId = decoded.id; // admin id
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};
if (!isConnected) {
    console.warn("Database unavailable — skipping initial table creation and migrations.");
}
else {
    // Ensure the `faqs` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`).catch((err) => console.error("Could not ensure faqs table exists:", err));
    // Ensure the `jobs` table exists (including optional sector column)
    pool.query(`CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    company_id INTEGER NULL,
    location TEXT,
    sector TEXT,
    type TEXT,
    salary TEXT,
    description TEXT,
    image_url TEXT,
    application_url TEXT,
    deadline TIMESTAMP NULL,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure jobs table exists:", err));
    
    // Ensure the `job_matches` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS job_matches (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
      matched_skills TEXT,
      missing_skills TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(job_id, candidate_id)
    )`).catch((err) => console.error("Could not ensure job_matches table exists:", err));
    
    // Ensure the `activity_logs` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(50),
      target_type VARCHAR(50),
      target_id INTEGER,
      points_earned INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      INDEX idx_activity_user_created (user_id, created_at)
    )`).catch((err) => console.error("Could not ensure activity_logs table exists:", err));
    
    // Add columns to posts if not exists
    pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false`).catch(() => {});
    pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS flag_reason TEXT`).catch(() => {});
    pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP`).catch(() => {});
    
    // Add columns to users if not exists
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0`).catch(() => {});
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP`).catch(() => {});
    // Ensure the `saved_jobs` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
  )`).catch((err) => console.error("Could not ensure saved_jobs table exists:", err));
    // Add application_url column if it doesn't exist
    pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_url TEXT`).catch((err) => console.error("Could not add application_url column:", err));
    // Add company_id column if missing
    pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id INTEGER`).catch(() => { });
    // Add deadline column if missing
    pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline TIMESTAMP NULL`).catch((err) => console.error('Could not add deadline column:', err));
    // Ensure foreign key from jobs.company_id -> users.id and index for faster lookups
    pool.query(`ALTER TABLE jobs ADD CONSTRAINT fk_jobs_company_id FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL`).catch(() => { });
    pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id)`).catch(() => { });
    // Ensure the `formations` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS formations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    level TEXT,
    duration TEXT,
    price TEXT,
    description TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure formations table exists:", err));
    // Ensure the `testimonials` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    position TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure testimonials table exists:", err));
        // Ensure `admins` table exists with English column names (per migrated schema)
        pool.query(`CREATE TABLE IF NOT EXISTS public.admins (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(20),
        country VARCHAR(100),
        city VARCHAR(100),
        birth_date DATE,
        avatar_url TEXT DEFAULT 'https://ui-avatars.com/api/?name=Admin',
        role VARCHAR(50) NOT NULL DEFAULT 'content_admin',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    )`).catch((err) => console.error("Could not ensure admins table exists:", err));
        // Ensure English column names for admins table
        pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`).catch(() => { });
        pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`).catch(() => { });
        pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`).catch(() => { });
        pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS country VARCHAR(100)`).catch(() => { });
        pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS city VARCHAR(100)`).catch(() => { });
        pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS birth_date DATE`).catch(() => { });
    // Ensure `users` table exists with proper structure
    pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'candidate',
    phone TEXT,
    company_name TEXT,
    company_address TEXT,
    profession TEXT,
    job_title TEXT,
    diploma TEXT,
    experience_years INTEGER DEFAULT 0,
    profile_image_url TEXT,
    skills JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deletion_requested_at TIMESTAMP NULL,
    deletion_scheduled_at TIMESTAMP NULL,
    qualification TEXT,
    years_experience INTEGER,
    documents JSONB DEFAULT '{}',
    contract_type TEXT,
    availability TEXT,
    salary TEXT,
    linkedin TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure users table exists:", err));
    // Add any missing columns to existing table
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_contract_type TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_sector TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_location TEXT`).catch((err) => { });
    // Ensure users have a country column to enforce registration locality
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT`).catch((err) => { });
    // Add additional personal fields if missing
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality TEXT`).catch((err) => { });
    // Deletion workflow columns
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`).catch(() => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP NULL`).catch(() => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP NULL`).catch(() => { });
    // Add candidate profile columns
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience INTEGER`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS contract_type TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS availability TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS salary TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`).catch((err) => { });
    // Add company-specific columns for company profiles
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_email TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS headquarters TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_size TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS sector TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS mission TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS values TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS benefits TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS public_settings JSONB DEFAULT '{"company_logo": true, "company_name": true, "description": true, "sector": true, "company_size": true, "headquarters": true, "phone": true, "email": true, "website": true, "mission": true, "values": true, "benefits": true}'`).catch((err) => { });
    
    // Colonnes pour le Mode Recherche Discrète
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company INTEGER`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discreet_mode_enabled BOOLEAN DEFAULT false`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_from_company_id INTEGER`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_from_company_name TEXT`).catch((err) => { });
    
    // Ensure publications table exists for newsfeed
    pool.query(`CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'annonce',
    achievement BOOLEAN DEFAULT false,
    hashtags TEXT[],
    visibility TEXT DEFAULT 'public',
    is_active BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    contains_unmoderated_profanity BOOLEAN DEFAULT false,
    profanity_check_status TEXT DEFAULT 'pending',
    moderation_status TEXT DEFAULT 'pending',
    deleted_at TIMESTAMP NULL
  )`).catch((err) => console.error("Could not ensure publications table exists:", err));
    // Ensure `follows` table exists for user follow relationships
    pool.query(`CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure follows table exists:", err));
    pool.query(`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)`).catch((err) => { });
    pool.query(`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)`).catch((err) => { });
    
    // Ensure `blocks` table exists for user blocking
    pool.query(`CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    blocked_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure blocks table exists:", err));
    pool.query(`CREATE INDEX IF NOT EXISTS idx_blocks_user ON blocks(user_id)`).catch((err) => { });
    
    // Ensure `conversations` table exists for messaging
    pool.query(`CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    participant1_id INTEGER NOT NULL,
    participant2_id INTEGER NOT NULL,
    subject_id INTEGER,
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id),
    FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure conversations table exists:", err));
    pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant1_id)`).catch((err) => { });
    pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant2_id)`).catch((err) => { });
    
    // Ensure `messages` table exists for message history
    pool.query(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure messages table exists:", err));
    pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`).catch((err) => { });
    pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`).catch((err) => { });
    pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)`).catch((err) => { });
    pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read)`).catch((err) => { });
    
    // Ensure `message_subjects` table exists (predefined subjects for messages)
    pool.query(`CREATE TABLE IF NOT EXISTS message_subjects (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    subject_description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, subject_name),
    FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure message_subjects table exists:", err));
    pool.query(`CREATE INDEX IF NOT EXISTS idx_message_subjects_company ON message_subjects(company_id)`).catch((err) => { });
    
    // Ensure `message_attachments` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure message_attachments table exists:", err));
    
    // Ensure `message_reports` table exists for blocking/reporting
    pool.query(`CREATE TABLE IF NOT EXISTS message_reports (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason TEXT,
    report_type TEXT DEFAULT 'report',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure message_reports table exists:", err));
    
    // Ensure `publication_likes` table exists for tracking likes
    pool.query(`CREATE TABLE IF NOT EXISTS publication_likes (
    id SERIAL PRIMARY KEY,
    publication_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(publication_id, user_id),
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure publication_likes table exists:", err));
    // Ensure `portfolios` (réalisations) table exists for dynamic portfolio management
    pool.query(`CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    service_category TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure portfolios table exists:", err));
    // Ensure `communication_channels` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS communication_channels (
    id SERIAL PRIMARY KEY,
    channel_name TEXT NOT NULL,
    channel_url TEXT NOT NULL,
    channel_type TEXT NOT NULL,
    icon_name TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure communication_channels table exists:", err));
    // Ensure `service_catalogs` table exists for service catalog management
    pool.query(`CREATE TABLE IF NOT EXISTS service_catalogs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price INTEGER,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure service_catalogs table exists:", err));
    // Add optional columns for promotions and new flag if missing
    pool.query(`ALTER TABLE service_catalogs ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false`).catch(() => { });
    pool.query(`ALTER TABLE service_catalogs ADD COLUMN IF NOT EXISTS promotion TEXT`).catch(() => { });
    // Ensure `visitor_interactions` table exists to store basic analytics/events
    pool.query(`CREATE TABLE IF NOT EXISTS visitor_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NULL,
    service TEXT,
    event_type TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure visitor_interactions table exists:", err));
    // Ensure `user_documents` table exists for user-uploaded documents (CV, certificates, etc.)
    pool.query(`CREATE TABLE IF NOT EXISTS user_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    doc_type TEXT NOT NULL,
    title TEXT,
    storage_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure user_documents table exists:", err));
    // Ensure `user_skills` table exists for user skills/recommendations
    pool.query(`CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure user_skills table exists:", err));
    
    // Ensure job_requirements table exists for match scoring
    pool.query(`CREATE TABLE IF NOT EXISTS job_requirements (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    skill TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'technical',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE(job_id, skill)
  )`).catch((err) => console.error("Could not ensure job_requirements table exists:", err));
    
    // Ensure user_target_positions table exists for career roadmap
    pool.query(`CREATE TABLE IF NOT EXISTS user_target_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    target_job_id INTEGER NOT NULL,
    target_job_title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE(user_id, target_job_id)
  )`).catch((err) => console.error("Could not ensure user_target_positions table exists:", err));
    
    // Ensure formation_skills table exists to link formations with skills
    pool.query(`CREATE TABLE IF NOT EXISTS formation_skills (
    id SERIAL PRIMARY KEY,
    formation_id INTEGER NOT NULL,
    skill TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
    UNIQUE(formation_id, skill)
  )`).catch((err) => console.error("Could not ensure formation_skills table exists:", err));
    
    // Ensure verification requests table exists for account certification workflow
    pool.query(`CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    requested_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, revoked
    admin_id INTEGER,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure verification_requests table exists:", err));
    // Notifications table for simple in-app notifications
    pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    sender_id INTEGER,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
  )`).catch((err) => console.error("Could not ensure notifications table exists:", err));
    // Ensure sender_id column exists for existing databases
    pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id INTEGER`).catch(() => { });
    // Site-wide notifications targeting candidates/companies/all
    pool.query(`CREATE TABLE IF NOT EXISTS site_notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    target TEXT DEFAULT 'all', -- 'candidate' | 'company' | 'all'
    category TEXT,
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure site_notifications table exists:", err));
    // Ensure link column exists for site_notifications
    pool.query(`ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS link TEXT`).catch(() => { });
    // Welcome templates managed by admins (used at registration to send personalized welcome notifications)
    pool.query(`CREATE TABLE IF NOT EXISTS welcome_templates (
    id SERIAL PRIMARY KEY,
    user_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by_admin INTEGER NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error('Could not ensure welcome_templates table exists:', err));
}
// If DB connects later, ensure essential schema exists
connectedPromise.then(async () => {
    try {
        console.log('Ensuring essential DB schema after connection...');
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        user_type TEXT NOT NULL DEFAULT 'candidate',
        phone TEXT,
        company_name TEXT,
        company_address TEXT,
        profession TEXT,
        job_title TEXT,
        diploma TEXT,
        experience_years INTEGER DEFAULT 0,
        profile_image_url TEXT,
        skills JSONB DEFAULT '[]',
        is_verified BOOLEAN DEFAULT false,
        is_blocked BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        deletion_requested_at TIMESTAMP NULL,
        deletion_scheduled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS visitor_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NULL,
        service TEXT,
        event_type TEXT,
        payload JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS user_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        doc_type TEXT NOT NULL,
        title TEXT,
        storage_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        sender_id INTEGER,
        title TEXT NOT NULL,
        message TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )`);
        // Ensure sender_id column exists for existing databases
        await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id INTEGER`).catch(() => { });
        await pool.query(`CREATE TABLE IF NOT EXISTS site_notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT,
        target TEXT DEFAULT 'all',
        category TEXT,
        image_url TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
        // Ensure link column exists for site_notifications (safe for existing DBs)
        await pool.query(`ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS link TEXT`).catch(() => { });
        await pool.query(`CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, title TEXT NOT NULL, company TEXT, location TEXT, sector TEXT, type TEXT, salary TEXT, description TEXT, image_url TEXT, application_url TEXT, deadline TIMESTAMP NULL, published BOOLEAN DEFAULT false, published_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT NOW())`);
        console.log('Essential DB schema ensured.');
    }
    catch (e) {
        console.error('Error ensuring essential schema:', e);
    }
}).catch((e) => console.error('connectedPromise error:', e));
// ──────────────────────────────────────────────────
// 1. AUTH — INSCRIPTION & CONNEXION ADMIN
// ──────────────────────────────────────────────────
app.post("/api/admin/register", async (req, res) => {
    try {
        const { email, password, full_name, role = "admin" } = req.body;
        const { rows: existing } = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
        }
        const hashed = bcrypt.hashSync(password, 10);
        const { rows } = await pool.query(`INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`, [email, hashed, full_name || null, role]);
        const admin = rows[0];
        const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, admin });
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const { rows } = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
        const admin = rows[0];
        if (!admin || !bcrypt.compareSync(password, admin.password)) {
            return res.status(401).json({ success: false, message: "Identifiants incorrects" });
        }
        const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...safeAdmin } = admin;
        res.json({ success: true, token, admin: safeAdmin });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 2. OFFRES D'EMPLOI — API COMPLÈTE
// ──────────────────────────────────────────────────
// Import cache service
import { jobsSearchCache } from "./services/cacheService.js";

app.get("/api/jobs", async (req, res) => {
    try {
        // Paramètres de recherche
        const q = (req.query.q || req.query.search || '');
        const locationFilter = (req.query.location || '');
        const companyFilter = (req.query.company || '');
        const sectorFilter = (req.query.sector || '');
        const typeFilter = (req.query.type || '');
        
        // Pagination optimisée: 12 offres par page
        const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
        const limit = 12; // Fixe à 12 items
        const offset = (page - 1) * limit;

        // Générer une clé de cache basée sur les paramètres
        const cacheKey = jobsSearchCache.generateKey({
            q, locationFilter, companyFilter, sectorFilter, typeFilter, page
        });

        // Vérifier le cache
        const cachedResult = jobsSearchCache.get(cacheKey);
        if (cachedResult) {
            return res.json({
                data: cachedResult.data,
                pagination: cachedResult.pagination,
                fromCache: true,
                cacheAge: Math.round((Date.now() - cachedResult.cacheTime) / 1000),
            });
        }

        // Construire la requête SQL optimisée (sans description complète)
        const conditions = ['published = true'];
        const params = [];
        let idx = 1;

        if (q && String(q).trim()) {
            const like = `%${String(q).trim()}%`;
            conditions.push(`(title ILIKE $${idx} OR company ILIKE $${idx} OR location ILIKE $${idx} OR sector ILIKE $${idx})`);
            params.push(like);
            idx++;
        }
        if (locationFilter && String(locationFilter).trim()) {
            conditions.push(`location ILIKE $${idx}`);
            params.push(`%${String(locationFilter).trim()}%`);
            idx++;
        }
        if (companyFilter && String(companyFilter).trim()) {
            conditions.push(`company ILIKE $${idx}`);
            params.push(`%${String(companyFilter).trim()}%`);
            idx++;
        }
        if (sectorFilter && String(sectorFilter).trim()) {
            conditions.push(`sector ILIKE $${idx}`);
            params.push(`%${String(sectorFilter).trim()}%`);
            idx++;
        }
        if (typeFilter && String(typeFilter).trim()) {
            conditions.push(`type = $${idx}`);
            params.push(String(typeFilter).trim());
            idx++;
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Ajouter les paramètres de pagination à la fin
        params.push(limit);
        params.push(offset);

        // Requête pour les données (sans description complète pour réduire la consommation)
        const sql = `
            SELECT 
                id, title, company, company_id, location, 
                type, sector, salary, application_via_emploi, application_url, 
                deadline, published_at, created_at, published
            FROM jobs 
            ${where} 
            ORDER BY created_at DESC 
            LIMIT $${idx} OFFSET $${idx + 1}
        `;

        // Requête pour le total (sans limit/offset)
        const countParams = params.slice(0, -2);
        const countSql = `SELECT COUNT(*) as total FROM jobs ${where}`;

        const [jobsResult, countResult] = await Promise.all([
            pool.query(sql, params),
            pool.query(countSql, countParams),
        ]);

        const rows = jobsResult.rows || [];
        const total = parseInt(countResult.rows[0]?.total || '0', 10);

        // Normaliser les données
        const normalized = rows.map((r) => ({
            ...r,
            application_via_emploi: !!r.application_via_emploi,
            published: !!r.published,
        }));

        // Préparer la réponse
        const response = {
            data: normalized,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                hasNextPage: offset + limit < total,
                hasPreviousPage: page > 1,
            },
            cacheTime: Date.now(),
        };

        // Stocker en cache pour 5 minutes
        jobsSearchCache.set(cacheKey, response);

        res.json({
            ...response,
            fromCache: false,
        });
    }
    catch (err) {
        console.error('Get jobs error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
app.post("/api/jobs", userAuth, async (req, res) => {
    try {
        const { title, company: bodyCompany, location, sector = null, type, salary, description, application_url, application_via_emploi = false, deadline = null } = req.body;
        // Determine company name: prefer company of authenticated company user, otherwise use provided body value
        let companyName = bodyCompany || null;
        if (req.userRole && String(req.userRole).toLowerCase() === 'company') {
            const { rows: urows } = await pool.query('SELECT company_name FROM users WHERE id = $1', [req.userId]);
            if (urows.length > 0)
                companyName = urows[0].company_name;
        }
        if (!companyName)
            return res.status(400).json({ success: false, message: 'Company name required' });
        const isCompanyOwned = req.userRole && String(req.userRole).toLowerCase() === 'company' ? true : false;
        const { rows } = await pool.query(`INSERT INTO jobs (title, company, company_id, location, sector, type, salary, description, application_url, application_via_emploi, deadline, is_company_owned, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
       RETURNING *`, [
            title,
            companyName,
            (req.userRole && String(req.userRole).toLowerCase() === 'company') ? req.userId : null,
            location,
            sector,
            type,
            salary || null,
            description,
            application_url || null,
            application_via_emploi || false,
            deadline || null,
            isCompanyOwned,
        ]);
        res.json({ success: true, job: rows[0] });
    }
    catch (err) {
        console.error("Error creating job:", err);
        res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
});
// Get a single job by id — public when published, or accessible to owning company/admin
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ success: false, message: 'ID invalide' });
        // try to extract user from token if present to allow company owners to view their unpublished jobs
        let requesterId = null;
        let requesterRole = null;
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
            const token = auth.split(' ')[1] || '';
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                requesterId = decoded.id || null;
                requesterRole = decoded.role || null;
            }
            catch (e) {
                // ignore invalid token
            }
        }
        const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1 LIMIT 1', [id]);
        if (!rows || rows.length === 0)
            return res.status(404).json({ success: false, message: 'Offre introuvable' });
        const job = rows[0];
        const isOwner = requesterId && job.company_id && job.company_id === requesterId;
        const isAdmin = requesterRole && String(requesterRole).toLowerCase() === 'admin';
        if (!job.published && !isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }
        // Ensure boolean fields are explicit to avoid undefined on the client
        job.application_via_emploi = !!job.application_via_emploi;
        job.is_company_owned = !!job.is_company_owned;
        job.published = !!job.published;
        res.json(job);
    }
    catch (err) {
        console.error('Get job by id error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Get full description for a job (lazy loading)
// Endpoint optimisé: ne retourne que la description complète, sans autres données
app.get('/api/jobs/:id/description', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ success: false, message: 'ID invalide' });

        const { rows } = await pool.query(
            'SELECT id, description FROM jobs WHERE id = $1 AND published = true LIMIT 1',
            [id]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Offre introuvable' });
        }

        const { description } = rows[0];

        res.json({
            id,
            description: description || '',
        });
    }
    catch (err) {
        console.error('Get job description error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

app.put("/api/jobs/:id", userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, company: bodyCompany, location, sector = null, type, salary, description, application_url, application_via_emploi = false, deadline = null } = req.body;
        // Check ownership: if company user, ensure they own the job
        if (req.userRole && String(req.userRole).toLowerCase() === 'company') {
            const { rows: jrows } = await pool.query('SELECT company FROM jobs WHERE id = $1', [id]);
            if (!jrows || jrows.length === 0)
                return res.status(404).json({ success: false, message: 'Offre introuvable' });
            const jobCompany = jrows[0].company;
            const { rows: urows } = await pool.query('SELECT company_name FROM users WHERE id = $1', [req.userId]);
            const companyName = urows && urows[0] ? urows[0].company_name : null;
            if (!companyName || String(companyName).trim() !== String(jobCompany).trim()) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }
        }
        // Build update with fixed param order: allow updating company only if bodyCompany provided (admin)
        if (bodyCompany) {
            await pool.query(`UPDATE jobs SET title=$1, company=$2, location=$3, sector=$4, type=$5, salary=$6, description=$7, application_url=$8, application_via_emploi=$9, deadline=$10 WHERE id=$11`, [title, bodyCompany, location, sector, type, salary || null, description, application_url || null, application_via_emploi, deadline || null, id]);
        }
        else {
            await pool.query(`UPDATE jobs SET title=$1, location=$2, sector=$3, type=$4, salary=$5, description=$6, application_url=$7, application_via_emploi=$8, deadline=$9 WHERE id=$10`, [title, location, sector, type, salary || null, description, application_url || null, application_via_emploi, deadline || null, id]);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Error updating job:', err);
        res.status(500).json({ success: false });
    }
});
// Ensure jobs table has application_via_emploi column
pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_via_emploi BOOLEAN DEFAULT false`).catch(() => { });
// Ensure jobs table has is_company_owned column to mark jobs created by company accounts
pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_company_owned BOOLEAN DEFAULT false`).catch(() => { });
// Heuristic backfill: mark as company-owned when company_id matches a company user and job created_at is after user's created_at
pool.query(`UPDATE jobs SET is_company_owned = true
   FROM users u
   WHERE jobs.company_id = u.id
     AND lower(coalesce(u.user_type,'')) = 'company'
     AND jobs.created_at >= u.created_at`).then((r) => console.log('Backfilled jobs.is_company_owned rows:', r.rowCount)).catch((err) => console.error('Error backfilling is_company_owned', err));
// Job applications table
pool.query(`CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    cv_url TEXT,
    cover_letter_url TEXT,
    additional_docs JSONB DEFAULT '[]',
    message TEXT,
    status TEXT DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error('Could not ensure job_applications table exists:', err));
// Add company_id foreign key (company that posted the job) and index
pool.query(`ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS company_id INTEGER`).catch(() => { });
pool.query(`ALTER TABLE job_applications ADD CONSTRAINT fk_job_applications_company_id FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL`).catch(() => { });
pool.query(`CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id)`).catch(() => { });
pool.query(`CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON job_applications(company_id)`).catch(() => { });
// Create a text search GIN index on jobs to improve search performance
pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(company,'') || ' ' || coalesce(location,'') || ' ' || coalesce(sector,'')))`).catch(() => { });
// Backfill company_id on jobs when company name matches a company user (helps companies see their offers)
pool.query(`UPDATE jobs SET company_id = u.id
   FROM users u
   WHERE jobs.company_id IS NULL
     AND lower(trim(coalesce(jobs.company,''))) = lower(trim(coalesce(u.company_name,'')))
     AND lower(coalesce(u.user_type,'')) = 'company'`).then((r) => console.log('Backfilled jobs.company_id rows:', r.rowCount)).catch((err) => console.error('Error backfilling jobs.company_id', err));
// Backfill company_id on job_applications from jobs table when missing
pool.query(`UPDATE job_applications ja SET company_id = j.company_id
   FROM jobs j
   WHERE ja.company_id IS NULL
     AND ja.job_id = j.id
     AND j.company_id IS NOT NULL`).then((r) => console.log('Backfilled job_applications.company_id rows:', r.rowCount)).catch((err) => console.error('Error backfilling job_applications.company_id', err));
// Further backfill: match company name from jobs to users table for applications still missing company_id
pool.query(`UPDATE job_applications ja SET company_id = u.id
   FROM jobs j, users u
   WHERE ja.company_id IS NULL
     AND ja.job_id = j.id
     AND j.company IS NOT NULL
     AND lower(trim(u.company_name)) = lower(trim(j.company))`).then((r) => console.log('Backfilled job_applications.company_id by company name:', r.rowCount)).catch((err) => console.error('Error backfilling by company name', err));
// (auth middleware defined earlier)
// Submit a job application (candidate)
app.post('/api/job-applications', userAuth, async (req, res) => {
    try {
        const applicantId = req.userId;
        const { job_id, cv_url = null, cover_letter_url = null, additional_docs = [], message = null } = req.body;
        if (!applicantId)
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        // get job to determine company
        const { rows: jobRows } = await pool.query('SELECT id, company, company_id, application_via_emploi, title FROM jobs WHERE id = $1', [job_id]);
        if (!jobRows || jobRows.length === 0)
            return res.status(404).json({ success: false, message: 'Offre introuvable' });
        const job = jobRows[0];
        // refuse applications when application_via_emploi is not enabled for this job
        if (!job.application_via_emploi) {
            return res.status(403).json({ success: false, message: 'Candidature non autorisée pour cette offre' });
        }
        let companyId = null;
        if (job.company_id) {
            companyId = job.company_id;
        }
        else if (job.company) {
            // try case-insensitive match on company_name
            const { rows: compRows } = await pool.query('SELECT id FROM users WHERE lower(trim(company_name)) = lower(trim($1)) LIMIT 1', [job.company]);
            companyId = compRows && compRows[0] ? compRows[0].id : null;
        }
        const { rows: ins } = await pool.query(`INSERT INTO job_applications (job_id, applicant_id, company_id, cv_url, cover_letter_url, additional_docs, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [job_id, applicantId, companyId, cv_url, cover_letter_url, JSON.stringify(additional_docs), message]);
        // create a notification for the company if companyId available
        try {
            if (companyId) {
                const notifTitle = `Nouvelle candidature — ${job.title || 'offre'}`;
                const notifMsg = `Une nouvelle candidature a été reçue pour votre offre "${job.title || ''}".`;
                await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)', [companyId, notifTitle, notifMsg]);
                // push SSE event to connected company clients
                try {
                    const clients = sseClients.get(companyId);
                    if (clients && clients.size > 0) {
                        const payload = JSON.stringify(ins[0]);
                        for (const r of Array.from(clients)) {
                            try {
                                (r as any).write(`event: new_application\n`);
                                (r as any).write(`data: ${payload}\n\n`);
                            }
                            catch (e) {
                                // ignore write errors
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn('Failed to push SSE to company clients', e);
                }
            }
        }
        catch (e) {
            console.warn('Could not create company notification for application', e);
        }
        res.json({ success: true, application: ins[0] });
    }
    catch (err) {
        console.error('Error submitting application:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur' });
    }
});
// Get applications for the authenticated company
app.get('/api/company/applications', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        // ensure user is company
        const { rows: urows } = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
        if (!urows || urows.length === 0)
            return res.status(404).json({ success: false });
        if (String(urows[0].user_type).toLowerCase() !== 'company')
            return res.status(403).json({ success: false, message: 'Accès réservé aux entreprises' });
        // Also include applications where the job's company name matches this company's name
        const { rows: companyInfo } = await pool.query('SELECT company_name FROM users WHERE id = $1 LIMIT 1', [userId]);
        const companyName = companyInfo && companyInfo[0] ? companyInfo[0].company_name : null;
        const companyNameParam = companyName || '';
        const { rows } = await pool.query(`SELECT ja.*, j.title as job_title, u.full_name as applicant_name, u.email as applicant_email
       FROM job_applications ja
       LEFT JOIN jobs j ON j.id = ja.job_id
       LEFT JOIN users u ON u.id = ja.applicant_id
       WHERE (ja.company_id = $1)
         OR (j.company_id = $1)
         OR (j.company IS NOT NULL AND lower(trim(j.company)) = lower(trim($2)))
       ORDER BY ja.created_at DESC`, [userId, companyNameParam]);
        res.json(rows || []);
    }
    catch (err) {
        console.error('Error fetching company applications:', err);
        // Return an empty array instead of 500 to keep frontend functional
        // Frontend will display "Aucune candidature reçue." when array is empty
        res.json([]);
    }
});
// Company: validations history (validated/accepted/declined)
app.get('/api/company/validations', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        const { rows: urows } = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
        if (!urows || urows.length === 0)
            return res.status(404).json({ success: false });
        if (urows[0].user_type !== 'company')
            return res.status(403).json({ success: false, message: 'Accès réservé aux entreprises' });
        const { rows } = await pool.query(`SELECT ja.*, j.title as job_title, u.full_name as applicant_name, u.email as applicant_email
       FROM job_applications ja
       LEFT JOIN jobs j ON j.id = ja.job_id
       LEFT JOIN users u ON u.id = ja.applicant_id
       WHERE (ja.company_id = $1 OR j.company_id = $1) AND ja.status IN ('validated','accepted','declined')
       ORDER BY ja.created_at DESC`, [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Error fetching company validations:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: all validations history with optional filters
app.get('/api/admin/validations', adminAuth, async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : null; // validated, accepted, declined
        const companyId = req.query.company_id ? String(req.query.company_id) : null;
        const params = [];
        let where = 'WHERE ja.status IN (\'validated\', \'accepted\', \'declined\')';
        if (status) {
            params.push(status);
            where += ` AND ja.status = $${params.length}`;
        }
        if (companyId) {
            params.push(companyId);
            where += ` AND ja.company_id = $${params.length}`;
        }
        const q = `SELECT ja.*, j.title as job_title, u.full_name as applicant_name, u.email as applicant_email, c.company_name as company_name FROM job_applications ja LEFT JOIN jobs j ON j.id = ja.job_id LEFT JOIN users u ON u.id = ja.applicant_id LEFT JOIN users c ON c.id = ja.company_id ${where} ORDER BY ja.created_at DESC LIMIT 1000`;
        const { rows } = await pool.query(q, params);
        res.json(rows);
    }
    catch (err) {
        console.error('Admin validations error:', err);
        res.status(500).json({ success: false });
    }
});
// Company: send interview invitation to an applicant for a specific application
app.post('/api/company/applications/:id/interview', userAuth, async (req, res) => {
    try {
        const companyId = req.userId;
        const { id } = req.params; // application id
        const { date_time, place, message: customMessage } = req.body || {};
        // load application and job to verify ownership
        const { rows: appRows } = await pool.query('SELECT ja.*, j.title as job_title, j.company_id, j.company as job_company FROM job_applications ja LEFT JOIN jobs j ON j.id = ja.job_id WHERE ja.id = $1', [id]);
        if (!appRows || appRows.length === 0)
            return res.status(404).json({ success: false, message: 'Candidature introuvable' });
        const appRow = appRows[0];
        // verify company ownership: either company_id matches or job_company matches this company's name
        const { rows: urows } = await pool.query('SELECT company_name, user_type FROM users WHERE id = $1', [companyId]);
        const companyUser = urows && urows[0] ? urows[0] : null;
        const companyName = companyUser && companyUser.company_name ? String(companyUser.company_name) : null;
        const owns = (appRow.company_id && appRow.company_id === companyId) || (companyUser && String(companyUser.company_name || '').trim() === String(appRow.job_company || '').trim());
        if (!owns)
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        // create notification for applicant
        const applicantId = appRow.applicant_id;
        const jobTitle = appRow.job_title || 'votre candidature';
        const defaultTitle = companyName ? `Convocation entretien - ${jobTitle} - ${companyName}` : `Convocation entretien - ${jobTitle}`;
        // Build default message including company name when available
        let defaultMessage = companyName ? `Félicitations, vous êtes invité(e) à un entretien chez ${companyName} pour le poste "${jobTitle}".` : `Félicitations, vous êtes invité(e) à un entretien pour le poste "${jobTitle}".`;
        if (date_time)
            defaultMessage += `\nDate & heure : ${date_time}`;
        if (place)
            defaultMessage += `\nLieu : ${place}`;
        defaultMessage += `\n\n${(customMessage && typeof customMessage === 'object' && customMessage.body) ? customMessage.body : (typeof customMessage === 'string' ? customMessage : 'Veuillez confirmer votre disponibilité.')}`;
        const notifTitle = (customMessage && typeof customMessage === 'object' && customMessage.title) ? customMessage.title : defaultTitle;
        const notifBody = (customMessage && typeof customMessage === 'object' && customMessage.body) ? customMessage.body : (typeof customMessage === 'string' ? customMessage : defaultMessage);
        await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)', [applicantId, notifTitle, notifBody]);
        res.json({ success: true, message: 'Notification envoyée' });
    }
    catch (err) {
        console.error('Send interview notification error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// DEBUG: list recent job_applications (only enabled in non-production for safety)
app.get('/api/debug/job-applications', async (req, res) => {
    if (process.env.NODE_ENV === 'production')
        return res.status(403).json({ success: false, message: 'Disabled in production' });
    try {
        const { rows } = await pool.query('SELECT * FROM job_applications ORDER BY created_at DESC LIMIT 200');
        res.json(rows || []);
    }
    catch (err) {
        console.error('Debug job_applications error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur' });
    }
});
// Company: validate an applicant (mark application validated and notify candidate)
app.post('/api/company/applications/:id/validate', userAuth, async (req, res) => {
    try {
        const companyId = req.userId;
        const { id } = req.params; // application id
        const { date_time, place, message: customMessage } = req.body;
        // load application and job to verify ownership
        const { rows: appRows } = await pool.query('SELECT ja.*, j.title as job_title, j.company_id, j.company as job_company FROM job_applications ja LEFT JOIN jobs j ON j.id = ja.job_id WHERE ja.id = $1', [id]);
        if (!appRows || appRows.length === 0)
            return res.status(404).json({ success: false, message: 'Candidature introuvable' });
        const appRow = appRows[0];
        // verify company ownership
        const { rows: urows } = await pool.query('SELECT company_name, user_type FROM users WHERE id = $1', [companyId]);
        const companyUser = urows && urows[0] ? urows[0] : null;
        const companyName = companyUser && companyUser.company_name ? String(companyUser.company_name) : null;
        const owns = (appRow.company_id && appRow.company_id === companyId) || (companyUser && String(companyUser.company_name || '').trim() === String(appRow.job_company || '').trim());
        if (!owns)
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        // mark application as validated
        await pool.query('UPDATE job_applications SET status = $1 WHERE id = $2', ['validated', id]);
        // create notification for applicant
        const applicantId = appRow.applicant_id;
        const jobTitle = appRow.job_title || 'votre candidature';
        const defaultTitle = companyName ? `Sélectionné pour entretien - ${jobTitle} - ${companyName}` : `Sélectionné pour entretien - ${jobTitle}`;
        const builtMessage = companyName ? `Félicitations, vous avez été validé(e) par ${companyName} pour le poste "${jobTitle}".` : `Félicitations, vous avez été validé(e) pour le poste "${jobTitle}".`;
        const defaultMessage = `${builtMessage}\n${date_time ? `Date & heure : ${date_time}\n` : ''}${place ? `Lieu : ${place}\n` : ''}\n${(customMessage && typeof customMessage === 'object' && customMessage.body) ? customMessage.body : (typeof customMessage === 'string' ? customMessage : 'Veuillez consulter votre espace pour plus de détails.')}`;
        const notifTitle = (customMessage && typeof customMessage === 'object' && customMessage.title) ? customMessage.title : defaultTitle;
        const notifBody = (customMessage && typeof customMessage === 'object' && customMessage.body) ? customMessage.body : (typeof customMessage === 'string' ? customMessage : defaultMessage);
        await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)', [applicantId, notifTitle, notifBody]);
        res.json({ success: true, message: 'Candidat validé et notification envoyée' });
    }
    catch (err) {
        console.error('Validate application error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Candidate: accept a validation / convocation (respond to company's validation)
app.post('/api/applications/:id/accept', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params; // application id
        const { message } = req.body;
        const { rows: appRows } = await pool.query('SELECT ja.*, j.title as job_title, j.company_id, j.company as job_company FROM job_applications ja LEFT JOIN jobs j ON j.id = ja.job_id WHERE ja.id = $1', [id]);
        if (!appRows || appRows.length === 0)
            return res.status(404).json({ success: false, message: 'Candidature introuvable' });
        const appRow = appRows[0];
        if (appRow.applicant_id !== userId)
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        // Only allow accept if status is validated or submitted
        await pool.query('UPDATE job_applications SET status = $1 WHERE id = $2', ['accepted', id]);
        // notify company
        const companyId = appRow.company_id;
        const jobTitle = appRow.job_title || 'votre candidature';
        const title = `Candidat a accepté la convocation - ${jobTitle}`;
        const body = message ? `Le candidat a répondu: ${message}` : `Le candidat a accepté la convocation pour le poste "${jobTitle}".`;
        if (companyId) {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)', [companyId, title, body]);
        }
        res.json({ success: true, message: 'Réponse enregistrée' });
    }
    catch (err) {
        console.error('Accept application error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// Candidate: decline a validation / convocation
app.post('/api/applications/:id/decline', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params; // application id
        const { message } = req.body;
        const { rows: appRows } = await pool.query('SELECT ja.*, j.title as job_title, j.company_id, j.company as job_company FROM job_applications ja LEFT JOIN jobs j ON j.id = ja.job_id WHERE ja.id = $1', [id]);
        if (!appRows || appRows.length === 0)
            return res.status(404).json({ success: false, message: 'Candidature introuvable' });
        const appRow = appRows[0];
        if (appRow.applicant_id !== userId)
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        await pool.query('UPDATE job_applications SET status = $1 WHERE id = $2', ['declined', id]);
        // notify company
        const companyId = appRow.company_id;
        const jobTitle = appRow.job_title || 'votre candidature';
        const title = `Candidat a décliné la convocation - ${jobTitle}`;
        const body = message ? `Le candidat a répondu: ${message}` : `Le candidat a décliné la convocation pour le poste "${jobTitle}".`;
        if (companyId) {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)', [companyId, title, body]);
        }
        res.json({ success: true, message: 'Réponse enregistrée' });
    }
    catch (err) {
        console.error('Decline application error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// Candidate: list own applications
app.get('/api/applications', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        const { rows } = await pool.query(`SELECT ja.*, j.title as job_title, j.company as job_company, u.full_name as company_name
       FROM job_applications ja
       LEFT JOIN jobs j ON j.id = ja.job_id
       LEFT JOIN users u ON u.id = j.company_id
       WHERE ja.applicant_id = $1
       ORDER BY ja.created_at DESC`, [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get my applications error:', err);
        res.status(500).json({ success: false });
    }
});
app.patch("/api/jobs/:id/publish", userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        // If company user, ensure ownership
        if (req.userRole && String(req.userRole).toLowerCase() === 'company') {
            const { rows: jrows } = await pool.query('SELECT company_id FROM jobs WHERE id = $1', [id]);
            if (!jrows || jrows.length === 0)
                return res.status(404).json({ success: false });
            const jobCompanyId = jrows[0].company_id;
            if (jobCompanyId !== req.userId)
                return res.status(403).json({ success: false, message: 'Accès refusé' });
        }
        if (published) {
            await pool.query("UPDATE jobs SET published = $1, published_at = NOW() WHERE id = $2", [published, id]);
        }
        else {
            await pool.query("UPDATE jobs SET published = $1, published_at = NULL WHERE id = $2", [published, id]);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Publish job error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete("/api/jobs/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 3. FORMATIONS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/formations", async (req, res) => {
    try {
        const limit = parseInt(String(req.query.limit || '50'), 10);
        const offset = parseInt(String(req.query.offset || '0'), 10);
        const { rows } = await pool.query(
            "SELECT * FROM formations WHERE published = true ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            [limit, offset]
        );
        const countResult = await pool.query("SELECT COUNT(*) as total FROM formations WHERE published = true");
        const total = parseInt(countResult.rows[0]?.total || '0', 10);
        res.json({ formations: rows, total });
    }
    catch (err) {
        console.error('Get formations error:', err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/formations", async (req, res) => {
    try {
        const { title, category, level, duration, price, description } = req.body;
        const { rows } = await pool.query(`INSERT INTO formations (title, category, level, duration, price, description, published)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`, [title, category, level, duration, price || null, description]);
        res.json({ success: true, formation: rows[0] });
    }
    catch (err) {
        console.error("Error creating formation:", err);
        res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
});
app.put("/api/formations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, level, duration, price, description } = req.body;
        const { rows } = await pool.query(`UPDATE formations SET title=$1, category=$2, level=$3, duration=$4, price=$5, description=$6 WHERE id=$7
       RETURNING *`, [title, category, level, duration, price || null, description, id]);
        res.json({ success: true, formation: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.patch("/api/formations/:id/publish", async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        if (published) {
            await pool.query("UPDATE formations SET published = $1, published_at = NOW() WHERE id = $2", [published, id]);
        }
        else {
            await pool.query("UPDATE formations SET published = $1, published_at = NULL WHERE id = $2", [published, id]);
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/formations/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM formations WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 4. GESTION DES ADMINS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/admins", async (_, res) => {
    const { rows } = await pool.query("SELECT id, email, full_name, role, created_at FROM admins ORDER BY created_at DESC");
    res.json(rows);
});
// Création par Super Admin
app.post("/api/admin/create", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return res.status(401).json({ success: false });
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Accès refusé" });
        }
        const { email, password, firstName, lastName, phone = null, country = null, city = null, birth_date = null, avatar_url = null, role = "content_admin" } = req.body;
        const check = await pool.query("SELECT id FROM admins WHERE email = $1", [email.toLowerCase()]);
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email déjà utilisé" });
        }
        const hashed = bcrypt.hashSync(password, 10);
        const { rows } = await pool.query(`INSERT INTO admins (email, password, first_name, last_name, phone, country, city, birth_date, avatar_url, role, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())
       RETURNING id, email, first_name, last_name, role, created_at`, [
            email.toLowerCase(), hashed, firstName || '', lastName || '', phone, country, city, birth_date || null, avatar_url || null, role
        ]);
        res.json({ success: true, admin: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// Email verification route — token based
app.get('/api/admin/verify-email', async (req, res) => {
    try {
        const token = req.query.token as string;
        if (!token) return res.status(400).send('Token manquant');
        const { rows } = await pool.query('SELECT id FROM admins WHERE verification_token = $1', [token]);
        if (rows.length === 0) return res.status(400).send('Token invalide');
        const adminId = rows[0].id;
        await pool.query('UPDATE admins SET is_verified = true, verification_token = NULL WHERE id = $1', [adminId]);
        // Redirect to frontend success page
        const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontend}/admin/verify-success`);
    } catch (err) {
        console.error('Verify email error:', err);
        return res.status(500).send('Erreur serveur');
    }
});
// ──────────────────────────────────────────────────
// 5. UTILISATEURS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/users", async (_, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT 
        id, full_name, email, user_type, created_at, is_blocked,
        company_name, company_address, phone, country, city, address,
        sector, description, company_size, website, company_email,
        mission, values, benefits,
        profile_image_url, public_settings,
        profession, job_title, diploma, experience_years, skills,
        qualification, years_experience, documents
      FROM users 
      ORDER BY created_at DESC
    `);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// Endpoint pour rechercher les entreprises inscrites
app.get("/api/companies/search", userAuth, async (req, res) => {
    try {
        const searchQuery = req.query.q ? String(req.query.q).toLowerCase().trim() : '';
        
        // Récupérer toutes les entreprises
        const { rows } = await pool.query(`
            SELECT 
                id, 
                full_name, 
                email, 
                company_name,
                profile_image_url as logo_url
            FROM users 
            WHERE user_type = 'company' AND is_blocked = false
            ORDER BY company_name ASC
        `);
        
        // Filtrer côté serveur si une recherche est spécifiée
        const companies = rows.map((company: any) => ({
            id: company.id,
            name: company.company_name || company.full_name || company.email,
            company_name: company.company_name || company.full_name,
            logo_url: company.logo_url
        }));
        
        if (searchQuery) {
            const filtered = companies.filter((company: any) =>
                (company.name || '').toLowerCase().includes(searchQuery)
            );
            return res.json(filtered);
        }
        
        res.json(companies);
    }
    catch (err) {
        console.error('Error fetching companies:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la recherche d\'entreprises' });
    }
});

// Ensure the authenticated-current-user route is declared before the param route
app.get('/api/users/me', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        }
        console.log('Get /api/users/me called for userId:', userId, 'isConnected:', isConnected);
        if (!isConnected) {
            console.warn('DB unavailable when fetching current user profile');
            return res.status(503).json({ success: false, message: 'Base de données indisponible' });
        }
        try {
            const { rows } = await pool.query(`SELECT u.* FROM users u WHERE u.id = $1`, [userId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
            }
            return res.json(rows[0]);
        }
        catch (errQuery) {
            console.error('Primary profile query failed, attempting fallback. Error:', errQuery.stack || errQuery);
            try {
                const { rows: smallRows } = await pool.query('SELECT id, full_name, email, user_type, created_at FROM users WHERE id = $1', [userId]);
                if (!smallRows || smallRows.length === 0) {
                    return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
                }
                return res.json(smallRows[0]);
            }
            catch (err2) {
                console.error('Fallback profile query also failed:', err2.stack || err2);
                throw err2;
            }
        }
    }
    catch (err) {
        console.error('Get profile error:', err.stack || err.message || err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Get a specific user with profile details, documents and skills
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('/api/users/:id requested, id param:', id, 'typeof:', typeof id);
        const { rows } = await pool.query(`SELECT u.*, 
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', ud.id, 'doc_type', ud.doc_type, 'storage_url', ud.storage_url)) FILTER (WHERE ud.id IS NOT NULL), '[]') AS documents,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', us.id, 'skill_name', us.skill_name, 'category', us.category)) FILTER (WHERE us.id IS NOT NULL), '[]') AS skills
       FROM users u
       LEFT JOIN user_documents ud ON ud.user_id = u.id
       LEFT JOIN user_skills us ON us.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Get user details error:', err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/users", async (req, res) => {
    try {
        let { full_name, email, user_type } = req.body;
        // Normalize french/english variants to canonical values
        if (typeof user_type === 'string') {
            const ut = String(user_type).toLowerCase();
            if (ut === 'candidat' || ut === 'candidate')
                user_type = 'candidate';
            else if (ut === 'entreprise' || ut === 'company' || ut === 'entrepreneur')
                user_type = 'company';
            else
                user_type = 'candidate';
        }
        else {
            user_type = 'candidate';
        }
        const { rows } = await pool.query(`INSERT INTO users (full_name, email, user_type)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, user_type, created_at, is_blocked`, [full_name, email, user_type]);
        res.json({ success: true, user: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// Handle CORS preflight for register endpoint
app.options("/api/register", cors());

// Public registration endpoint for candidates and companies
app.post("/api/register", async (req, res) => {
    try {
        let { 
            email, password, user_type = "candidate", 
            full_name, company_name, company_address, phone, country,
            // Candidat fields
            city, gender, birthdate, nationality,
            // Entreprise fields
            representative
        } = req.body;
        
        // normalize user_type variants
        if (typeof user_type === 'string') {
            const ut = String(user_type).toLowerCase();
            if (ut === 'candidat' || ut === 'candidate')
                user_type = 'candidate';
            else if (ut === 'entreprise' || ut === 'company' || ut === 'entrepreneur')
                user_type = 'company';
            else
                user_type = 'candidate';
        }
        else {
            user_type = 'candidate';
        }
        
        if (!email || !password)
            return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
        
        // Basic validations
        const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRe.test(String(email)))
            return res.status(400).json({ success: false, message: 'Email invalide' });
        if (String(password).length < 8)
            return res.status(400).json({ success: false, message: 'Mot de passe trop court (>=8 caractères)' });
        if (phone && !/^[0-9+\-\s()]{6,20}$/.test(String(phone)))
            return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide' });
        
        const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: "Email déjà utilisé" });
        
        // Enforce registration limited to République du Congo (server-side)
        if (!country || String(country).toLowerCase().indexOf('congo') === -1) {
            return res.status(403).json({ success: false, message: 'Inscription autorisée uniquement depuis la République du Congo' });
        }
        
        const hashed = bcrypt.hashSync(password, 10);
        
        // Construire les colonnes dynamiquement selon le type d'utilisateur
        const columns = ['full_name', 'email', 'password', 'user_type', 'country', 'is_verified'];
        const values = [full_name || null, email, hashed, user_type, country, false];
        let valueIndex = 6;
        
        if (user_type === 'candidate') {
            if (phone) { columns.push('phone'); values.push(phone); valueIndex++; }
            if (city) { columns.push('city'); values.push(city); valueIndex++; }
            if (gender) { columns.push('gender'); values.push(gender); valueIndex++; }
            if (birthdate) { columns.push('birthdate'); values.push(birthdate); valueIndex++; }
            if (nationality) { columns.push('nationality'); values.push(nationality); valueIndex++; }
        } else if (user_type === 'company') {
            if (company_name) { columns.push('company_name'); values.push(company_name); valueIndex++; }
            if (company_address) { columns.push('company_address'); values.push(company_address); valueIndex++; }
            if (phone) { columns.push('phone'); values.push(phone); valueIndex++; }
            if (representative) { columns.push('full_name'); values[0] = representative || company_name || null; }
        }
        
        const columnList = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const returnColumns = [
            'id', 'full_name', 'email', 'user_type', 'company_name', 'company_address', 
            'phone', 'country', 'created_at', 'city', 'gender', 'birthdate', 'nationality'
        ].join(', ');
        
        const query = `INSERT INTO users (${columnList}) VALUES (${placeholders}) RETURNING ${returnColumns}`;
        const { rows } = await pool.query(query, values);
        const user = rows[0];
        // After creating the user, attempt to send a personalized welcome notification
        try {
            // Prefer a template targeting the specific user_type, fallback to 'candidate'
            const ut = String(user.user_type || 'candidate').toLowerCase();
            const { rows: tmplRows } = await pool.query('SELECT * FROM welcome_templates WHERE user_type = $1 ORDER BY created_at DESC LIMIT 1', [ut]);
            let template = tmplRows && tmplRows[0] ? tmplRows[0] : null;
            if (!template) {
                const { rows: fallback } = await pool.query('SELECT * FROM welcome_templates WHERE user_type = $1 ORDER BY created_at DESC LIMIT 1', ['candidate']);
                template = fallback && fallback[0] ? fallback[0] : null;
            }
            if (template) {
                // simple placeholder replacement
                const replacePlaceholders = (text) => {
                    return String(text)
                        .replace(/{{\s*full_name\s*}}/gi, user.full_name || '')
                        .replace(/{{\s*company_name\s*}}/gi, user.company_name || '')
                        .replace(/{{\s*email\s*}}/gi, user.email || '');
                };
                const title = replacePlaceholders(template.title);
                const message = replacePlaceholders(template.message);
                await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)', [user.id, title, message]);
            }
        }
        catch (e) {
            console.warn('Welcome template notification error:', e);
        }
        const token = jwt.sign({ id: user.id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user });
    }
    catch (err) {
        console.error('Register user error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// Handle CORS preflight for login endpoint
app.options("/api/login", cors());

// Public login for users
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];
        if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        }
        const { password: _, ...safeUser } = user;
        const token = jwt.sign({ id: user.id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: safeUser });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// Google OAuth login endpoint
app.post('/api/google-login', async (req, res) => {
    try {
        const { token, userType = 'candidate' } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token Google requis' });
        }

        // Verify the Google token
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        let payload;
        try {
            // Try to verify as an ID token first
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
            console.log('Token verified as ID token');
        } catch (idTokenErr) {
            console.log('ID token verification failed, trying tokeninfo endpoint...');
            // If ID token verification fails, try to verify the access token using tokeninfo endpoint
            try {
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
                const tokenInfo = await response.json();
                
                if (!response.ok || (tokenInfo as any).error) {
                    console.error('Token info verification failed:', tokenInfo);
                    return res.status(401).json({ success: false, message: 'Token Google invalide' });
                }
                
                // For access token, we need to fetch user info
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userInfo: any = await userInfoResponse.json();
                
                if (!userInfoResponse.ok) {
                    console.error('User info fetch failed:', userInfo);
                    return res.status(401).json({ success: false, message: 'Token Google invalide' });
                }
                
                payload = {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    sub: userInfo.id,
                };
                console.log('Token verified as access token');
            } catch (accessTokenErr) {
                console.error('Google token verification failed:', idTokenErr, accessTokenErr);
                return res.status(401).json({ success: false, message: 'Token Google invalide' });
            }
        }

        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email non trouvé dans le token Google' });
        }

        // Check if user exists
        let { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = rows[0];

        // If user doesn't exist, create one with Google info
        if (!user) {
            const finalUserType = userType === 'company' ? 'company' : 'candidate';
            const { rows: newUserRows } = await pool.query(
                `INSERT INTO users (email, full_name, profile_image_url, user_type, password, google_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 RETURNING id, email, full_name, user_type, profile_image_url, phone, profession, skills, country, city`,
                [email, name || 'User', picture || null, finalUserType, null, googleId]
            );
            user = newUserRows[0];
            console.log(`New Google user created: ${email} with type: ${finalUserType}`);
        } else {
            // Update google_id if not already set
            if (!user.google_id) {
                await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
                user.google_id = googleId;
            }
            // Update profile picture if provided and not set
            if (picture && !user.profile_image_url) {
                await pool.query('UPDATE users SET profile_image_url = $1 WHERE id = $2', [picture, user.id]);
                user.profile_image_url = picture;
            }
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: user.id, role: user.user_type },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...safeUser } = user;
        res.json({ success: true, token: jwtToken, user: safeUser });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion Google' });
    }
});

// Synchronize Google profile data with user in database (called from AuthCallback.tsx)
// This endpoint updates the user profile with info from Supabase Google OAuth
app.post('/api/auth/sync-google', async (req, res) => {
    try {
        const { id, email, full_name, profile_image_url } = req.body;

        if (!id || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and email are required' 
            });
        }

        // Ensure google_id column exists
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT`).catch(() => {});

        // Check if user exists by email
        const { rows: existingUser } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.length === 0) {
            // User doesn't exist - create new user with Google info
            const { rows: newUser } = await pool.query(
                `INSERT INTO users (email, full_name, profile_image_url, user_type, password, google_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                 RETURNING id, email, full_name, profile_image_url, user_type`,
                [email, full_name || 'User', profile_image_url || null, 'candidate', null, id]
            );
            
            console.log(`[Sync-Google] New user created: ${email}`);
            return res.json({ 
                success: true, 
                message: 'User created and synced',
                user: newUser[0] 
            });
        }

        // User exists - update profile with Google info
        const userId = existingUser[0].id;
        const { rows: updated } = await pool.query(
            `UPDATE users 
             SET 
                full_name = COALESCE($1, full_name),
                profile_image_url = COALESCE($2, profile_image_url),
                google_id = $3,
                updated_at = NOW()
             WHERE id = $4
             RETURNING id, email, full_name, profile_image_url, user_type`,
            [full_name || null, profile_image_url || null, id, userId]
        );

        console.log(`[Sync-Google] User updated: ${email}`);
        res.json({ 
            success: true,
            message: 'User profile synced',
            user: updated[0]
        });
    } catch (err) {
        console.error('Sync Google error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error syncing Google profile'
        });
    }
});

// (duplicate GET /api/users/me handler removed; single handler exists earlier)
// Save company recommendation preferences (companies only)
app.post('/api/company-recommendations', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        const { skill = null, diploma = null, profession = null, certification = null } = req.body;
        // ensure table exists
        await pool.query(`CREATE TABLE IF NOT EXISTS company_recommendations (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        skill TEXT,
        diploma TEXT,
        profession TEXT,
        certification TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
        await pool.query(`INSERT INTO company_recommendations (company_id, skill, diploma, profession, certification) VALUES ($1, $2, $3, $4, $5)`, [userId, skill, diploma, profession, certification]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Error saving company recommendations:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Update current user profile (including profile_image_url)
app.put('/api/users/me', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        console.log('PUT /api/users/me called for userId:', userId);
        // List of columns that can be safely updated
        const safeColumns = [
            'full_name', 'company_name', 'company_address', 'phone', 'profession',
            'job_title', 'diploma', 'experience_years', 'profile_image_url', 'skills',
            'country', 'city', 'address', 'birthdate', 'gender', 'nationality',
            'qualification', 'years_experience', 'documents', 'contract_type',
            'availability', 'salary', 'linkedin', 'bio', 'email', 'company_email',
            'sector', 'company_size', 'description', 'mission', 'values', 'benefits',
            'public_settings', 'company', 'company_id', 'discreet_mode_enabled',
            'hidden_from_company_id', 'hidden_from_company_name',
            // Candidat - Documents Professionnels
            'cv_url', 'lm_url',
            // Candidat - Diplômes & Expériences
            'diplome_url', 'certificat_travail_url',
            // Candidat - Identité & Résidence
            'cni_url', 'passeport_url', 'carte_residence_url',
            // Candidat - Documents Administratifs
            'nui_url', 'recepisse_acpe_url',
            // Entreprise - Documents Légaux
            'rccm_url', 'statuts_url', 'carte_grise_fiscale_url',
            // Entreprise - Documents Fiscaux
            'attestation_non_redevance_url',
            // Entreprise - Locaux
            'bail_url',
            // Entreprise - Représentants
            'cni_representant_url'
        ];
        // Dynamic query building - only update columns that are in the request body
        const updates = [];
        const params = [];
        let paramIndex = 1;
        for (const col of safeColumns) {
            if (col in req.body) {
                updates.push(`${col}=$${paramIndex}`);
                let value = req.body[col];
                // Special handling for JSON columns
                if (col === 'skills' || col === 'documents') {
                    value = value ? (typeof value === 'string' ? value : JSON.stringify(value)) : null;
                }
                params.push(value || null);
                paramIndex++;
            }
        }
        // Always update updated_at
        updates.push(`updated_at=NOW()`);
        if (updates.length === 1) {
            // Only updated_at is being set, which is fine
            console.log('No data to update, just refreshing updated_at');
        }
        params.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id=$${paramIndex} RETURNING *`;
        console.log('Query:', query);
        console.log('Params count:', params.length);
        const { rows } = await pool.query(query, params);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        console.log('Update successful for userId:', userId);
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: `Erreur lors de la mise à jour: ${err.message}` });
    }
});
// Change password endpoint
app.put('/api/users/me/password', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });
        }
        // Get user current password
        const { rows: users } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = users[0];
        if (!user || !user.password || !bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect' });
        }
        // Hash new password
        const hashed = bcrypt.hashSync(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
        res.json({ success: true, message: 'Mot de passe changé avec succès' });
    }
    catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false });
    }
});
// Delete account endpoint
app.delete('/api/users/me', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Mot de passe requis' });
        }
        // Verify password before deletion
        const { rows: users } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = users[0];
        if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        }
        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ success: true, message: 'Compte supprimé avec succès' });
    }
    catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ success: false });
    }
});
// Get recommended jobs for authenticated user
app.get("/api/jobs/recommendations/for-me", userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // Companies should not get job recommendations
        if (req.userRole && String(req.userRole).toLowerCase() === 'company') {
            return res.json([]);
        }
        // Get user profile with preferences
        const { rows: userRows } = await pool.query(`SELECT profession, skills, preferred_sector, preferred_location, preferred_contract_type 
       FROM users WHERE id = $1`, [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const user = userRows[0];
        const profession = String(user.profession || "").toLowerCase();
        const skills = Array.isArray(user.skills) ? user.skills : [];
        const preferredSector = String(user.preferred_sector || "").toLowerCase();
        const preferredLocation = String(user.preferred_location || "").toLowerCase();
        const preferredType = String(user.preferred_contract_type || "").toLowerCase();
        // Get all jobs
        const { rows: jobs } = await pool.query("SELECT * FROM jobs WHERE published = true ORDER BY created_at DESC LIMIT 50");
        // Score and recommend jobs
        const recommendations = jobs.map((job) => {
            let score = 0;
            const title = String(job.title || "").toLowerCase();
            const desc = String(job.description || "").toLowerCase();
            const sector = String(job.sector || "").toLowerCase();
            const location = String(job.location || "").toLowerCase();
            const type = String(job.type || "").toLowerCase();
            // Match profession/title
            if (profession && title.includes(profession))
                score += 30;
            if (profession && desc.includes(profession))
                score += 15;
            // Match skills
            for (const skill of skills) {
                const skillLower = String(skill).toLowerCase();
                if (title.includes(skillLower))
                    score += 20;
                if (desc.includes(skillLower))
                    score += 15;
            }
            // Match sector preference
            if (preferredSector && sector.includes(preferredSector))
                score += 25;
            if (preferredSector && desc.includes(preferredSector))
                score += 10;
            // Match location preference
            if (preferredLocation && location.includes(preferredLocation))
                score += 20;
            // Match contract type preference
            if (preferredType && type.includes(preferredType))
                score += 15;
            return { ...job, recommendation_score: score };
        }).filter((j) => Number(j.recommendation_score) > 0).sort((a, b) => Number(b.recommendation_score) - Number(a.recommendation_score)).slice(0, 5);
        res.json(recommendations);
    }
    catch (err) {
        console.error("Get recommendations error:", err);
        res.status(500).json({ success: false });
    }
});
// Update user job preferences
app.put("/api/users/:id/job-preferences", userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        // Ensure user can only update their own preferences
        if (Number(userId) !== Number(id)) {
            return res.status(403).json({ success: false, message: "Accès refusé" });
        }
        const { preferred_sector, preferred_location, preferred_contract_type } = req.body;
        const { rows } = await pool.query(`UPDATE users SET preferred_sector = $1, preferred_location = $2, preferred_contract_type = $3 
       WHERE id = $4 
       RETURNING id, preferred_sector, preferred_location, preferred_contract_type`, [preferred_sector || null, preferred_location || null, preferred_contract_type || null, id]);
        res.json({ success: true, preferences: rows[0] });
    }
    catch (err) {
        console.error("Update preferences error:", err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// USER DOCUMENTS (CV, Certificates, etc.)
// ──────────────────────────────────────────────────
app.get('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT id, user_id, doc_type, title, storage_url, created_at FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get documents error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { doc_type, title, storage_url } = req.body;
        if (!doc_type || !storage_url) {
            return res.status(400).json({ success: false, message: 'Type de document et URL requise' });
        }
        const { rows } = await pool.query('INSERT INTO user_documents (user_id, doc_type, title, storage_url) VALUES ($1, $2, $3, $4) RETURNING *', [userId, doc_type, title || null, storage_url]);
        // If the user uploads/updates an identity document while certified, revoke certification
        if (doc_type === 'identity') {
            try {
                const { rows: userRows } = await pool.query('SELECT id, is_verified, phone, full_name FROM users WHERE id = $1', [userId]);
                const user = userRows[0];
                if (user && user.is_verified) {
                    await pool.query('UPDATE users SET is_verified = false WHERE id = $1', [userId]);
                    await pool.query('INSERT INTO verification_requests (user_id, requested_name, phone, status, reason) VALUES ($1, $2, $3, $4, $5)', [userId, user.full_name || null, user.phone || null, 'revoked', 'Identity document changed - certification revoked']);
                    // Notify the user about revocation
                    try {
                        await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [userId, 'Certification révoquée', 'Votre certification a été révoquée suite à la modification de votre pièce d\'identité.']);
                    }
                    catch (e) {
                        console.warn('Notification insert warning:', e);
                    }
                }
            }
            catch (e) {
                console.warn('Identity upload revoke warning:', e);
            }
        }
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Create document error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/user-documents/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        // Check if document belongs to user
        const { rows: docs } = await pool.query('SELECT id FROM user_documents WHERE id = $1 AND user_id = $2', [id, userId]);
        if (docs.length === 0) {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }
        await pool.query('DELETE FROM user_documents WHERE id = $1', [id]);
        // If the deleted document was an identity document and the user was verified, revoke certification
        try {
            const { rows: maybe } = await pool.query('SELECT doc_type, user_id FROM user_documents WHERE id = $1', [id]);
            // Note: row was deleted above; we can't rely on it here. Instead, check if user still has an identity doc.
            const { rows: userRows } = await pool.query('SELECT id, is_verified, phone, full_name FROM users WHERE id = $1', [userId]);
            const user = userRows[0];
            const { rows: idDocs } = await pool.query('SELECT id FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'identity']);
            if (user && user.is_verified && idDocs.length === 0) {
                await pool.query('UPDATE users SET is_verified = false WHERE id = $1', [userId]);
                await pool.query('INSERT INTO verification_requests (user_id, requested_name, phone, status, reason) VALUES ($1, $2, $3, $4, $5)', [userId, user.full_name || null, user.phone || null, 'revoked', 'Identity document removed - certification revoked']);
                // Notify user about revocation
                try {
                    await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [userId, 'Certification révoquée', 'Votre certification a été révoquée suite à la suppression de votre pièce d\'identité.']);
                }
                catch (e) {
                    console.warn('Notification insert warning:', e);
                }
            }
        }
        catch (e) {
            console.warn('Identity delete revoke warning:', e);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete document error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// USER SKILLS / RECOMMENDATIONS
// ──────────────────────────────────────────────────
app.get('/api/user-skills', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT id, user_id, skill_name, category, created_at FROM user_skills WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get skills error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/user-skills', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { skill_name, category } = req.body;
        if (!skill_name) {
            return res.status(400).json({ success: false, message: 'Nom de compétence requis' });
        }
        const { rows } = await pool.query('INSERT INTO user_skills (user_id, skill_name, category) VALUES ($1, $2, $3) RETURNING *', [userId, skill_name, category || 'general']);
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Create skill error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/user-skills/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        // Check if skill belongs to user
        const { rows: skills } = await pool.query('SELECT id FROM user_skills WHERE id = $1 AND user_id = $2', [id, userId]);
        if (skills.length === 0) {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }
        await pool.query('DELETE FROM user_skills WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete skill error:', err);
        res.status(500).json({ success: false });
    }
});
// Get combined notifications for current user (site notifications + personal)
app.get('/api/notifications', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = String(req.userRole || '').toLowerCase();
        // Site notifications targeted to this user's role or to 'all'
        const { rows: siteRows } = await pool.query(`SELECT id, title, message, target, category, image_url, link, created_at, 'admin' as user_type FROM site_notifications WHERE target = $1 OR target = 'all' ORDER BY created_at DESC`, [userRole]);
        // Personal notifications with sender info
        const { rows: personalRows } = await pool.query(`
          SELECT 
            n.id, 
            n.title, 
            n.message, 
            n.read, 
            n.created_at,
            u.user_type,
            u.full_name,
            u.company_name,
            u.profile_image_url
          FROM notifications n
          LEFT JOIN users u ON n.sender_id = u.id
          WHERE n.user_id = $1 
          ORDER BY n.created_at DESC
        `, [userId]);
        // Merge and sort by created_at descending
        const merged = [...(siteRows || []), ...(personalRows || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        res.json(merged);
    }
    catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Simple in-memory SSE clients registry: companyId -> Set of response objects
const sseClients = new Map();
// SSE stream for company to receive new applications in real-time.
app.get('/api/company/applications/stream', async (req, res) => {
    try {
        // Accept token from Authorization header or query param for EventSource
        let token = null;
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer '))
            token = auth.split(' ')[1] || null;
        if (!token && req.query && typeof req.query.token === 'string')
            token = req.query.token;
        if (!token)
            return res.status(401).end();
        let decoded = null;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        }
        catch (e) {
            return res.status(401).end();
        }
        const userId = decoded?.id;
        const userRole = (decoded?.role || '').toLowerCase();
        if (!userId || userRole !== 'company')
            return res.status(403).end();
        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders && res.flushHeaders();
        // Register client
        const id = Number(userId);
        if (!sseClients.has(id))
            sseClients.set(id, new Set());
        sseClients.get(id).add(res);
        // Send a ping/comment to keep connection alive
        res.write(': connected\n\n');
        req.on('close', () => {
            try {
                sseClients.get(id)?.delete(res);
            }
            catch (e) { }
        });
    }
    catch (err) {
        console.error('SSE stream error:', err);
        try {
            res.status(500).end();
        }
        catch (e) { }
    }
});
// Company: list all jobs for authenticated company (including drafts)
app.get('/api/company/jobs', userAuth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ success: false });
        const { rows: urows } = await pool.query('SELECT user_type FROM users WHERE id = $1', [req.userId]);
        if (!urows || urows.length === 0)
            return res.status(404).json({ success: false });
        if (String(urows[0].user_type).toLowerCase() !== 'company')
            return res.status(403).json({ success: false, message: 'Accès réservé aux entreprises' });
        // Only return jobs that are flagged as created by the company account itself
        const { rows } = await pool.query('SELECT * FROM jobs WHERE company_id = $1 AND is_company_owned = true ORDER BY created_at DESC', [req.userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get company jobs error:', err);
        res.status(500).json({ success: false });
    }
});
// Candidate: get candidate stats
app.get('/api/candidate/stats', userAuth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ success: false });
        const { rows: urows } = await pool.query('SELECT user_type FROM users WHERE id = $1', [req.userId]);
        if (!urows || urows.length === 0)
            return res.status(404).json({ success: false });
        if (String(urows[0].user_type || '').toLowerCase() !== 'candidate')
            return res.status(403).json({ success: false, message: 'Accès réservé aux candidats' });
        // Get candidate user data
        const { rows: candidateRows } = await pool.query('SELECT is_verified, profession FROM users WHERE id = $1', [req.userId]);
        // Get applications count
        const { rows: appsRows } = await pool.query('SELECT COUNT(*) as applications_count FROM job_applications WHERE applicant_id = $1', [req.userId]);
        const candidate = candidateRows[0] || {};
        const stats = {
            verified: candidate.is_verified || false,
            subscription: false,
            documents: 0,
            applicationsCount: parseInt(appsRows[0]?.applications_count || 0),
            profession: candidate.profession || '',
        };
        res.json(stats);
    }
    catch (err) {
        console.error('Get candidate stats error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// Company: get company stats
app.get('/api/company/stats', userAuth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ success: false });
        const { rows: urows } = await pool.query('SELECT user_type FROM users WHERE id = $1', [req.userId]);
        if (!urows || urows.length === 0)
            return res.status(404).json({ success: false });
        if (String(urows[0].user_type).toLowerCase() !== 'company')
            return res.status(403).json({ success: false, message: 'Accès réservé aux entreprises' });
        // Get company user data
        const { rows: companyRows } = await pool.query('SELECT is_verified FROM users WHERE id = $1', [req.userId]);
        // Get jobs count
        const { rows: jobsRows } = await pool.query('SELECT COUNT(*) as jobs_count FROM jobs WHERE company_id = $1', [req.userId]);
        // Get applications count
        const { rows: appsRows } = await pool.query('SELECT COUNT(*) as applications_count FROM job_applications WHERE job_id IN (SELECT id FROM jobs WHERE company_id = $1)', [req.userId]);
        const company = companyRows[0] || {};
        const stats = {
            jobsCount: parseInt(jobsRows[0]?.jobs_count || 0),
            applicationsCount: parseInt(appsRows[0]?.applications_count || 0),
            viewsCount: 0, // Placeholder - add view tracking if needed
            verified: company.is_verified || false,
            subscription: false, // Placeholder - add subscription logic if needed
        };
        res.json(stats);
    }
    catch (err) {
        console.error('Get company stats error:', err);
        res.status(500).json({ success: false });
    }
});
// Candidate: get profile view stats
app.get('/api/users/me/profile-stats', userAuth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ success: false });
        // Get profile view stats from profile_views table if it exists
        const { rows } = await pool.query(`SELECT 
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as profile_views_week,
            COUNT(*) as profile_views_total
        FROM profile_views 
        WHERE viewed_user_id = $1`, [req.userId]);
        const stats = rows[0] || { profile_views_week: 0, profile_views_total: 0 };
        res.json({
            profile_views_week: parseInt(stats.profile_views_week || 0),
            profile_views_total: parseInt(stats.profile_views_total || 0),
        });
    }
    catch (err) {
        console.error('Get profile stats error:', err);
        // Return empty stats if table doesn't exist
        res.json({ profile_views_week: 0, profile_views_total: 0 });
    }
});

// Public: get list of candidates
app.get('/api/users/candidates', async (req, res) => {
    try {
        const limitParam = req.query.limit as string | undefined;
        const offsetParam = req.query.offset as string | undefined;
        const limit = Math.min(parseInt(limitParam || '10') || 10, 100);
        const offset = parseInt(offsetParam || '0') || 0;
        const { rows } = await pool.query(`SELECT id, full_name, profession, email, phone, profile_image_url, is_verified, created_at 
       FROM users 
       WHERE LOWER(COALESCE(user_type, '')) = 'candidate'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get candidates error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// Admin: create a site notification targeting candidate/company/all
app.post('/api/admin/site-notifications', adminAuth, async (req, res) => {
    try {
        const { title, message, target = 'all', category = null, image_url = null, link = null } = req.body;
        if (!title)
            return res.status(400).json({ success: false, message: 'Title required' });
        const { rows } = await pool.query(`INSERT INTO site_notifications (title, message, target, category, image_url, link) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [title, message || null, target || 'all', category || null, image_url || null, link || null]);
        res.json({ success: true, notification: rows[0] });
    }
    catch (err) {
        console.error('Create site notification error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Admin: delete site notification
app.delete('/api/admin/site-notifications/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM site_notifications WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete site notification error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Admin: update site notification
app.put('/api/admin/site-notifications/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, target, category, image_url, link } = req.body;
        if (!title)
            return res.status(400).json({ success: false, message: 'Title required' });
        const { rows } = await pool.query(`UPDATE site_notifications SET title = $1, message = $2, target = $3, category = $4, image_url = $5, link = $6, updated_at = NOW() WHERE id = $7 RETURNING *`, [title, message || null, target || 'all', category || null, image_url || null, link || null, id]);
        res.json({ success: true, notification: rows[0] });
    }
    catch (err) {
        console.error('Update site notification error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Admin: list all site notifications
app.get('/api/site-notifications', adminAuth, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM site_notifications ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (err) {
        console.error('List site notifications error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur serveur' });
    }
});
// Admin: manage welcome templates (for automated welcome messages)
app.get('/api/admin/welcome-templates', adminAuth, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM welcome_templates ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (err) {
        console.error('List welcome templates error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/admin/welcome-templates', adminAuth, async (req, res) => {
    try {
        const adminId = req.userId;
        const { user_type, title, message } = req.body;
        if (!user_type || !title || !message)
            return res.status(400).json({ success: false, message: 'Champs requis manquants' });
        const { rows } = await pool.query('INSERT INTO welcome_templates (user_type, title, message, created_by_admin) VALUES ($1,$2,$3,$4) RETURNING *', [user_type, title, message, adminId || null]);
        res.json({ success: true, template: rows[0] });
    }
    catch (err) {
        console.error('Create welcome template error:', err);
        res.status(500).json({ success: false });
    }
});
app.put('/api/admin/welcome-templates/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_type, title, message } = req.body;
        if (!user_type || !title || !message)
            return res.status(400).json({ success: false, message: 'Champs requis manquants' });
        const { rows } = await pool.query('UPDATE welcome_templates SET user_type=$1, title=$2, message=$3, updated_at=NOW() WHERE id=$4 RETURNING *', [user_type, title, message, id]);
        res.json({ success: true, template: rows[0] });
    }
    catch (err) {
        console.error('Update welcome template error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/admin/welcome-templates/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM welcome_templates WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete welcome template error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// ACCOUNT VERIFICATION (USER -> ADMIN workflow)
// ──────────────────────────────────────────────────
// User requests verification
app.post('/api/verify-request', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { requested_name } = req.body;
        const { rows: userRows } = await pool.query('SELECT id, full_name, phone, user_type, company_name FROM users WHERE id = $1', [userId]);
        const user = userRows[0];
        if (!user)
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        if (!user.phone)
            return res.status(400).json({ success: false, message: 'Numéro de téléphone requis pour la vérification' });
        // For individuals: ensure identity document exists and name matches
        if (user.user_type !== 'company') {
            const { rows: idDocs } = await pool.query('SELECT id, storage_url FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'identity']);
            if (idDocs.length === 0)
                return res.status(400).json({ success: false, message: 'Pièce d\'identité requise pour la vérification' });
            if (!requested_name || String(requested_name).trim().toLowerCase() !== String(user.full_name || '').trim().toLowerCase()) {
                return res.status(400).json({ success: false, message: 'Le nom fourni ne correspond pas au nom du profil.' });
            }
        }
        else {
            // For company accounts: require company_name and company documents (RCCM and guarantor identity)
            if (!user.company_name)
                return res.status(400).json({ success: false, message: 'Nom de l\'entreprise requis pour la vérification' });
            const { rows: rccm } = await pool.query('SELECT id FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'rccm']);
            const { rows: guarantor } = await pool.query('SELECT id FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'guarantor_identity']);
            if (rccm.length === 0)
                return res.status(400).json({ success: false, message: 'RCCM de l\'entreprise requis pour la vérification' });
            if (guarantor.length === 0)
                return res.status(400).json({ success: false, message: 'Pièce d\'identité du garant requise pour la vérification' });
            if (!requested_name || String(requested_name).trim().toLowerCase() !== String(user.company_name || '').trim().toLowerCase()) {
                return res.status(400).json({ success: false, message: 'Le nom fourni ne correspond pas au nom de l\'entreprise.' });
            }
        }
        const { rows } = await pool.query('INSERT INTO verification_requests (user_id, requested_name, phone, status) VALUES ($1, $2, $3, $4) RETURNING *', [userId, requested_name, user.phone || null, 'pending']);
        res.json({ success: true, request: rows[0] });
    }
    catch (err) {
        console.error('Verify request error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: list verification requests
app.get('/api/admin/verify-requests', adminAuth, async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : null;
        let result;
        // Include related user documents (identity, rccm, guarantor) in the response
        const baseQuery = `
      SELECT vr.*, u.full_name, u.email, u.phone,
        COALESCE(json_agg(json_build_object('doc_type', ud.doc_type, 'storage_url', ud.storage_url)) FILTER (WHERE ud.id IS NOT NULL), '[]') AS documents
      FROM verification_requests vr
      JOIN users u ON u.id = vr.user_id
      LEFT JOIN user_documents ud ON ud.user_id = u.id AND ud.doc_type IN ('identity','rccm','guarantor_identity')
    `;
        if (status) {
            result = await pool.query(baseQuery + ` WHERE vr.status = $1 GROUP BY vr.id, u.full_name, u.email, u.phone ORDER BY vr.created_at DESC`, [status]);
        }
        else {
            result = await pool.query(baseQuery + ` GROUP BY vr.id, u.full_name, u.email, u.phone ORDER BY vr.created_at DESC`);
        }
        res.json(result.rows.map((r) => ({ ...r, documents: r.documents || [] })));
    }
    catch (err) {
        console.error('Admin list verify requests error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: list certified users
app.get('/api/admin/certified-users', adminAuth, async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT u.id, u.full_name, u.email, u.user_type, u.phone, u.company_name, u.created_at,
        COALESCE(json_agg(json_build_object('doc_type', ud.doc_type, 'storage_url', ud.storage_url)) FILTER (WHERE ud.id IS NOT NULL), '[]') AS documents
       FROM users u LEFT JOIN user_documents ud ON ud.user_id = u.id AND ud.doc_type IN ('identity','rccm','guarantor_identity')
       WHERE u.is_verified = true
       GROUP BY u.id ORDER BY u.created_at DESC`);
        res.json(rows);
    }
    catch (err) {
        console.error('Admin certified users error:', err);
        res.status(500).json({ success: false });
    }
});
// User: list notifications
// User: mark notification as read
app.post('/api/notifications/:id/read', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        await pool.query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Mark notification read error:', err);
        res.status(500).json({ success: false });
    }
});
// User: mark all notifications as read
app.post('/api/notifications/mark-all-read', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false });
        const { rowCount } = await pool.query('UPDATE notifications SET read = true WHERE user_id = $1 AND read = false', [userId]);
        res.json({ success: true, updated: rowCount || 0 });
    }
    catch (err) {
        console.error('Mark all read error:', err);
        res.status(500).json({ success: false });
    }
});
// User: delete notification
app.delete('/api/notifications/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
        if (rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete notification error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: approve a verification request
app.post('/api/admin/verify-requests/:id/approve', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;
        const { rows } = await pool.query('SELECT * FROM verification_requests WHERE id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Demande introuvable' });
        const reqRow = rows[0];
        await pool.query('UPDATE verification_requests SET status = $1, admin_id = $2, reviewed_at = NOW() WHERE id = $3', ['approved', adminId, id]);
        await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [reqRow.user_id]);
        // Notify the user
        try {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [reqRow.user_id, 'Vérification approuvée', 'Votre compte a été certifié par un administrateur.']);
        }
        catch (e) {
            console.warn('Notification insert warning:', e);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Approve verify request error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: reject a verification request
app.post('/api/admin/verify-requests/:id/reject', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;
        const { reason } = req.body;
        const { rows } = await pool.query('SELECT * FROM verification_requests WHERE id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Demande introuvable' });
        const reqRow = rows[0];
        await pool.query('UPDATE verification_requests SET status = $1, admin_id = $2, reason = $3, reviewed_at = NOW() WHERE id = $4', ['rejected', adminId, reason || null, id]);
        await pool.query('UPDATE users SET is_verified = false WHERE id = $1', [reqRow.user_id]);
        // Notify the user
        try {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [reqRow.user_id, 'Vérification rejetée', reason || 'Votre demande de vérification a été rejetée.']);
        }
        catch (e) {
            console.warn('Notification insert warning:', e);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Reject verify request error:', err);
        res.status(500).json({ success: false });
    }
});
app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, is_blocked } = req.body;
        const { rows } = await pool.query(`UPDATE users SET full_name=$1, email=$2, is_blocked=$3 WHERE id=$4
       RETURNING id, full_name, email, user_type, created_at, is_blocked`, [full_name, email, is_blocked, id]);
        res.json({ success: true, user: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.delete("/api/users/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        // Delete related documents / skills (cascade should handle most FK deletes but be explicit)
        await pool.query('DELETE FROM user_documents WHERE user_id = $1', [id]);
        await pool.query('DELETE FROM user_skills WHERE user_id = $1', [id]);
        await pool.query("DELETE FROM users WHERE id=$1", [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ success: false });
    }
});
// User requests account deletion (soft delete with retraction period)
app.post('/api/users/me/soft-delete', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // schedule deletion in 14 days
        await pool.query(`UPDATE users SET is_blocked = true, deletion_requested_at = NOW(), deletion_scheduled_at = NOW() + interval '14 days', is_deleted = false WHERE id = $1`, [userId]);
        // insert a notification
        try {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [userId, 'Demande de suppression enregistrée', 'Votre demande de suppression de compte a été enregistrée. Le compte sera définitivement supprimé dans 14 jours.']);
        }
        catch (e) { }
        res.json({ success: true, message: 'Suppression programmée dans 14 jours' });
    }
    catch (err) {
        console.error('Soft delete error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// Admin: immediately permanently delete a user
app.post('/api/admin/users/:id/delete-now', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM user_documents WHERE user_id = $1', [id]);
        await pool.query('DELETE FROM user_skills WHERE user_id = $1', [id]);
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Admin permanent delete error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// FAQs — gestion publique et admin
// ──────────────────────────────────────────────────
app.get("/api/faqs", async (_, res) => {
    try {
        const { rows } = await pool.query("SELECT id, question, answer, created_at FROM faqs ORDER BY created_at DESC");
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/faqs", async (req, res) => {
    try {
        const { question, answer } = req.body;
        const { rows } = await pool.query(`INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING id, question, answer, created_at`, [question, answer]);
        res.json({ success: true, faq: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.put("/api/faqs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const { rows } = await pool.query(`UPDATE faqs SET question=$1, answer=$2 WHERE id=$3 RETURNING id, question, answer, created_at`, [question, answer, id]);
        res.json({ success: true, faq: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.delete("/api/faqs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM faqs WHERE id=$1", [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// PUBLICATIONS / NEWSFEED
// ──────────────────────────────────────────────────
// OPTIMIZED WITH HYBRID SORTING, PROFANITY FILTERING, DISCREET MODE, ACCOUNT STATUS CHECKS
app.get('/api/publications', async (req, res) => {
    try {
        // Allow public access: if an Authorization Bearer token is present, decode it
        // to identify the viewer; otherwise treat the request as anonymous.
        let viewerId: number | null = null;
        let viewerCompanyId: number | null = null;
        try {
            const authHeader = (req.headers.authorization || '') as string;
            if (authHeader) {
                const token = (authHeader.split(' ')[1] || '');
                if (token) {
                    const decoded: any = jwt.verify(token, JWT_SECRET);
                    viewerId = decoded?.id ?? null;
                }
            }
        } catch (e) {
            console.warn('Optional publications auth decode failed:', e?.message || e);
            viewerId = null;
        }

        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50 per request
        const offset = parseInt(req.query.offset as string) || 0;
        const sortBy = (req.query.sort as string) || 'relevant'; // 'relevant' or 'recent'

        // Récupérer les infos de l'utilisateur qui consulte (if available)
        if (viewerId) {
            const { rows: viewerRows } = await pool.query(
                `SELECT id, company_id FROM users WHERE id = $1`,
                [viewerId]
            );
            viewerCompanyId = viewerRows?.[0]?.company_id;
        }

        // Utiliser le service de newsfeed pour appliquer tous les filtres et tri
        const newsfeedService = new NewsfeedService(pool);
        const result = await newsfeedService.getNewsfeedPublications({
            // If no viewerId present we pass 0 so the service handles anonymous viewer
            viewerId: (viewerId as any) ?? 0,
            viewerCompanyId: viewerCompanyId ?? undefined,
            limit,
            offset,
            sortBy: sortBy as any,
        });
        
        // Optimiser les images: ajouter un flag pour lazy loading côté client
        const optimizedRows = result.publications.map((row: any) => ({
            ...row,
            image_url: row.image_url ? row.image_url : null,
            image_loading_strategy: 'lazy', // Signal au client de charger l'image en lazy loading
            certification_priority: undefined, // Supprimer du response (usage interne)
        }));
        
        // Inclure les statistiques de filtrage en DEBUG mode
        const includeDebugInfo = process.env.DEBUG_NEWSFEED_FILTERS === 'true';
        
        res.json({
            publications: optimizedRows,
            total: result.total,
            limit,
            offset,
            hasMore: result.hasMore,
            ...(includeDebugInfo && { filtersSummary: result.filtersSummary }),
        });
    }
    catch (err) {
        console.error('Get publications error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// Create publications (all authenticated users)
app.post('/api/publications', userAuth, async (req, res) => {
    try {
        const { content, visibility = 'public', hashtags, category = 'conseil', achievement = null, image_url = null } = req.body;
        const userId = req.userId;
        if (!content || !userId) {
            return res.status(400).json({ success: false, message: 'Missing content or user ID' });
        }

        // ============================================================
        // STEP 1: Check for profanity BEFORE inserting publication
        // ============================================================
        const newsfeedService = new NewsfeedService(pool);
        const profanityCheck = await newsfeedService.checkPublicationForProfanity(content);

        // Insert publication with profanity status
        const { rows } = await pool.query(`
            INSERT INTO publications 
            (author_id, content, image_url, category, achievement, visibility, hashtags, likes_count, comments_count, is_active, contains_unmoderated_profanity, profanity_check_status, moderation_status, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, true, $8, $9, $10, NOW(), NOW()) 
            RETURNING *`, 
            [
                userId, 
                content, 
                image_url || null, 
                category, 
                achievement || null, 
                visibility, 
                hashtags || null,
                profanityCheck.hasProfanity, // contains_unmoderated_profanity
                profanityCheck.hasProfanity ? 'flagged' : 'checked', // profanity_check_status
                profanityCheck.hasProfanity ? 'pending' : 'approved', // moderation_status
            ]
        );

        const publicationId = rows[0].id;

        // If profanity detected, create violation record
        if (profanityCheck.hasProfanity) {
            await pool.query(
                `INSERT INTO profanity_violations 
                (publication_id, user_id, violation_type, flagged_words, status) 
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    publicationId,
                    userId,
                    'banned_words',
                    profanityCheck.foundWords,
                    'pending',
                ]
            );
        }

        // Fetch user details to return with publication
        const { rows: userRows } = await pool.query(`SELECT full_name, company_name, profile_image_url, user_type FROM users WHERE id = $1`, [userId]);
        const publication = { ...rows[0], ...userRows[0] };

        // Include profanity warning in response if detected
        const response: any = { success: true, publication };
        if (profanityCheck.hasProfanity) {
            response.profanityWarning = {
                detected: true,
                severity: profanityCheck.severity,
                foundWords: profanityCheck.foundWords,
                message: 'Your publication contains forbidden words and requires moderation before being displayed publicly.',
            };
        }

        res.json(response);
    }
    catch (err) {
        console.error('Create publication error:', err);
        res.status(500).json({ success: false, error: String(err) });
    }
});
// Update publication (owner only)
app.put('/api/publications/:id', userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { content, visibility, hashtags, category, achievement, image_url } = req.body;
        // Check ownership
        const { rows: pubRows } = await pool.query(`SELECT author_id FROM publications WHERE id = $1`, [id]);
        if (!pubRows.length) {
            return res.status(404).json({ success: false, message: 'Publication not found' });
        }
        if (pubRows[0].author_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this publication' });
        }
        const { rows } = await pool.query(`UPDATE publications SET content=$1, visibility=$2, hashtags=$3, image_url=$4, category=$5, achievement=$6, updated_at=NOW() WHERE id=$7 RETURNING *`, [content, visibility || 'public', hashtags || null, image_url || null, category || 'annonce', achievement || false, id]);
        // Fetch user details
        const { rows: userRows } = await pool.query(`SELECT full_name, company_name, profile_image_url, user_type FROM users WHERE id = $1`, [userId]);
        const publication = { ...rows[0], ...userRows[0] };
        res.json({ success: true, publication });
    }
    catch (err) {
        console.error('Update publication error:', err);
        res.status(500).json({ success: false });
    }
});
// Delete publication (owner only)
app.delete('/api/publications/:id', userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        // Check ownership
        const { rows } = await pool.query(`SELECT author_id FROM publications WHERE id = $1`, [id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Publication not found' });
        }
        if (rows[0].author_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this publication' });
        }
        await pool.query('DELETE FROM publications WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete publication error:', err);
        res.status(500).json({ success: false });
    }
});
// Like/Unlike publication
// INCLUDES DISCREET MODE CHECK: Before sending like interaction, verify if author is in discreet mode
app.post('/api/publications/:id/like', userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        // Check if publication exists and get author info
        const { rows: pubRows } = await pool.query(
            `SELECT p.id, p.author_id, u.discreet_mode_enabled, u.company_id as author_company_id 
             FROM publications p
             LEFT JOIN users u ON p.author_id = u.id
             WHERE p.id = $1`,
            [id]
        );
        
        if (!pubRows.length) {
            return res.status(404).json({ success: false, message: 'Publication not found' });
        }

        const publication = pubRows[0];
        
        // Get the liker's company for discreet mode check
        const { rows: userRows } = await pool.query(
            `SELECT company_id FROM users WHERE id = $1`,
            [userId]
        );
        const userCompanyId = userRows[0]?.company_id;

        // ========================================================
        // DISCREET MODE CHECK: If author is in discreet mode AND
        // user is from same company, don't allow like interaction
        // (or log it as masked)
        // ========================================================
        if (publication.discreet_mode_enabled && 
            publication.author_company_id && 
            userCompanyId && 
            publication.author_company_id === userCompanyId &&
            publication.author_id !== userId) {
            
            // Option 1: Block the like
            return res.status(403).json({ 
                success: false, 
                message: 'Cannot interact with this publication due to author privacy settings',
                discreetModeBlocked: true 
            });
            
            // Option 2: Allow but mask the interaction (uncomment if preferred)
            // Continue with like but mark as masked in discreet_mode_interactions table
        }

        // Check if user already liked this publication
        const { rows: likeRows } = await pool.query(
            `SELECT id FROM publication_likes WHERE publication_id = $1 AND user_id = $2`, 
            [id, userId]
        );
        
        if (likeRows.length > 0) {
            // Unlike - remove the like
            await pool.query(
                `DELETE FROM publication_likes WHERE publication_id = $1 AND user_id = $2`, 
                [id, userId]
            );
            await pool.query(
                `UPDATE publications SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`, 
                [id]
            );
        }
        else {
            // Like - add a new like
            await pool.query(
                `INSERT INTO publication_likes (publication_id, user_id) VALUES ($1, $2)`, 
                [id, userId]
            );
            await pool.query(
                `UPDATE publications SET likes_count = likes_count + 1 WHERE id = $1`, 
                [id]
            );
        }
        
        // Return updated publication
        const { rows } = await pool.query(`SELECT likes_count FROM publications WHERE id = $1`, [id]);
        res.json({ success: true, likes_count: rows[0].likes_count, liked: likeRows.length === 0 });
    }
    catch (err) {
        console.error('Like publication error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// SERVICE CATALOGS (Catalogue des offres par service)
// ──────────────────────────────────────────────────
app.get('/api/catalogs', async (req, res) => {
    try {
        const service = typeof req.query.service === 'string' ? req.query.service : null;
        let result;
        if (service) {
            result = await pool.query('SELECT * FROM service_catalogs WHERE service_category=$1 AND is_active = true ORDER BY created_at DESC', [service]);
        }
        else {
            result = await pool.query('SELECT * FROM service_catalogs WHERE is_active = true ORDER BY created_at DESC');
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get catalogs error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/catalogs', adminAuth, async (req, res) => {
    try {
        const { service_category, title, description, price = 0, currency = 'XAF', image_url, is_active = true } = req.body;
        const { rows } = await pool.query(`INSERT INTO service_catalogs (service_category, title, description, price, currency, image_url, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [service_category, title, description || null, price, currency, image_url || null, is_active]);
        res.json({ success: true, item: rows[0] });
    }
    catch (err) {
        console.error('Create catalog error:', err);
        res.status(500).json({ success: false });
    }
});
app.put('/api/catalogs/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { service_category, title, description, price, currency, image_url, is_active } = req.body;
        const { rows } = await pool.query(`UPDATE service_catalogs SET service_category=$1, title=$2, description=$3, price=$4, currency=$5, image_url=$6, is_active=$7 WHERE id=$8 RETURNING *`, [service_category, title, description || null, price || 0, currency || 'XAF', image_url || null, is_active !== false, id]);
        res.json({ success: true, item: rows[0] });
    }
    catch (err) {
        console.error('Update catalog error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/catalogs/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM service_catalogs WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete catalog error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// SITE SETTINGS
// ──────────────────────────────────────────────────
app.get('/api/site-settings', async (_, res) => {
    try {
        const { rows } = await pool.query('SELECT key, value FROM site_settings');
        const obj = {};
        rows.forEach((r) => { obj[r.key] = r.value; });
        res.json(obj);
    }
    catch (err) {
        console.error('Get site settings error:', err);
        res.status(500).json({ success: false });
    }
});
app.put('/api/site-settings', adminAuth, async (req, res) => {
    try {
        const updates = req.body || {};
        // Upsert each key
        for (const key of Object.keys(updates)) {
            const value = updates[key];
            await pool.query(`INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, JSON.stringify(value)]);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Update site settings error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 6. STATISTIQUES POUR LE DASHBOARD (DYNAMIQUE)
// ──────────────────────────────────────────────────
app.get("/api/stats", async (_, res) => {
    try {
        const [jobs, formations, admins, users, candidates, companies, applications] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM jobs"),
            pool.query("SELECT COUNT(*) FROM formations"),
            pool.query("SELECT COUNT(*) FROM admins"),
            pool.query("SELECT COUNT(*) FROM users"),
            pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'candidate' OR user_type = 'candidat'"),
            pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'company'"),
            pool.query("SELECT COUNT(*) FROM job_applications"),
        ]);
        res.json({
            jobs: parseInt(jobs.rows[0].count),
            formations: parseInt(formations.rows[0].count),
            admins: parseInt(admins.rows[0].count),
            users: parseInt(users.rows[0].count),
            candidates: parseInt(candidates.rows[0].count),
            companies: parseInt(companies.rows[0].count),
            applications: parseInt(applications.rows[0].count),
        });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur stats" });
    }
});
// Admin-only extended statistics for Super Admin (real-time overview)
app.get('/api/admin/stats', adminAuth, async (req, res) => {
    try {
        const [totalUsersR, totalCandidatesR, totalCompaniesR, totalJobsR, totalApplicationsR, validatedR, jobsPerCompanyR, appsPerCompanyR, recentAppsR] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM users WHERE COALESCE(is_deleted,false) = false"),
            pool.query("SELECT COUNT(*) FROM users WHERE LOWER(user_type) IN ('candidate','candidat')"),
            pool.query("SELECT COUNT(*) FROM users WHERE LOWER(user_type) IN ('company','entreprise')"),
            pool.query("SELECT COUNT(*) FROM jobs"),
            pool.query("SELECT COUNT(*) FROM job_applications"),
            pool.query("SELECT COUNT(*) FROM job_applications WHERE status = 'validated'"),
            pool.query("SELECT j.company_id, j.company, COUNT(*) AS job_count FROM jobs j WHERE j.company_id IS NOT NULL OR j.company IS NOT NULL GROUP BY j.company_id, j.company ORDER BY job_count DESC LIMIT 50"),
            pool.query("SELECT ja.company_id, u.company_name, COUNT(*) AS applications_count FROM job_applications ja LEFT JOIN users u ON u.id = ja.company_id GROUP BY ja.company_id, u.company_name ORDER BY applications_count DESC LIMIT 50"),
            pool.query("SELECT ja.id, ja.job_id, ja.applicant_id, ja.status, ja.created_at, j.title as job_title, j.company as job_company, u.full_name as applicant_name, u.email as applicant_email FROM job_applications ja LEFT JOIN jobs j ON j.id = ja.job_id LEFT JOIN users u ON u.id = ja.applicant_id ORDER BY ja.created_at DESC LIMIT 20"),
        ]);
        const stats = {
            total_users: parseInt(totalUsersR.rows[0].count || '0'),
            total_candidates: parseInt(totalCandidatesR.rows[0].count || '0'),
            total_companies: parseInt(totalCompaniesR.rows[0].count || '0'),
            total_jobs: parseInt(totalJobsR.rows[0].count || '0'),
            total_applications: parseInt(totalApplicationsR.rows[0].count || '0'),
            total_validated_applications: parseInt(validatedR.rows[0].count || '0'),
            jobs_per_company: (jobsPerCompanyR.rows || []).map((r) => ({ company_id: r.company_id, company: r.company, job_count: parseInt(r.job_count) })),
            applications_per_company: (appsPerCompanyR.rows || []).map((r) => ({ company_id: r.company_id, company_name: r.company_name, applications_count: parseInt(r.applications_count) })),
            recent_applications: (recentAppsR.rows || []).map((r) => ({ id: r.id, job_id: r.job_id, job_title: r.job_title, job_company: r.job_company, applicant_id: r.applicant_id, applicant_name: r.applicant_name, applicant_email: r.applicant_email, status: r.status, created_at: r.created_at })),
        };
        res.json(stats);
    }
    catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ success: false, message: 'Erreur récupération statistiques' });
    }
});
// ──────────────────────────────────────────────────
// 7. PORTFOLIOS (RÉALISATIONS) — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/portfolios", async (req, res) => {
    try {
        // Allow filtering by service category: /api/portfolios?service=conception-graphique
        const service = typeof req.query.service === 'string' ? req.query.service : null;
        let result;
        if (service) {
            result = await pool.query(`SELECT * FROM portfolios WHERE service_category = $1 ORDER BY featured DESC, created_at DESC`, [service]);
        }
        else {
            result = await pool.query(`SELECT * FROM portfolios ORDER BY featured DESC, created_at DESC`);
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get portfolios error:', err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/portfolios", async (req, res) => {
    try {
        const { title, description, image_url, project_url, service_category, featured = false } = req.body;
        const { rows } = await pool.query(`INSERT INTO portfolios (title, description, image_url, project_url, service_category, featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [title, description || null, image_url || null, project_url || null, service_category, featured]);
        res.json({ success: true, portfolio: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.put("/api/portfolios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, project_url, service_category, featured } = req.body;
        const { rows } = await pool.query(`UPDATE portfolios SET title=$1, description=$2, image_url=$3, project_url=$4, service_category=$5, featured=$6 WHERE id=$7 RETURNING *`, [title, description || null, image_url || null, project_url || null, service_category, featured || false, id]);
        res.json({ success: true, portfolio: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/portfolios/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM portfolios WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// USER DOCUMENTS (CVs / Letters) — CRUD + quotas
// ──────────────────────────────────────────────────
// Create a new user document (generated CV or letter)
app.post('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { doc_type, title, storage_url, metadata } = req.body;
        if (!doc_type)
            return res.status(400).json({ success: false, message: 'doc_type requis' });
        // Saved documents limit per document type (e.g. max 2 CVs, 2 letters)
        const { rows: savedTypeRows } = await pool.query('SELECT COUNT(*) FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, doc_type]);
        const savedTypeCount = parseInt(savedTypeRows[0].count || '0');
        if (savedTypeCount >= 2) {
            return res.status(400).json({ success: false, message: `Limite de documents sauvegardés atteinte pour le type ${doc_type} (2)` });
        }
        // Monthly creation limit per doc_type (10 per month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { rows: monthRows } = await pool.query(`SELECT COUNT(*) FROM user_documents WHERE user_id=$1 AND doc_type=$2 AND created_at >= $3`, [userId, doc_type, startOfMonth]);
        const monthCount = parseInt(monthRows[0].count || '0');
        if (monthCount >= 10) {
            return res.status(400).json({ success: false, message: 'Limite mensuelle atteinte pour ce type de document (10)' });
        }
        const { rows } = await pool.query(`INSERT INTO user_documents (user_id, doc_type, title, storage_url, metadata) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [userId, doc_type, title || null, storage_url || null, metadata || null]);
        res.json({ success: true, document: rows[0] });
    }
    catch (err) {
        console.error('Create user document error:', err);
        res.status(500).json({ success: false });
    }
});
// List user's documents
app.get('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT * FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('List user documents error:', err);
        res.status(500).json({ success: false });
    }
});
// Delete a user's document
app.delete('/api/user-documents/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { rows } = await pool.query('SELECT user_id FROM user_documents WHERE id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Document non trouvé' });
        if (rows[0].user_id !== userId)
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        await pool.query('DELETE FROM user_documents WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete user document error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 8. CANAUX DE COMMUNICATION — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/channels", async (_, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM communication_channels WHERE is_active = true ORDER BY display_order ASC");
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.post("/api/channels", async (req, res) => {
    try {
        const { channel_name, channel_url, channel_type, icon_name, display_order = 0, is_active = true } = req.body;
        const { rows } = await pool.query(`INSERT INTO communication_channels (channel_name, channel_url, channel_type, icon_name, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [channel_name, channel_url, channel_type, icon_name || null, display_order, is_active]);
        res.json({ success: true, channel: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.put("/api/channels/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { channel_name, channel_url, channel_type, icon_name, display_order, is_active } = req.body;
        const { rows } = await pool.query(`UPDATE communication_channels SET channel_name=$1, channel_url=$2, channel_type=$3, icon_name=$4, display_order=$5, is_active=$6 WHERE id=$7 RETURNING *`, [channel_name, channel_url, channel_type, icon_name || null, display_order || 0, is_active !== false, id]);
        res.json({ success: true, channel: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/channels/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM communication_channels WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// SERVICE CATALOGS MANAGEMENT API
// ──────────────────────────────────────────────────
app.get("/api/service-catalogs", async (req, res) => {
    try {
        const category = typeof req.query.category === 'string' ? req.query.category : null;
        let query = "SELECT * FROM service_catalogs ORDER BY created_at DESC";
        const params = [];
        if (category) {
            query = "SELECT * FROM service_catalogs WHERE category = $1 ORDER BY created_at DESC";
            params.push(category);
        }
        const { rows } = await pool.query(query, params);
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching catalogs:", error);
        res.status(500).json({ error: "Failed to fetch catalogs" });
    }
});
app.post("/api/service-catalogs", async (req, res) => {
    try {
        const { name, description, category, price, image_url } = req.body;
        const { rows } = await pool.query(`INSERT INTO service_catalogs (name, description, category, price, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`, [name, description, category, price || null, image_url || null]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        console.error("Error creating catalog:", error);
        res.status(500).json({ error: "Failed to create catalog" });
    }
});
// Record a visitor interaction (public endpoint)
app.post('/api/interactions', async (req, res) => {
    try {
        const { user_id = null, service = null, event_type = 'interaction', payload = {} } = req.body || {};
        const { rows } = await pool.query(`INSERT INTO visitor_interactions (user_id, service, event_type, payload, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *`, [user_id, service, event_type, payload]);
        res.status(201).json({ success: true, item: rows[0] });
    }
    catch (err) {
        console.error('Create interaction error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin SSE endpoint for realtime interactions stream
app.get('/api/admin/realtime', async (req, res) => {
    // Accept token either via query param or Authorization header
    const token = typeof req.query.token === 'string' ? req.query.token : (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (!token)
        return res.status(401).json({ success: false, message: 'Token manquant' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const allowed = ['admin', 'super_admin', 'admin_content'];
        if (!decoded.role || !allowed.includes(decoded.role))
            return res.status(403).json({ success: false, message: 'Accès admin requis' });
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    // Set headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    let lastId = 0;
    const sendEvent = (row) => {
        const data = JSON.stringify(row);
        res.write(`data: ${data}\n\n`);
    };
    // Initial send: last 20 events
    (async () => {
        try {
            const { rows } = await pool.query('SELECT * FROM visitor_interactions ORDER BY id DESC LIMIT 20');
            rows.reverse().forEach((r) => { sendEvent(r); lastId = Math.max(lastId, r.id); });
        }
        catch (err) {
            console.error('SSE initial fetch error:', err);
        }
    })();
    // Poll for new events every 1500ms
    const interval = setInterval(async () => {
        try {
            const { rows } = await pool.query('SELECT * FROM visitor_interactions WHERE id > $1 ORDER BY id ASC', [lastId]);
            if (rows.length > 0) {
                rows.forEach((r) => { sendEvent(r); lastId = Math.max(lastId, r.id); });
            }
        }
        catch (err) {
            console.error('SSE poll error:', err);
        }
    }, 1500);
    // Close connection handling
    req.on('close', () => {
        clearInterval(interval);
        try {
            res.end();
        }
        catch (e) { }
    });
});
app.patch("/api/service-catalogs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, image_url } = req.body;
        const { rows } = await pool.query(`UPDATE service_catalogs 
       SET name = $1, description = $2, category = $3, price = $4, image_url = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`, [name, description, category, price || null, image_url || null, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Catalog not found" });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error("Error updating catalog:", error);
        res.status(500).json({ error: "Failed to update catalog" });
    }
});
app.delete("/api/service-catalogs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("DELETE FROM service_catalogs WHERE id = $1 RETURNING *", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Catalog not found" });
        }
        res.json({ message: "Catalog deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting catalog:", error);
        res.status(500).json({ error: "Failed to delete catalog" });
    }
});
// ──────────────────────────────────────────────────
// FILE UPLOAD (local storage)
// ──────────────────────────────────────────────────
// ──────────────────────────────────────────────────
// PORTFOLIOS (Projets réalisés)
// ──────────────────────────────────────────────────
// GET all portfolios with optional category filter
app.get("/api/portfolios", async (req, res) => {
    try {
        const category = typeof req.query.category === 'string' ? req.query.category : null;
        let query = "SELECT * FROM portfolios ORDER BY featured DESC, created_at DESC";
        const params = [];
        if (category) {
            query = "SELECT * FROM portfolios WHERE service_category = $1 ORDER BY featured DESC, created_at DESC";
            params.push(category);
        }
        const { rows } = await pool.query(query, params);
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching portfolios:", error);
        res.status(500).json({ error: "Failed to fetch portfolios" });
    }
});
// POST - Create new portfolio
app.post("/api/portfolios", async (req, res) => {
    try {
        const { title, description, image_url, project_url, service_category, featured } = req.body;
        if (!title || !service_category) {
            return res.status(400).json({ error: "Title and service_category are required" });
        }
        const { rows } = await pool.query("INSERT INTO portfolios (title, description, image_url, project_url, service_category, featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [title, description || null, image_url || null, project_url || null, service_category, featured || false]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        console.error("Error creating portfolio:", error);
        res.status(500).json({ error: "Failed to create portfolio" });
    }
});
// PATCH - Update portfolio
app.patch("/api/portfolios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, project_url, service_category, featured } = req.body;
        const { rows } = await pool.query("UPDATE portfolios SET title = COALESCE($1, title), description = COALESCE($2, description), image_url = COALESCE($3, image_url), project_url = COALESCE($4, project_url), service_category = COALESCE($5, service_category), featured = COALESCE($6, featured) WHERE id = $7 RETURNING *", [title, description, image_url, project_url, service_category, featured, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Portfolio not found" });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error("Error updating portfolio:", error);
        res.status(500).json({ error: "Failed to update portfolio" });
    }
});
// DELETE - Remove portfolio
app.delete("/api/portfolios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("DELETE FROM portfolios WHERE id = $1 RETURNING *", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Portfolio not found" });
        }
        res.json({ message: "Portfolio deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting portfolio:", error);
        res.status(500).json({ error: "Failed to delete portfolio" });
    }
});
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// DEPRECATED: This endpoint is replaced by Supabase Storage
// Keeping for backwards compatibility, redirects to frontend to use Supabase directly
app.post('/api/upload', userAuth, async (req, res) => {
    res.status(410).json({
        success: false,
        message: 'Ce endpoint est dépréciée. Veuillez utiliser Supabase Storage directement depuis le frontend.',
        documentation: 'Voir SUPABASE_MIGRATION.md'
    });
});
// Note: /uploads routes are no longer served as files are now in Supabase Storage
// Ensure the `business_cards` table exists
pool.query(`CREATE TABLE IF NOT EXISTS business_cards (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    address TEXT,
    logo_url TEXT,
    card_color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure business_cards table exists:", err));
// GET /api/business-cards - List cards for authenticated company user
app.get('/api/business-cards', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        const result = await pool.query('SELECT * FROM business_cards WHERE company_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get business cards error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// POST /api/business-cards - Create a new business card
app.post('/api/business-cards', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        const { title, full_name, phone, email, website, address, card_color } = req.body;
        if (!title || !full_name || !phone) {
            return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
        }
        const result = await pool.query(`INSERT INTO business_cards (company_id, title, full_name, phone, email, website, address, card_color) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`, [userId, title, full_name, phone, email || null, website || null, address || null, card_color || 'blue']);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Create business card error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// DELETE /api/business-cards/:id - Delete a business card
app.delete('/api/business-cards/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const cardId = req.params.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        // Verify card belongs to user
        const card = await pool.query('SELECT * FROM business_cards WHERE id = $1 AND company_id = $2', [cardId, userId]);
        if (card.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Carte non trouvée' });
        }
        await pool.query('DELETE FROM business_cards WHERE id = $1', [cardId]);
        res.json({ success: true, message: 'Carte supprimée' });
    }
    catch (err) {
        console.error('Delete business card error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
const startServer = async () => {
    try {
        await connectedPromise;
        if (!isConnected) {
            console.warn('DB not connected after attempts — server starting in degraded mode');
        } else {
            console.log('✅ Connecté à la DB via : DATABASE_URL (SSH tunnel via port 5433)');
        }
    }
    catch (e) {
        console.warn('DB connection promise rejected, starting server in degraded mode');
    }
    // ============ SAVED JOBS ENDPOINTS ============
    // Get all saved jobs for the authenticated candidate
    app.get('/api/saved-jobs', userAuth, async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            const { rows } = await pool.query(`SELECT j.*, sj.id as saved_id, sj.created_at as saved_at 
         FROM saved_jobs sj
         LEFT JOIN jobs j ON j.id = sj.job_id
         WHERE sj.user_id = $1
         ORDER BY sj.created_at DESC`, [userId]);
            res.json(rows);
        }
        catch (err) {
            console.error('Error fetching saved jobs:', err);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    });
    // Save a job for the authenticated candidate
    app.post('/api/saved-jobs', userAuth, async (req, res) => {
        try {
            const userId = req.userId;
            const { job_id } = req.body;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            if (!job_id)
                return res.status(400).json({ success: false, message: 'Job ID requis' });
            // Check if job exists
            const { rows: jobRows } = await pool.query('SELECT id FROM jobs WHERE id = $1', [job_id]);
            if (!jobRows || jobRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Offre non trouvée' });
            }
            // Try to insert the saved job
            const { rows } = await pool.query(`INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) 
         ON CONFLICT (user_id, job_id) DO UPDATE SET user_id = $1 
         RETURNING *`, [userId, job_id]);
            res.json({ success: true, saved_job: rows[0] });
        }
        catch (err) {
            console.error('Error saving job:', err);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    });
    // Remove a saved job for the authenticated candidate
    app.delete('/api/saved-jobs/:jobId', userAuth, async (req, res) => {
        try {
            const userId = req.userId;
            const { jobId } = req.params;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            const { rows } = await pool.query(`DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2 RETURNING *`, [userId, jobId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Offre enregistrée non trouvée' });
            }
            res.json({ success: true, message: 'Offre supprimée des favoris' });
        }
        catch (err) {
            console.error('Error deleting saved job:', err);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    });
    // Check if a job is saved for the authenticated candidate
    app.get('/api/saved-jobs/check/:jobId', userAuth, async (req, res) => {
        try {
            const userId = req.userId;
            const { jobId } = req.params;
            if (!userId)
                return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            const { rows } = await pool.query(`SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2`, [userId, jobId]);
            res.json({ saved: rows && rows.length > 0 });
        }
        catch (err) {
            console.error('Error checking saved job:', err);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    });

    // ============================================================================
    // ADMIN ENDPOINTS: BANNED WORDS & PROFANITY MANAGEMENT
    // ============================================================================

    // Get all banned words (admin)
    app.get('/api/admin/banned-words', adminAuth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id, word, severity, is_active, created_at 
                 FROM banned_words_backend 
                 ORDER BY created_at DESC`
            );
            res.json({ success: true, bannedWords: result.rows });
        } catch (err) {
            console.error('Error fetching banned words:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // Add new banned word (admin)
    app.post('/api/admin/banned-words', adminAuth, async (req, res) => {
        try {
            const { word, severity = 'high' } = req.body;
            if (!word || word.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Word cannot be empty' });
            }

            const result = await pool.query(
                `INSERT INTO banned_words_backend (word, severity, is_active) 
                 VALUES ($1, $2, true) 
                 RETURNING *`,
                [word.toLowerCase().trim(), severity]
            );

            res.json({ success: true, bannedWord: result.rows[0] });
        } catch (err: any) {
            if (err.code === '23505') { // Unique violation
                return res.status(409).json({ 
                    success: false, 
                    message: 'This word is already in the banned list' 
                });
            }
            console.error('Error adding banned word:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // Delete banned word (admin)
    app.delete('/api/admin/banned-words/:id', adminAuth, async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM banned_words_backend WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (err) {
            console.error('Error deleting banned word:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // Get pending profanity violations (admin)
    app.get('/api/admin/profanity-violations', adminAuth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT 
                    pv.id,
                    pv.publication_id,
                    pv.user_id,
                    pv.flagged_words,
                    pv.status,
                    pv.created_at,
                    u.full_name as author_name,
                    u.email as author_email,
                    p.content as publication_content
                 FROM profanity_violations pv
                 LEFT JOIN users u ON pv.user_id = u.id
                 LEFT JOIN publications p ON pv.publication_id = p.id
                 WHERE pv.status = 'pending'
                 ORDER BY pv.created_at DESC`
            );
            res.json({ success: true, violations: result.rows });
        } catch (err) {
            console.error('Error fetching profanity violations:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // Approve profanity violation (admin)
    app.post('/api/admin/profanity-violations/:id/approve', adminAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const adminId = req.userId;
            const { action = 'approve' } = req.body; // 'approve', 'reject'

            const result = await pool.query(
                `UPDATE profanity_violations 
                 SET 
                    status = $1,
                    moderated_by_admin_id = $2,
                    reviewed_at = NOW()
                 WHERE id = $3
                 RETURNING *`,
                [action === 'approve' ? 'approved' : 'rejected', adminId, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Violation not found' });
            }

            const violation = result.rows[0];

            // If approved, mark publication as safe
            if (action === 'approve') {
                await pool.query(
                    `UPDATE publications 
                     SET 
                        contains_unmoderated_profanity = false,
                        moderation_status = 'approved',
                        is_active = true
                     WHERE id = $1`,
                    [violation.publication_id]
                );
            } else {
                // If rejected, keep publication hidden and mark author
                await pool.query(
                    `UPDATE publications 
                     SET moderation_status = 'rejected'
                     WHERE id = $1`,
                    [violation.publication_id]
                );
            }

            res.json({ success: true, violation: result.rows[0] });
        } catch (err) {
            console.error('Error approving profanity violation:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // Get newsfeed filter statistics (admin)
    app.get('/api/admin/newsfeed-stats', adminAuth, async (req, res) => {
        try {
            const newsfeedService = new NewsfeedService(pool);
            const stats = await newsfeedService.getDailyFilterStatistics();
            res.json({ success: true, stats });
        } catch (err) {
            console.error('Error fetching newsfeed stats:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // ============================================================================
    // ADMIN: Cache Management
    // ============================================================================

    // GET /api/admin/cache/stats - Obtenir les statistiques du cache (admin)
    app.get('/api/admin/cache/stats', adminAuth, (req, res) => {
        try {
            const stats = jobsSearchCache.getStats();
            res.json({
                success: true,
                cache: stats,
            });
        } catch (err) {
            console.error('Error getting cache stats:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // DELETE /api/admin/cache/jobs - Invalider tous les caches de recherche d'offres (admin)
    app.delete('/api/admin/cache/jobs', adminAuth, (req, res) => {
        try {
            jobsSearchCache.invalidateAllSearches();
            res.json({
                success: true,
                message: 'Cache des offres d\'emploi invalidé',
            });
        } catch (err) {
            console.error('Error invalidating cache:', err);
            res.status(500).json({ success: false, error: String(err) });
        }
    });

    // ==================== OPTIMIZED SEARCH ENDPOINTS ====================
    // Initialiser le service de recherche
    const searchService = new SearchService(pool);

    // GET /api/search/global - Recherche globale (jobs + formations + users)
    app.get('/api/search/global', async (req, res) => {
        try {
            const query = (req.query.q as string || '').trim();
            
            // Vérifier condition minimale
            if (query.length < 3) {
                return res.json({
                    jobs: [],
                    formations: [],
                    users: [],
                    message: 'Au moins 3 caractères requis'
                });
            }

            const limit = Math.min(parseInt(req.query.limit as string) || 5, 8);
            const results = await searchService.globalSearch(query, limit);
            
            res.json(results);
        } catch (error) {
            console.error('Global search error:', error);
            res.status(500).json({ success: false, error: String(error) });
        }
    });

    // GET /api/search/jobs - Recherche dans les offres d'emploi
    app.get('/api/search/jobs', async (req, res) => {
        try {
            const query = (req.query.q as string || '').trim();
            
            if (query.length < 3) {
                return res.json([]);
            }

            const limit = Math.min(parseInt(req.query.limit as string) || 8, 20);
            const results = await searchService.searchJobs(query, limit);
            
            res.json(results);
        } catch (error) {
            console.error('Jobs search error:', error);
            res.status(500).json({ success: false, error: String(error) });
        }
    });

    // GET /api/search/formations - Recherche dans les formations
    app.get('/api/search/formations', async (req, res) => {
        try {
            const query = (req.query.q as string || '').trim();
            
            if (query.length < 3) {
                return res.json([]);
            }

            const limit = Math.min(parseInt(req.query.limit as string) || 8, 20);
            const results = await searchService.searchFormations(query, limit);
            
            res.json(results);
        } catch (error) {
            console.error('Formations search error:', error);
            res.status(500).json({ success: false, error: String(error) });
        }
    });

    // GET /api/search/users - Recherche dans les utilisateurs
    app.get('/api/search/users', async (req, res) => {
        try {
            const query = (req.query.q as string || '').trim();
            
            if (query.length < 3) {
                return res.json([]);
            }

            const limit = Math.min(parseInt(req.query.limit as string) || 8, 20);
            const results = await searchService.searchUsers(query, limit);
            
            res.json(results);
        } catch (error) {
            console.error('Users search error:', error);
            res.status(500).json({ success: false, error: String(error) });
        }
    });

    // Use PORT from environment, fallback to 5000 for local dev
    const PORT = parseInt(process.env.PORT || '5000', 10);
    const HOST = process.env.HOST || '0.0.0.0';
    
    app.listen(PORT, HOST, () => {
        console.log(`\n🚀 Backend prêt sur le port ${PORT}`);
        console.log(`✅ Server running on ${process.env.FRONTEND_URL || `http://localhost:${PORT}`}`);
        console.log('\n📊 Database Connection Status:');
        console.log(`Tentative de connexion au port: ${process.env.DATABASE_URL || 'Aucune DATABASE_URL définie'}`);
        const dbPort = process.env.DATABASE_URL?.includes(':5444') ? 'VPS via Tunnel (Port 5444)' : process.env.DATABASE_URL?.includes(':5433') ? 'VPS via Tunnel (Port 5433)' : 'Local (Port 5432)';
        console.log(`✅ DB Connection: ${dbPort}\n`);
    });
};
startServer();
// Global error handler to log unexpected errors
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent)
        return next(err);
    // Defensive: when an unexpected error occurs, log it and return
    // a safe default for API routes so a single failing handler doesn't
    // break other frontend parts. In production we still return a generic
    // 500 message without stack.
    const isApi = typeof req.path === 'string' && req.path.startsWith('/api/');
    if (isApi) {
        // Determine a safe default based on method/path
        try {
            if (req.method === 'GET') {
                // If fetching a single resource (eg. /api/users/me), return an empty object
                if (/\/api\/users(\/me|\/\d+)?/.test(req.path)) {
                    const body = { success: false, message: 'Erreur serveur (fallback)', data: {} };
                    if (process.env.NODE_ENV !== 'production' && err && (err as any).stack) {
                        (body as any).stack = (err as any).stack;
                    }
                    return res.status(200).json(body);
                }
                // Otherwise default to empty array for list endpoints
                const arrBody = [];
                return res.status(200).json(arrBody);
            }
        }
        catch (e) {
            // fallthrough to generic 500
        }
    }
    const body: any = { success: false, message: (err as any)?.message || 'Erreur serveur inattendue' };
    if (process.env.NODE_ENV !== 'production' && err && (err as any).stack) {
        body.stack = (err as any).stack;
    }
    res.status(500).json(body);
});

// Email configuration and helper function
const createEmailTransporter = () => {
    // Try to create transporter from environment variables (primary method)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            tls: {
              rejectUnauthorized: false // Allow self-signed certificates on VPS
            },
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    // Fallback to Gmail if configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }
    return null;
};

// Helper function to send contact form notification
const sendContactNotification = async (name: string, email: string, category: string, subject: string, message: string) => {
    try {
        const transporter = createEmailTransporter();
        if (!transporter) {
            console.warn('No email configuration found. Contact message stored but not notified.');
            return false;
        }

        const emailBody = `
<h2>Nouveau message de contact</h2>
<p><strong>De:</strong> ${name} (${email})</p>
<p><strong>Catégorie:</strong> ${category}</p>
<p><strong>Objet:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@emploiplus-group.com',
            to: 'contact@emploiplus-group.com',
            subject: `Nouveau contact: ${subject}`,
            html: emailBody,
            replyTo: email,
        });

        console.log('Contact email sent to contact@emploiplus-group.com');
        return true;
    } catch (error) {
        console.error('Error sending contact email:', error);
        return false;
    }
};

// Contact form endpoint (simple storage / notification placeholder)
app.post('/api/contact', async (req, res) => {
    try {
        const { email, name, subject, message, category } = req.body;
        if (!email || !subject || !message || !name)
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
        // Insert into contacts table if exists, otherwise just log
        try {
            await pool.query(`CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name TEXT,
          email TEXT,
          category TEXT,
          subject TEXT,
          message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )`);
            await pool.query('INSERT INTO contacts (name, email, category, subject, message) VALUES ($1,$2,$3,$4,$5)', [name, email, category, subject, message]);
        }
        catch (e) {
            console.warn('Contact DB warning:', e);
        }
        
        // Try to send email notification
        await sendContactNotification(name, email, category || 'general', subject, message);
        
        console.log('Contact message received:', { name, email, category, subject, message });
        res.json({ success: true, message: 'Message reçu, nous vous contacterons bientôt' });
    }
    catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/testimonials - Get all testimonials with user info
app.get('/api/testimonials', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT 
        t.id, 
        t.user_id, 
        t.rating, 
        t.content, 
        t.position,
        t.created_at,
        u.full_name,
        u.company_name,
        u.user_type,
        u.profile_image_url
      FROM testimonials t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `);
        res.json(rows || []);
    }
    catch (err) {
        console.error('Get testimonials error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors du chargement des avis' });
    }
});
// POST /api/testimonials - Create a new testimonial (requires auth)
app.post('/api/testimonials', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        const { rating, content, position } = req.body;
        // Validate required fields
        if (!rating || !content || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating (1-5) et content requis' });
        }
        // Check if user already has a testimonial
        const existing = await pool.query('SELECT id FROM testimonials WHERE user_id = $1', [userId]);
        if (existing.rows.length > 0) {
            // Update existing testimonial
            await pool.query('UPDATE testimonials SET rating = $1, content = $2, position = $3, updated_at = NOW() WHERE user_id = $4', [rating, content, position || null, userId]);
        }
        else {
            // Insert new testimonial
            await pool.query('INSERT INTO testimonials (user_id, rating, content, position) VALUES ($1, $2, $3, $4)', [userId, rating, content, position || null]);
        }
        res.json({ success: true, message: 'Avis ajouté/mis à jour avec succès' });
    }
    catch (err) {
        console.error('Create testimonial error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de l\'avis' });
    }
});
// DELETE /api/testimonials/:id - Delete a testimonial (auth required, own testimonial)
app.delete('/api/testimonials/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const testimonialId = req.params.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        // Verify ownership
        const testimonial = await pool.query('SELECT user_id FROM testimonials WHERE id = $1', [testimonialId]);
        if (testimonial.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Avis non trouvé' });
        }
        if (testimonial.rows[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Vous ne pouvez supprimer que votre avis' });
        }
        await pool.query('DELETE FROM testimonials WHERE id = $1', [testimonialId]);
        res.json({ success: true, message: 'Avis supprimé' });
    }
    catch (err) {
        console.error('Delete testimonial error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
});
// Development helper: ensure essential schema now (callable)
app.post('/api/setup', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production')
            return res.status(403).json({ success: false, message: 'Forbidden' });
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        user_type TEXT NOT NULL DEFAULT 'candidate',
        phone TEXT,
        company_name TEXT,
        company_address TEXT,
        profession TEXT,
        job_title TEXT,
        diploma TEXT,
        experience_years INTEGER DEFAULT 0,
        profile_image_url TEXT,
        skills JSONB DEFAULT '[]',
        is_verified BOOLEAN DEFAULT false,
        is_blocked BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        deletion_requested_at TIMESTAMP NULL,
        deletion_scheduled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS visitor_interactions (id SERIAL PRIMARY KEY, user_id INTEGER NULL, service TEXT, event_type TEXT, payload JSONB, created_at TIMESTAMP DEFAULT NOW())`);
        await pool.query(`CREATE TABLE IF NOT EXISTS user_documents (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, doc_type TEXT NOT NULL, title TEXT, storage_url TEXT, created_at TIMESTAMP DEFAULT NOW())`);
        await pool.query(`CREATE TABLE IF NOT EXISTS user_skills (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, skill_name TEXT NOT NULL, category TEXT, created_at TIMESTAMP DEFAULT NOW())`);
        await pool.query(`CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, title TEXT NOT NULL, message TEXT, read BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW())`);
        await pool.query(`CREATE TABLE IF NOT EXISTS site_notifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, message TEXT, target TEXT DEFAULT 'all', category TEXT, image_url TEXT, link TEXT, created_at TIMESTAMP DEFAULT NOW())`);
        await pool.query(`CREATE TABLE IF NOT EXISTS welcome_templates (id SERIAL PRIMARY KEY, user_type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, created_by_admin INTEGER NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`).catch(() => { });
        await pool.query(`ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS link TEXT`).catch(() => { });
        await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline TIMESTAMP NULL`);
        res.json({ success: true, message: 'Schema ensured' });
    }
    catch (err) {
        console.error('Setup error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur' });
    }
});

// ──────────────────────────────────────────────────
// MATCH SCORE & CAREER ROADMAP APIs
// ──────────────────────────────────────────────────

// Calculate match score for a user against a specific job
app.get('/api/jobs/:jobId/match-score', userAuth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.userId;

        if (!jobId || !userId) {
            return res.status(400).json({ success: false, message: 'Job ID et user ID requis' });
        }

        const matchScore = await calculateMatchScore(pool, userId, parseInt(jobId, 10));
        res.json(matchScore);
    } catch (err) {
        console.error('Calculate match score error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur lors du calcul du score' });
    }
});

// Get match scores for all jobs for authenticated user
app.get('/api/jobs/match-scores/all', userAuth, async (req, res) => {
    try {
        const userId = req.userId;

        // Get all published jobs
        const jobsResult = await pool.query(
            'SELECT id FROM jobs WHERE published = true ORDER BY created_at DESC LIMIT 100'
        );

        const matchScores = [];
        for (const job of jobsResult.rows) {
            try {
                const score = await calculateMatchScore(pool, userId, job.id);
                matchScores.push(score);
            } catch (e) {
                console.warn(`Could not calculate match for job ${job.id}:`, e.message);
            }
        }

        res.json(matchScores);
    } catch (err) {
        console.error('Get all match scores error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des scores' });
    }
});

// Generate career roadmap for a target job
app.get('/api/career/roadmap/:targetJobId', userAuth, async (req, res) => {
    try {
        const { targetJobId } = req.params;
        const userId = req.userId;

        if (!targetJobId || !userId) {
            return res.status(400).json({ success: false, message: 'Target job ID et user ID requis' });
        }

        // Save target position
        await pool.query(
            `INSERT INTO user_target_positions (user_id, target_job_id, target_job_title)
             SELECT $1, j.id, j.title FROM jobs j WHERE j.id = $2
             ON CONFLICT (user_id, target_job_id) DO NOTHING`,
            [userId, parseInt(targetJobId, 10)]
        );

        const roadmap = await generateCareerRoadmap(pool, userId, parseInt(targetJobId, 10));
        res.json(roadmap);
    } catch (err) {
        console.error('Generate career roadmap error:', err);
        res.status(500).json({ success: false, message: err.message || 'Erreur lors de la génération de la roadmap' });
    }
});

// Get all target positions for authenticated user
app.get('/api/career/target-positions', userAuth, async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT utp.*, j.title, j.description, j.company
             FROM user_target_positions utp
             LEFT JOIN jobs j ON j.id = utp.target_job_id
             WHERE utp.user_id = $1
             ORDER BY utp.created_at DESC`,
            [userId]
        );

        res.json(result.rows || []);
    } catch (err) {
        console.error('Get target positions error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des postes cibles' });
    }
});

// Delete a target position
app.delete('/api/career/target-positions/:positionId', userAuth, async (req, res) => {
    try {
        const { positionId } = req.params;
        const userId = req.userId;

        // Verify ownership
        const posResult = await pool.query(
            'SELECT user_id FROM user_target_positions WHERE id = $1',
            [positionId]
        );

        if (posResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Position cible non trouvée' });
        }

        if (posResult.rows[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }

        await pool.query('DELETE FROM user_target_positions WHERE id = $1', [positionId]);
        res.json({ success: true, message: 'Position cible supprimée' });
    } catch (err) {
        console.error('Delete target position error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
});

// Admin: Add job requirements/keywords
app.post('/api/admin/jobs/:jobId/requirements', adminAuth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const { requirements } = req.body;

        if (!Array.isArray(requirements)) {
            return res.status(400).json({ success: false, message: 'Requirements doit être un tableau' });
        }

        for (const req_item of requirements) {
            await pool.query(
                `INSERT INTO job_requirements (job_id, skill, is_required, category)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (job_id, skill) DO UPDATE SET is_required = $3, category = $4`,
                [jobId, req_item.skill, req_item.is_required || false, req_item.category || 'technical']
            );
        }

        res.json({ success: true, message: 'Compétences requises mises à jour' });
    } catch (err) {
        console.error('Add job requirements error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout des compétences' });
    }
});

// Admin: Add formation skills/keywords
app.post('/api/admin/formations/:formationId/skills', adminAuth, async (req, res) => {
    try {
        const { formationId } = req.params;
        const { skills } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({ success: false, message: 'Skills doit être un tableau' });
        }

        for (const skill of skills) {
            await pool.query(
                `INSERT INTO formation_skills (formation_id, skill)
                 VALUES ($1, $2)
                 ON CONFLICT (formation_id, skill) DO NOTHING`,
                [formationId, skill]
            );
        }

        res.json({ success: true, message: 'Compétences de formation mises à jour' });
    } catch (err) {
        console.error('Add formation skills error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout des compétences' });
    }
});

// ===== FOLLOW/CONNECTIONS ENDPOINTS =====

// Follow a user
app.post('/api/follows/:followingId', userAuth, async (req, res) => {
    try {
        const { followingId } = req.params;
        const userId = req.userId;

        if (parseInt(followingId) === userId) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous suivre vous-même' });
        }

        const follow = await followUser(userId, parseInt(followingId));
        res.json({ success: true, follow });
    } catch (error: any) {
        console.error('Follow error:', error);
        res.status(400).json({ success: false, message: error.message || 'Erreur lors du suivi' });
    }
});

// Unfollow a user
app.delete('/api/follows/:followingId', userAuth, async (req, res) => {
    try {
        const { followingId } = req.params;
        const userId = req.userId;

        const success = await unfollowUser(userId, parseInt(followingId));
        res.json({ success });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'arrêt du suivi' });
    }
});

// Get network stats (followers/following counts)
app.get('/api/follows/stats', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const stats = await getFollowers(userId);
        res.json(stats);
    } catch (error) {
        console.error('Network stats error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des stats' });
    }
});

// Get suggestions for follow
app.get('/api/follows/suggestions', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit as string) || 10;

        const suggestions = await getSuggestions(userId, limit);
        res.json(suggestions);
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des suggestions' });
    }
});

// Get network activity (what your follows are doing)
app.get('/api/follows/activity', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit as string) || 20;

        const activities = await getNetworkActivity(userId, limit);
        res.json(activities);
    } catch (error) {
        console.error('Network activity error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'activité' });
    }
});

// Get following list
app.get('/api/follows/following', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const users = await getFollowingUsers(userId);
        res.json(users);
    } catch (error) {
        console.error('Following list error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des abonnements' });
    }
});

// Get followers list
app.get('/api/follows/followers', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const users = await getFollowerUsers(userId);
        res.json(users);
    } catch (error) {
        console.error('Followers list error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des abonnés' });
    }
});

// Check if following
app.get('/api/follows/:userId/is-following', userAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        const following = await isFollowing(currentUserId, parseInt(userId));
        res.json({ following });
    } catch (error) {
        console.error('Check following error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la vérification' });
    }
});

// Block a user
app.post('/api/blocks/:blockedUserId', userAuth, async (req: Request, res: Response) => {
    try {
        const { blockedUserId } = req.params;
        const userId = req.userId;

        if (parseInt(blockedUserId) === userId) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous bloquer vous-même' });
        }

        const block = await blockUser(userId, parseInt(blockedUserId));
        res.json({ success: true, block });
    } catch (error) {
        console.error('Block error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du blocage' });
    }
});

// Unblock a user
app.delete('/api/blocks/:blockedUserId', userAuth, async (req: Request, res: Response) => {
    try {
        const { blockedUserId } = req.params;
        const userId = req.userId;

        const success = await unblockUser(userId, parseInt(blockedUserId));
        res.json({ success });
    } catch (error) {
        console.error('Unblock error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du déblocage' });
    }
});

// ===== MESSAGING ENDPOINTS =====

// Get conversations for current user
app.get('/api/conversations', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit as string) || 50;

        const conversations = await getConversations(userId, limit);
        res.json(conversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des conversations' });
    }
});

// Get or create conversation
app.post('/api/conversations', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { recipientId, subjectId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ success: false, message: 'recipientId requis' });
        }

        const conversation = await getOrCreateConversation(userId, parseInt(recipientId), subjectId);
        res.json(conversation);
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création de la conversation' });
    }
});

// Get messages for a conversation (with pagination)
app.get('/api/conversations/:conversationId/messages', userAuth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;

        const messages = await getMessages(parseInt(conversationId), offset, limit);
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des messages' });
    }
});

// Mark all remaining async handlers as any for type compatibility
// Send a message
app.post('/api/messages', userAuth, async (req: any, res: any) => {
    try {
        const userId = req.userId;
        const { conversationId, receiverId, content } = req.body;

        if (!conversationId || !receiverId || !content) {
            return res.status(400).json({ success: false, message: 'Champs manquants' });
        }

        const message = await sendMessage(
            parseInt(conversationId),
            userId,
            parseInt(receiverId),
            content
        );
        res.json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
    }
});

// Mark message as read
app.put('/api/messages/:messageId/read', userAuth, async (req, res) => {
    try {
        const { messageId } = req.params;

        const success = await markMessageAsRead(parseInt(messageId));
        res.json({ success });
    } catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du marquage' });
    }
});

// Mark all messages in conversation as read
app.put('/api/conversations/:conversationId/read', userAuth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.userId;

        const success = await markConversationAsRead(parseInt(conversationId), userId);
        res.json({ success });
    } catch (error) {
        console.error('Mark conversation as read error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du marquage' });
    }
});

// Toggle message importance
app.put('/api/messages/:messageId/important', userAuth, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { isImportant } = req.body;

        const success = await toggleMessageImportant(parseInt(messageId), isImportant);
        res.json({ success });
    } catch (error) {
        console.error('Toggle importance error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
    }
});

// Delete a message
app.delete('/api/messages/:messageId', userAuth, async (req, res) => {
    try {
        const { messageId } = req.params;

        const success = await deleteMessage(parseInt(messageId));
        res.json({ success });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
});

// Delete a conversation
app.delete('/api/conversations/:conversationId', userAuth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.userId;

        const success = await deleteConversation(parseInt(conversationId), userId);
        res.json({ success });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
});

// Get unread message count
app.get('/api/messages/unread/count', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const count = await getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération' });
    }
});

// Get message subjects for a company
app.get('/api/message-subjects/:companyId', userAuth, async (req, res) => {
    try {
        const { companyId } = req.params;
        const subjects = await getMessageSubjects(parseInt(companyId));
        res.json(subjects);
    } catch (error) {
        console.error('Get message subjects error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des sujets' });
    }
});

// Create message subject (admin/company only)
app.post('/api/message-subjects', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { subjectName, subjectDescription, displayOrder } = req.body;

        // Check if user is a company
        const userResult = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
        if (userResult.rows[0]?.user_type !== 'company') {
            return res.status(403).json({ success: false, message: 'Seules les entreprises peuvent créer des sujets' });
        }

        const subject = await createMessageSubject(
            userId,
            subjectName,
            subjectDescription,
            displayOrder
        );
        res.json({ success: true, subject });
    } catch (error) {
        console.error('Create message subject error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création du sujet' });
    }
});

// Report a message
app.post('/api/messages/:messageId/report', userAuth, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userId;
        const { reason, reportType } = req.body;

        const report = await reportMessage(
            parseInt(messageId),
            userId,
            reason || '',
            reportType || 'report'
        );
        res.json({ success: true, report });
    } catch (error) {
        console.error('Report message error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du signalement' });
    }
});

// Check if conversation exists
app.get('/api/conversations/check/:recipientId', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { recipientId } = req.params;

        const exists = await hasConversation(userId, parseInt(recipientId));
        res.json({ exists });
    } catch (error) {
        console.error('Check conversation error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la vérification' });
    }
});

// Health check for microservice queues
app.get('/api/health/queues', async (req, res) => {
    try {
        const jobAnalysisCount = await jobAnalysisQueue.count();
        const postModerationCount = await postModerationQueue.count();
        const activityScoringCount = await activityScoringQueue.count();
        
        const jobAnalysisCompleted = await jobAnalysisQueue.getCompletedCount();
        const postModerationCompleted = await postModerationQueue.getCompletedCount();
        const activityScoringCompleted = await activityScoringQueue.getCompletedCount();
        
        res.json({
            status: 'healthy',
            queues: {
                jobAnalysis: { pending: jobAnalysisCount, completed: jobAnalysisCompleted },
                postModeration: { pending: postModerationCount, completed: postModerationCompleted },
                activityScoring: { pending: activityScoringCount, completed: activityScoringCompleted }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ status: 'unhealthy', error: String(error) });
    }
});

// ✅ DISABLED: Queue initialization commented out to allow server startup without microservices
// Uncomment when ready to enable queue workers
// initializeQueues().catch((err) => {
//     console.error('Failed to initialize microservice queues:', err);
//     process.exit(1);
// });

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    try {
        // ⚠️ DISABLED: Queue closure commented out (queues not initialized)
        // await jobAnalysisQueue.close();
        // await postModerationQueue.close();
        // await activityScoringQueue.close();
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

//# sourceMappingURL=server.js.map