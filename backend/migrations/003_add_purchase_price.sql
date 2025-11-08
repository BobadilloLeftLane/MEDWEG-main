-- Add purchase_price column to products
ALTER TABLE products
ADD COLUMN purchase_price DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing products with initial purchase price (can be adjusted later)
UPDATE products
SET purchase_price = price_per_unit * 0.6
WHERE purchase_price = 0.00;

COMMENT ON COLUMN products.purchase_price IS 'Einkaufspreis (Nabavna cena) pro Einheit';
