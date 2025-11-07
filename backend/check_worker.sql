-- Check if worker exists
SELECT id, username, is_active, institution_id, patient_id, created_at
FROM workers
WHERE username = 'VFilipovic';
