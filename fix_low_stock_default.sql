-- Fix: Change default value for low_stock_alert_acknowledged to FALSE
ALTER TABLE products 
ALTER COLUMN low_stock_alert_acknowledged SET DEFAULT FALSE;

-- Update existing products to have FALSE if they have low stock
UPDATE products
SET low_stock_alert_acknowledged = FALSE
WHERE stock_quantity < low_stock_threshold
  AND is_available = true;

-- Verify
SELECT id, name_de, stock_quantity, low_stock_threshold, low_stock_alert_acknowledged
FROM products
WHERE stock_quantity < low_stock_threshold
ORDER BY name_de;
