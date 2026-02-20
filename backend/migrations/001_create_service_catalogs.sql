-- SERVICE CATALOGS MODULE MIGRATION
-- Creates tables for service catalogs and services with complete structure

-- Drop existing tables if they exist (for reset)
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_catalogs CASCADE;

-- Service Catalogs Table
-- Stores the main catalog categories/groups
CREATE TABLE service_catalogs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Services Table
-- Individual services within a catalog
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    catalog_id INTEGER NOT NULL REFERENCES service_catalogs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    rating NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5),
    is_promo BOOLEAN DEFAULT false,
    promo_text VARCHAR(255),
    is_visible BOOLEAN DEFAULT true,
    image_url TEXT,
    brochure_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_services_catalog_id ON services(catalog_id);
CREATE INDEX idx_services_visible ON services(is_visible);
CREATE INDEX idx_catalogs_visible ON service_catalogs(is_visible);
CREATE INDEX idx_services_promo ON services(is_promo);

-- Add comments for documentation
COMMENT ON TABLE service_catalogs IS 'Service catalog categories/groups for admin management';
COMMENT ON TABLE services IS 'Individual services within catalogs with pricing, promotions, and ratings';
COMMENT ON COLUMN services.rating IS 'Service rating from 1 to 5 stars, set by admin';
COMMENT ON COLUMN services.is_promo IS 'Flag to indicate service is on promotion';
COMMENT ON COLUMN services.promo_text IS 'Promotional text displayed with service badge';
