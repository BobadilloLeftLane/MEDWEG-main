-- Allow Negative Stock Quantities
-- Remove CHECK constraint that prevents negative stock

-- Drop the constraint if it exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_quantity_check;

-- Verify by showing current constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'products'::regclass
  AND conname LIKE '%stock%';
