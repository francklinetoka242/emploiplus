-- 004_add_services_catalogs.sql
-- Adds tables for service catalogs and services

CREATE TABLE IF NOT EXISTS service_catalogs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_catalogs_display_order ON service_catalogs(display_order);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  catalog_id INTEGER NOT NULL REFERENCES service_catalogs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_promo BOOLEAN NOT NULL DEFAULT false,
  promo_text TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  brochure_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_catalog_id ON services(catalog_id);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_service_catalogs_updated_at
BEFORE UPDATE ON service_catalogs
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
