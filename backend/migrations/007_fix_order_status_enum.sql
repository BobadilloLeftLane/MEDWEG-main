-- ============================================
-- Migration: Fix order_status enum
-- Dodavanje order_status enum tipa sa svim potrebnim vrednostima
-- ============================================

-- 1. Proveri da li order_status enum postoji, ako ne - kreiraj ga
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
    END IF;
END
$$;

-- 2. Ako enum postoji ali nema sve vrednosti, dodaj ih
DO $$
BEGIN
    -- Dodaj 'pending' ako ne postoji
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'order_status' AND e.enumlabel = 'pending'
    ) THEN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending';
    END IF;

    -- Dodaj 'confirmed' ako ne postoji
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'order_status' AND e.enumlabel = 'confirmed'
    ) THEN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'confirmed';
    END IF;

    -- Dodaj 'shipped' ako ne postoji
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'order_status' AND e.enumlabel = 'shipped'
    ) THEN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped';
    END IF;

    -- Dodaj 'delivered' ako ne postoji
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'order_status' AND e.enumlabel = 'delivered'
    ) THEN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
    END IF;

    -- Dodaj 'cancelled' ako ne postoji
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'order_status' AND e.enumlabel = 'cancelled'
    ) THEN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';
    END IF;
END
$$;

-- 3. Ako kolona 'status' u 'orders' tabeli nije tipa order_status, promeni je
DO $$
BEGIN
    -- Proveri da li kolona postoji i koji je tip
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'status'
    ) THEN
        -- Ako je VARCHAR, konvertuj u enum
        EXECUTE 'ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::order_status';
    END IF;
END
$$;

-- KRAJ
SELECT 'Order status enum fixed successfully!' as message;
