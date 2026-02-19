/**
 * Application Constants & Configuration
 * Centralized environment-based configuration for VPS production
 */

// API Server Configuration
export const API_PORT = parseInt(process.env.PORT || '5000', 10);
export const API_HOST = process.env.HOST || '0.0.0.0';

// Frontend & CORS Configuration
export const FRONTEND_URL = process.env.FRONTEND_URL || 'https://emploiplus-group.com';
export const CORS_ORIGIN = process.env.CORS_ORIGINS || 'https://emploiplus-group.com,http://localhost:5173,http://localhost:5174';

// Database Configuration
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'emploi_plus_db_cg',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

// Email Configuration (SMTP)
export const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'mail.emploiplus-group.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.SMTP_FROM || 'noreply@emploiplus-group.com',
};

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production_minimum_32_chars';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Rate Limiting Configuration
export const RATE_LIMIT = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
};

// Application Mode
export const APP_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_DEVELOPMENT = APP_ENV === 'development';

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug');