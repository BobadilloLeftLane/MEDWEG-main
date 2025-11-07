-- ============================================
-- Migration: Add missing columns
-- Dodavanje samo kolona koje ZAISTA nedostaju
-- ============================================

-- 1. Dodaj updated_at u workers tabelu
ALTER TABLE workers
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Dodaj date_of_birth u patients tabelu (enkriptovana)
ALTER TABLE patients
ADD COLUMN date_of_birth BYTEA;

-- 3. Kreiraj trigger za automatsko ažuriranje updated_at u workers
CREATE OR REPLACE FUNCTION update_workers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workers_updated_at
BEFORE UPDATE ON workers
FOR EACH ROW
EXECUTE FUNCTION update_workers_updated_at();

-- 4. Dodaj komentar za kolone
COMMENT ON COLUMN workers.updated_at IS 'Timestamp of last update';
COMMENT ON COLUMN patients.date_of_birth IS 'Encrypted date of birth (GDPR compliant)';

-- KRAJ
