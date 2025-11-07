-- ============================================
-- Migration: Add min_order_quantity and image_url to products
-- Dodavanje kolona za minimalnu količinu i sliku proizvoda
-- ============================================

-- 1. Dodaj min_order_quantity kolonu (default 1)
ALTER TABLE products
ADD COLUMN min_order_quantity INTEGER DEFAULT 1 NOT NULL;

-- 2. Dodaj image_url kolonu (nullable - može biti NULL)
ALTER TABLE products
ADD COLUMN image_url VARCHAR(500);

-- 3. Dodaj komentare za dokumentaciju
COMMENT ON COLUMN products.min_order_quantity IS 'Minimum order quantity for this product';
COMMENT ON COLUMN products.image_url IS 'URL to product image (S3 or external)';

-- KRAJ
