-- Fix Product Images Based on Type
-- This script updates all product image URLs to match their type

-- Update gloves products
UPDATE products
SET image_url = '/images/products/ppe-gloves@2x.png'
WHERE type = 'gloves';

-- Update disinfectant liquid products
UPDATE products
SET image_url = '/images/products/ppe-sanitizer@2x.png'
WHERE type = 'disinfectant_liquid';

-- Update disinfectant wipes products
UPDATE products
SET image_url = '/images/products/disinfecting-wipes@2x.png'
WHERE type = 'disinfectant_wipes';

-- Show results
SELECT
  id,
  name_de,
  type,
  image_url
FROM products
ORDER BY type, name_de;
