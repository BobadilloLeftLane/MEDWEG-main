-- =====================================================
-- Migration: Add patient_id to workers table
-- Date: 2025-01-07
-- Description: Links workers to patients for better tracking
-- =====================================================

-- Add patient_id column to workers table
ALTER TABLE workers
ADD COLUMN patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_workers_patient_id ON workers(patient_id);

-- Update existing workers (optional - if you have existing data)
-- This will need to be customized based on your existing worker-patient relationships
-- COMMENT: If workers already exist, you'll need to manually map them to patients

-- Add comment to column for documentation
COMMENT ON COLUMN workers.patient_id IS 'Reference to patient that this worker account is created for';

-- Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workers' AND column_name = 'patient_id';
