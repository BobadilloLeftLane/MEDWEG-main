-- =====================================================
-- MEDWEG Test Data Seeding Script
-- Čisti bazu i ubacuje test podatke
-- =====================================================

-- 1. CLEANUP - Briši sve postojeće podatke (u obrnutom redosledu zbog foreign keys)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE patients;
TRUNCATE TABLE workers;
TRUNCATE TABLE institutions;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 2. INSERT ADMIN APLIKACIJE
-- =====================================================
-- Email: admin@gmail.com
-- Password: Admin123!
-- Hash for 'Admin123!': $2b$10$YourHashHere (needs to be generated)

INSERT INTO institutions (
  id,
  name,
  email,
  password_hash,
  role,
  address_street,
  address_plz,
  address_city,
  phone,
  created_at,
  updated_at
) VALUES (
  UUID(),
  'MEDWEG Administration',
  'admin@gmail.com',
  '$2b$10$TKqXZ0mXqC7rGqNhF8.zHOXxJ5dPQZJ5nQJ7jKqXZ0mXqC7rGqNhF',  -- Password: Admin123!
  'ADMIN',
  -- Encrypted address (will be actual encryption in practice)
  'U2FsdGVkX1+ABC123',  -- Placeholder for encrypted "Hauptstraße 1"
  '10115',
  'Berlin',
  '+49 30 12345678',
  NOW(),
  NOW()
);

-- =====================================================
-- 3. INSERT 3 PFLEGEDIENST ADMINA
-- =====================================================

-- Pflegedienst 1: Pflege Berlin Mitte
INSERT INTO institutions (
  id,
  name,
  email,
  password_hash,
  role,
  address_street,
  address_plz,
  address_city,
  phone,
  created_at,
  updated_at
) VALUES (
  UUID(),
  'Pflege Berlin Mitte',
  'pflege.mitte@gmail.com',
  '$2b$10$TKqXZ0mXqC7rGqNhF8.zHOXxJ5dPQZJ5nQJ7jKqXZ0mXqC7rGqNhF',  -- Password: Admin123!
  'PFLEGEDIENST',
  'U2FsdGVkX1+DEF456',  -- Placeholder for encrypted "Friedrichstraße 23"
  '10969',
  'Berlin',
  '+49 30 98765432',
  NOW(),
  NOW()
);

-- Pflegedienst 2: Pflege München Süd
INSERT INTO institutions (
  id,
  name,
  email,
  password_hash,
  role,
  address_street,
  address_plz,
  address_city,
  phone,
  created_at,
  updated_at
) VALUES (
  UUID(),
  'Pflege München Süd',
  'pflege.muenchen@gmail.com',
  '$2b$10$TKqXZ0mXqC7rGqNhF8.zHOXxJ5dPQZJ5nQJ7jKqXZ0mXqC7rGqNhF',  -- Password: Admin123!
  'PFLEGEDIENST',
  'U2FsdGVkX1+GHI789',  -- Placeholder for encrypted "Lindwurmstraße 45"
  '80337',
  'München',
  '+49 89 12345678',
  NOW(),
  NOW()
);

-- Pflegedienst 3: Pflege Hamburg Nord
INSERT INTO institutions (
  id,
  name,
  email,
  password_hash,
  role,
  address_street,
  address_plz,
  address_city,
  phone,
  created_at,
  updated_at
) VALUES (
  UUID(),
  'Pflege Hamburg Nord',
  'pflege.hamburg@gmail.com',
  '$2b$10$TKqXZ0mXqC7rGqNhF8.zHOXxJ5dPQZJ5nQJ7jKqXZ0mXqC7rGqNhF',  -- Password: Admin123!
  'PFLEGEDIENST',
  'U2FsdGVkX1+JKL012',  -- Placeholder for encrypted "Eppendorfer Weg 78"
  '20259',
  'Hamburg',
  '+49 40 87654321',
  NOW(),
  NOW()
);

-- =====================================================
-- NAPOMENA:
-- Password hash '$2b$10$TKqXZ0mXqC7rGqNhF8.zHOXxJ5dPQZJ5nQJ7jKqXZ0mXqC7rGqNhF'
-- je placeholder. Potrebno je generisati pravi bcrypt hash za 'Admin123!'
-- Takođe, address_street trebaju biti pravilno enkriptovani.
-- =====================================================

SELECT 'Seeding completed successfully!' as message;
SELECT COUNT(*) as total_institutions FROM institutions;
