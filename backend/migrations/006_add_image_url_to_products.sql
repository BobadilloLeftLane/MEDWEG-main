-- ============================================
-- Migration: Add image_url to products table
-- Dodavanje kolone za URL slike proizvoda
-- ============================================

-- Dodaj image_url kolonu
ALTER TABLE products
ADD COLUMN image_url VARCHAR(500);

-- Dodaj komentar
COMMENT ON COLUMN products.image_url IS 'URL or path to product image';

-- KRAJ
