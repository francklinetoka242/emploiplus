-- Add missing columns to faqs table
-- This migration adds columns needed for FAQ management

-- Add is_published column
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add order_index column for sorting FAQs
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Add category column for categorizing FAQs
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Général';

-- Add created_by column to track who created the FAQ
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS created_by INTEGER;

-- Add updated_by column to track who last updated the FAQ
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS updated_by INTEGER;

-- Add updated_at column to track when the FAQ was last updated
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
