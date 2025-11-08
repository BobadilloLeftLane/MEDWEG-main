/**
 * Migration 002: Add Stock Management to Products
 *
 * Dodaje kolone za warehouse/lager management:
 * - stock_quantity: Trenutna količina na lageru (Zustand)
 * - low_stock_threshold: Minimum limit za alert
 * - low_stock_alert_acknowledged: Da li je admin video upozorenje
 */

-- Add stock management columns to products table
ALTER TABLE products
ADD COLUMN stock_quantity INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN low_stock_threshold INTEGER DEFAULT 20,
ADD COLUMN low_stock_alert_acknowledged BOOLEAN DEFAULT TRUE;

-- Create index for low stock queries (brže pretraživanje)
CREATE INDEX idx_products_low_stock ON products(stock_quantity, low_stock_threshold)
WHERE stock_quantity < low_stock_threshold;

-- Add comment to explain columns
COMMENT ON COLUMN products.stock_quantity IS 'Trenutna količina na lageru (Zustand)';
COMMENT ON COLUMN products.low_stock_threshold IS 'Minimum limit - alert ako stock < threshold';
COMMENT ON COLUMN products.low_stock_alert_acknowledged IS 'Da li je admin čekirao low stock upozorenje';
