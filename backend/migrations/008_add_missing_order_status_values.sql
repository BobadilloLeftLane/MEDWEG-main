-- ============================================
-- Migration: Add missing order_status enum values
-- Dodavanje nedostajućih vrednosti u order_status enum
-- ============================================

-- Dodaj 'pending' ako ne postoji
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending';

-- Dodaj 'confirmed' ako ne postoji
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Dodaj 'delivered' ako ne postoji
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';

-- Dodaj 'cancelled' ako ne postoji
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Proveri sve vrednosti
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
ORDER BY enumsortorder;

-- KRAJ
SELECT 'Missing order status values added successfully!' as message;
