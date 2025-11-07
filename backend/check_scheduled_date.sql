-- Proveri da li kolona scheduled_date postoji u orders tabeli
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name = 'scheduled_date';

-- Proveri sve kolone u orders tabeli
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
