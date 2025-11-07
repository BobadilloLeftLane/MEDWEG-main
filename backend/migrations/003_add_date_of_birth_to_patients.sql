-- ============================================
-- Migration: Add date_of_birth to patients
-- Dodavanje enkriptovane kolone za datum rođenja
-- ============================================

-- Dodaj date_of_birth kolonu (enkriptovana kao BYTEA)
ALTER TABLE patients
ADD COLUMN date_of_birth BYTEA;

-- Komentar za kolonu
COMMENT ON COLUMN patients.date_of_birth IS 'Encrypted date of birth (GDPR compliant)';

-- KRAJ
