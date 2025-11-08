-- Add weight and weight_unit columns to products
ALTER TABLE products
ADD COLUMN weight DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN weight_unit VARCHAR(10) DEFAULT 'kg';

-- Add check constraint for weight_unit
ALTER TABLE products
ADD CONSTRAINT check_weight_unit CHECK (weight_unit IN ('kg', 'g'));

COMMENT ON COLUMN products.weight IS 'Gewicht (Težina) des Produkts';
COMMENT ON COLUMN products.weight_unit IS 'Einheit: kg oder g';
