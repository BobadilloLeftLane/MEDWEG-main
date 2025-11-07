-- ============================================
-- Migration: Fix workers table structure
-- Dodavanje nedostajućih kolona
-- ============================================

-- 1. Dodaj institution_id kolonu (vezana za instituciju)
ALTER TABLE workers
ADD COLUMN institution_id UUID REFERENCES institutions(id);

-- 2. Dodaj updated_at kolonu (timestamp za poslednju izmenu)
ALTER TABLE workers
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Napravi patient_id NULLABLE (trenutno je NOT NULL)
--    Jer worker može biti vezan za instituciju ILI za pacijenta
ALTER TABLE workers
ALTER COLUMN patient_id DROP NOT NULL;

-- 4. Dodaj constraint da bar jedno mora biti postavljeno
--    (ili institution_id ili patient_id)
ALTER TABLE workers
ADD CONSTRAINT worker_must_have_institution_or_patient
CHECK (
  (institution_id IS NOT NULL AND patient_id IS NULL) OR
  (patient_id IS NOT NULL AND institution_id IS NULL)
);

-- 5. Kreiraj index za brže pretraživanje po institution_id
CREATE INDEX idx_workers_institution_id ON workers(institution_id);

-- 6. Dodaj trigger za automatsko update-ovanje updated_at
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

-- KRAJ
