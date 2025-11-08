-- Migration: Add shipping selection and order number to orders table
-- Adds fields for storing selected shipping option and auto-incrementing order number

-- Add order number field (auto-incrementing)
ALTER TABLE orders
ADD COLUMN order_number SERIAL;

-- Add selected shipping fields
ALTER TABLE orders
ADD COLUMN selected_shipping_carrier VARCHAR(50),
ADD COLUMN selected_shipping_price DECIMAL(10, 2);

-- Create index on order_number for faster lookups
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Backfill order_number for existing orders (based on creation order)
WITH numbered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM orders
)
UPDATE orders
SET order_number = (SELECT rn FROM numbered_orders WHERE numbered_orders.id = orders.id);

COMMENT ON COLUMN orders.order_number IS 'Auto-incrementing order number for display';
COMMENT ON COLUMN orders.selected_shipping_carrier IS 'Selected shipping carrier (e.g., DHL, Hermes)';
COMMENT ON COLUMN orders.selected_shipping_price IS 'Price of selected shipping option';
