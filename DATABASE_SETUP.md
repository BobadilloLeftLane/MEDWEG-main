# Database Setup - MEDWEG

## 📋 Pregled

Ova dokumentacija opisuje kompletnu strukturu PostgreSQL baze podataka za MEDWEG aplikaciju - B2B sistem za prodaju medicinskog materijala.

**Verzija baze**: 1.0.0
**PostgreSQL verzija**: 14+
**Datum kreiranja**: 2025-01-07

---

## 🗄️ Struktura Baze Podataka

### Tabele (10)

| # | Tabela | Opis | Broj Kolona |
|---|--------|------|-------------|
| 1 | `institutions` | Ustanove (Pflegeheime, Pflegedienste) | 9 |
| 2 | `users` | Korisnici (Admin App & Admin Institution) | 13 |
| 3 | `patients` | Pacijenti (enkriptovani podaci) | 8 |
| 4 | `workers` | Radnici - login za pacijente | 7 |
| 5 | `products` | Proizvodi (rukavice, dezinfekcija) | 10 |
| 6 | `orders` | Narudžbine/Bestellungen | 14 |
| 7 | `order_items` | Stavke narudžbine | 7 |
| 8 | `invoices` | Fakture/Rechnungen | 9 |
| 9 | `push_subscriptions` | PWA push notifikacije | 7 |
| 10 | `audit_logs` | Audit log za GDPR compliance | 9 |

---

## 🔧 Instalacija i Setup

### Preduslov

- PostgreSQL 14 ili noviji instaliran
- pgAdmin 4 (ili drugi PostgreSQL klijent)
- Osnovno znanje SQL-a

### Korak 1: Kreiranje baze

```sql
-- U pgAdmin ili psql
CREATE DATABASE "MEDWEG"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'German_Germany.1252'
    LC_CTYPE = 'German_Germany.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### Korak 2: Instalacija ekstenzija

```sql
-- Konektuj se na MEDWEG bazu
\c MEDWEG

-- Instaliraj potrebne ekstenzije
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- Za UUID generisanje
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Za enkripciju podataka
```

**Provera**:
```sql
SELECT * FROM pg_extension;
```

Trebalo bi da vidiš: `uuid-ossp` i `pgcrypto`

### Korak 3: Kreiranje ENUM tipova

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
  'admin_application',      -- Super admin (vlasnik aplikacije)
  'admin_institution',      -- Admin ustanove
  'worker'                  -- Radnik/Mitarbeiter
);

-- Order status
CREATE TYPE order_status AS ENUM (
  'scheduled',    -- Zakazana (za automatske narudžbine)
  'new',          -- Nova (čeka odobrenje od admin app)
  'approved',     -- Odobrena (čeka slanje)
  'shipped'       -- Poslata (generisana faktura)
);

-- Product types
CREATE TYPE product_type AS ENUM (
  'gloves',                    -- Rukavice
  'disinfectant_liquid',       -- Dezinfekciona tečnost
  'disinfectant_wipes'         -- Dezinfekcione maramice
);

-- Glove sizes
CREATE TYPE glove_size AS ENUM (
  'S', 'M', 'L', 'XL'
);
```

### Korak 4: Kreiranje tabela

Izvršite kompletan SQL kod iz fajla `database_schema.sql` (vidi dole).

---

## 📊 Detaljne Specifikacije Tabela

### 1. INSTITUTIONS (Ustanove)

Čuva informacije o ustanovama (Pflegeheime, Pflegedienste, Ambulanzen).

```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(255) NOT NULL,

  -- Address (ENCRYPTED)
  address_street BYTEA NOT NULL,        -- Enkriptovano (pgcrypto)
  address_plz VARCHAR(5) NOT NULL,      -- NE enkriptovano (potrebno za query)
  address_city VARCHAR(100) NOT NULL,   -- NE enkriptovano

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,    -- Email verifikovan?
  is_active BOOLEAN DEFAULT TRUE,       -- Aktivan nalog?

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Enkriptovana polja**:
- `address_street` - Ulica + broj (BYTEA tip)

**Indexi**:
- `idx_institutions_plz` - Brže pretrage po PLZ
- `idx_institutions_active` - Filter aktivnih

**Napomena**: `address_street` je enkriptovan zbog GDPR zahteva.

---

### 2. USERS (Korisnici)

Korisnici aplikacije - Admin Aplikacije i Admin Ustanove.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,      -- bcrypt hash

  -- Role
  role user_role NOT NULL,

  -- Relation to institution (NULL za admin_application)
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,

  -- Email verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),             -- 6-cifreni kod
  verification_code_expires_at TIMESTAMP,   -- Ističe posle 5 min

  -- Password reset
  reset_token VARCHAR(255),
  reset_token_expires_at TIMESTAMP,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

**Važna polja**:
- `password_hash` - bcrypt (10-12 salt rounds)
- `verification_code` - 6 cifara, važi 5 minuta
- `role` - `admin_application`, `admin_institution`, ili `worker`

**Constrains**:
- Email mora biti UNIQUE
- `institution_id` je NULL samo za `admin_application`

**Indexi**:
- `idx_users_email` - Login po email-u
- `idx_users_role` - Filter po ulozi
- `idx_users_institution` - Svi useri ustanove

---

### 3. PATIENTS (Pacijenti)

Pacijenti ustanove - **ENKRIPTOVANI PODACI** zbog GDPR.

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Institution relation
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,

  -- Patient info (ENCRYPTED)
  first_name BYTEA NOT NULL,      -- ENKRIPTOVANO
  last_name BYTEA NOT NULL,       -- ENKRIPTOVANO
  address BYTEA NOT NULL,         -- ENKRIPTOVANO (puna adresa)

  -- Unique code for worker access
  unique_code VARCHAR(50) UNIQUE NOT NULL,    -- Npr. "MARIA2024XYZ"

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**ENKRIPTOVANA POLJA** (BYTEA tip):
- `first_name` - Ime pacijenta
- `last_name` - Prezime pacijenta
- `address` - Puna adresa (ulica, PLZ, grad)

**Važno**:
- `unique_code` - Jedinstveni kod koji Admin Institution deli sa radnicima
- Više radnika može koristiti isti kod za pristup jednom pacijentu

**Enkripcija/Dekripcija**:
```sql
-- Enkripcija
INSERT INTO patients (first_name, institution_id, ...)
VALUES (pgp_sym_encrypt('Maria', 'your-secret-key'), ...);

-- Dekripcija
SELECT
  id,
  pgp_sym_decrypt(first_name, 'your-secret-key') AS first_name
FROM patients;
```

**Indexi**:
- `idx_patients_institution` - Pacijenti po ustanovi
- `idx_patients_unique_code` - Brzi lookup za worker login
- `idx_patients_active` - Aktivni pacijenti

---

### 4. WORKERS (Radnici)

Login credentials za radnike - pristup specifičnom pacijentu.

```sql
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Patient relation
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Authentication
  username VARCHAR(50) UNIQUE NOT NULL,     -- Npr. "Milam12"
  password_hash VARCHAR(255) NOT NULL,      -- bcrypt

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

**Workflow**:
1. Admin Institution kreira pacijenta (Maria Müller)
2. Admin Institution generiše worker login:
   - Username: `Milam12` (auto-generisan)
   - Password: `nu38d83hw` (random)
3. Admin Institution deli credentials sa radnicima
4. Više radnika može koristiti isti username/password za tog pacijenta

**Deaktivacija**: Kada se pacijent deaktivira → svi worker login-i se deaktiviraju.

**Indexi**:
- `idx_workers_patient` - Worker login za pacijenta
- `idx_workers_username` - Login lookup

---

### 5. PRODUCTS (Proizvodi)

Katalog proizvoda.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Product info (na nemačkom)
  name_de VARCHAR(255) NOT NULL,              -- "Nitril-Handschuhe Größe M"
  description_de TEXT,

  -- Type & specifications
  type product_type NOT NULL,                 -- 'gloves', 'disinfectant_liquid', ...
  size glove_size,                            -- Samo za rukavice: S/M/L/XL

  -- Packaging
  quantity_per_box INTEGER NOT NULL,          -- 50 komada po kutiji
  unit VARCHAR(50) NOT NULL,                  -- "Karton", "Flasche", "Packung"

  -- Pricing (EUR - bez MwSt, Kleinunternehmer)
  price_per_unit DECIMAL(10, 2) NOT NULL,

  -- Availability
  is_available BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Trenutni proizvodi** (seed data):
1. Nitril-Handschuhe S (15,99 €/Karton)
2. Nitril-Handschuhe M (15,99 €/Karton)
3. Nitril-Handschuhe L (15,99 €/Karton)
4. Nitril-Handschuhe XL (15,99 €/Karton)
5. Desinfektionsmittel 500ml (8,50 €/Flasche)
6. Desinfektionstücher 100 Stück (6,99 €/Packung)

**Napomena**: Cene su **bez MwSt** (Kleinunternehmerregelung §19 UStG).

**Indexi**:
- `idx_products_type` - Filter po tipu
- `idx_products_available` - Samo dostupni proizvodi

---

### 6. ORDERS (Narudžbine)

Glavna tabela za narudžbine.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,      -- Admin Institution
  created_by_worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,  -- Worker

  -- Status
  status order_status NOT NULL DEFAULT 'new',

  -- Scheduling (za automatske narudžbine)
  is_recurring BOOLEAN DEFAULT FALSE,         -- Ponavlja se svaki mesec?
  scheduled_date DATE,                        -- Datum automatske narudžbine
  is_confirmed BOOLEAN DEFAULT FALSE,         -- Da li je Admin Institution potvrdio?

  -- Approval
  approved_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,

  -- Shipping
  shipped_at TIMESTAMP,

  -- Total amount (calculated from order_items)
  total_amount DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Status Flow**:
```
scheduled → new → approved → shipped
    ↑         ↑        ↑         ↑
 Zakazana  Čeka   Odobrena  Poslata
          odobrenje          (faktura)
```

**Tipovi narudžbina**:
1. **Obična** - `is_recurring = FALSE`, `scheduled_date = NULL`
2. **Automatska** - `is_recurring = TRUE/FALSE`, `scheduled_date = '2025-06-15'`

**Workflow automatske narudžbine**:
1. Admin Institution kreira scheduled order za 15.06.2025
2. 10 dana pre (05.06.2025) → Reminder email
3. Na dan (15.06.2025, 09:00h) → Status: `scheduled` → `new`
4. Admin Application odobrava → Status: `new` → `approved`
5. Admin Application šalje → Status: `approved` → `shipped` + generisanje fakture

**Indexi**:
- `idx_orders_institution`
- `idx_orders_patient`
- `idx_orders_status`
- `idx_orders_scheduled_date` - Za cron job
- `idx_orders_created_at` - Sortiranje po datumu

---

### 7. ORDER_ITEMS (Stavke narudžbine)

Proizvodi unutar narudžbine.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- Quantity & price at time of order
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10, 2) NOT NULL,    -- Cena u momentu narudžbine
  subtotal DECIMAL(10, 2) NOT NULL,          -- quantity * price_per_unit

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Važno**: `price_per_unit` se čuva u momentu narudžbine (istorija cena).

**Primer**:
```sql
-- Narudžbina: 2x Rukavice M + 1x Dezinfekciona tečnost
INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, subtotal)
VALUES
  ('order-uuid', 'product-uuid-1', 2, 15.99, 31.98),
  ('order-uuid', 'product-uuid-2', 1, 8.50, 8.50);

-- Total: 40.48 EUR
```

**Indexi**:
- `idx_order_items_order` - Sve stavke narudžbine
- `idx_order_items_product` - Statistika po proizvodu

---

### 8. INVOICES (Fakture)

Automatski generisane PDF fakture.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Invoice details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,   -- "2025-001", "2025-002", ...
  invoice_year INTEGER NOT NULL,                -- 2025

  -- Amounts (bez MwSt - Kleinunternehmer)
  total_amount DECIMAL(10, 2) NOT NULL,

  -- PDF storage (S3 path)
  pdf_s3_key VARCHAR(500),                      -- "invoices/2025/2025-001.pdf"

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE
);
```

**Invoice numbering**:
- Format: `YYYY-NNN` (npr. `2025-001`, `2025-002`)
- Auto-increment po godini
- Unique constraint

**Workflow**:
1. Admin Application označava order kao "Versendet" (shipped)
2. Trigger automatski generiše fakturu
3. PDF se kreira (node.js + pdfkit)
4. PDF se uploaduje na AWS S3
5. `pdf_s3_key` se čuva u bazi
6. Admin Institution može downloadovati PDF

**Pflichtangaben (§14 UStG)**:
- Ime i adresa isporučioca (tvoja firma)
- Ime i adresa kupca (Admin Institution)
- Steuernummer
- Rechnungsnummer (invoice_number)
- Datum (invoice_date)
- Proizvodi + količine + cene
- **Kleinunternehmer klauzula**: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet"

**Indexi**:
- `idx_invoices_order`
- `idx_invoices_institution`
- `idx_invoices_patient`
- `idx_invoices_number` - Unique lookup
- `idx_invoices_year` - Filter po godini

---

### 9. PUSH_SUBSCRIPTIONS (PWA Notifikacije)

Push subscription data za PWA notifikacije.

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User relation
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Push subscription data (JSON from browser)
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Kada se koristi**:
- Nova narudžbina → Push Admin Application
- Narudžbina odobrena → Push Admin Institution
- Reminder 10 dana pre → Push Admin Institution

**Indexi**:
- `idx_push_subscriptions_user`

---

### 10. AUDIT_LOGS (GDPR Compliance)

Audit trail - ko je šta radio sa podacima.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,

  -- What
  action VARCHAR(100) NOT NULL,           -- 'VIEW_PATIENT', 'CREATE_ORDER', ...
  table_name VARCHAR(50) NOT NULL,        -- 'patients', 'orders', ...
  record_id UUID,                         -- ID zapisa

  -- When & Where
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Additional data
  details JSONB,                          -- Dodatni kontekst

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Primeri akcija**:
- `VIEW_PATIENT` - Admin Institution/Worker je video pacijenta
- `CREATE_ORDER` - Kreirana narudžbina
- `APPROVE_ORDER` - Admin Application odobrio narudžbinu
- `DECRYPT_DATA` - Dekriptovani osetljivi podaci
- `GENERATE_INVOICE` - Generisana faktura
- `DOWNLOAD_INVOICE` - Download fakture

**GDPR zahtev**: Audit log mora postojati za sve pristupe ličnim podacima.

**Indexi**:
- `idx_audit_logs_user`
- `idx_audit_logs_worker`
- `idx_audit_logs_created_at` - Sortiranje po vremenu
- `idx_audit_logs_action` - Filter po akciji

---

## 🔐 Enkripcija Podataka

### Koje podatke enkriptujemo?

**Obavezno enkriptovani (GDPR Artikel 9)**:
1. `institutions.address_street` - Ulica + broj ustanove
2. `patients.first_name` - Ime pacijenta
3. `patients.last_name` - Prezime pacijenta
4. `patients.address` - Puna adresa pacijenta

**NIJE enkriptovano** (potrebno za query):
- `institutions.address_plz` - PLZ (za validaciju)
- `institutions.address_city` - Grad
- `patients.unique_code` - Kod za pristup
- `users.email` - Email (potreban za login)

### Kako funkcioniše enkripcija?

Koristimo **pgcrypto** ekstenziju PostgreSQL-a.

**Funkcije**:
```sql
-- Enkripcija
pgp_sym_encrypt(data::TEXT, key::TEXT) → BYTEA

-- Dekripcija
pgp_sym_decrypt(data::BYTEA, key::TEXT) → TEXT
```

**Primer**:
```sql
-- Kreiranje pacijenta sa enkriptovanim podacima
INSERT INTO patients (
  institution_id,
  first_name,
  last_name,
  address,
  unique_code
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  pgp_sym_encrypt('Maria', 'my-secret-encryption-key'),
  pgp_sym_encrypt('Müller', 'my-secret-encryption-key'),
  pgp_sym_encrypt('Musterstraße 12, 10115 Berlin', 'my-secret-encryption-key'),
  'MARIA2024XYZ'
);

-- Čitanje (dekriptovanje)
SELECT
  id,
  pgp_sym_decrypt(first_name, 'my-secret-encryption-key') AS first_name,
  pgp_sym_decrypt(last_name, 'my-secret-encryption-key') AS last_name,
  pgp_sym_decrypt(address, 'my-secret-encryption-key') AS address,
  unique_code
FROM patients
WHERE institution_id = '123e4567-e89b-12d3-a456-426614174000';
```

### Helper funkcije

Kreirane su helper funkcije za lakšu upotrebu:

```sql
-- Enkripcija
SELECT encrypt_text('Maria', 'my-key');

-- Dekripcija
SELECT decrypt_text(encrypted_data, 'my-key');
```

### ⚠️ VAŽNO - Čuvanje Encryption Key-a

**NIKADA** ne hardkoduj encryption key u kodu!

**Preporučeno**:
1. **AWS Secrets Manager** - Čuvaj key u AWS-u
2. **Environment Variable** - `.env` fajl (NIKAD ne commituj!)
3. **Key Rotation** - Menjaj key periodično (npr. svake godine)

**Primer (.env)**:
```env
DB_ENCRYPTION_KEY=your-super-secret-key-here-min-32-chars
```

---

## 🔄 Trigeri i Automatizacije

### Auto-update `updated_at`

Svi relevi tabele imaju `updated_at` kolonu koja se automatski ažurira.

**Trigger funkcija**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Primenjeno na**:
- `institutions`
- `users`
- `patients`
- `products`
- `orders`

**Test**:
```sql
-- Update proizvoda
UPDATE products SET price_per_unit = 16.99 WHERE id = 'some-uuid';

-- Provera
SELECT updated_at FROM products WHERE id = 'some-uuid';
-- Trebalo bi da vidiš trenutno vreme
```

---

## 📈 Indeksi i Performanse

### Krerani indeksi (ukupno 27)

**Institutions** (3):
- `idx_institutions_plz` - Pretraga po PLZ
- `idx_institutions_active` - Aktivne ustanove

**Users** (3):
- `idx_users_email` - Login lookup
- `idx_users_role` - Filter po ulozi
- `idx_users_institution` - Useri po ustanovi

**Patients** (3):
- `idx_patients_institution` - Pacijenti ustanove
- `idx_patients_unique_code` - Worker login
- `idx_patients_active` - Aktivni pacijenti

**Workers** (2):
- `idx_workers_patient` - Worker za pacijenta
- `idx_workers_username` - Login

**Products** (2):
- `idx_products_type` - Filter po tipu
- `idx_products_available` - Dostupni proizvodi

**Orders** (5):
- `idx_orders_institution`
- `idx_orders_patient`
- `idx_orders_status` - VAŽAN za filter "new" orders
- `idx_orders_scheduled_date` - Za cron job
- `idx_orders_created_at` - Sortiranje

**Order Items** (2):
- `idx_order_items_order`
- `idx_order_items_product`

**Invoices** (5):
- `idx_invoices_order`
- `idx_invoices_institution`
- `idx_invoices_patient`
- `idx_invoices_number`
- `idx_invoices_year`

**Push Subscriptions** (1):
- `idx_push_subscriptions_user`

**Audit Logs** (4):
- `idx_audit_logs_user`
- `idx_audit_logs_worker`
- `idx_audit_logs_created_at`
- `idx_audit_logs_action`

### Query optimizacije

**Primer 1: Sve nove narudžbine za Admin App**
```sql
-- BEZ indexa: SLOW (Table Scan)
SELECT * FROM orders WHERE status = 'new';

-- SA indexom: FAST (Index Scan)
-- idx_orders_status omogućava brzi lookup
```

**Primer 2: Pacijenti ustanove**
```sql
-- FAST (Index Scan)
SELECT * FROM patients
WHERE institution_id = 'uuid'
AND is_active = TRUE;

-- Koristi: idx_patients_institution + idx_patients_active
```

**Provera Query plana**:
```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE status = 'new';
```

---

## 🧪 Test Podaci (Seed Data)

### Trenutno u bazi

#### Admin User
```sql
Email: admin@medweg.de
Password: changeme123 (PROMENITI!)
Role: admin_application
```

⚠️ **OBAVEZNO promeniti lozinku odmah!**

#### Proizvodi (6)
1. Nitril-Handschuhe Größe S - 15,99 €
2. Nitril-Handschuhe Größe M - 15,99 €
3. Nitril-Handschuhe Größe L - 15,99 €
4. Nitril-Handschuhe Größe XL - 15,99 €
5. Desinfektionsmittel 500ml - 8,50 €
6. Desinfektionstücher 100 Stück - 6,99 €

### Dodavanje test podataka

**Test Admin Institution**:
```sql
-- 1. Kreiranje ustanove
INSERT INTO institutions (name, address_street, address_plz, address_city, is_verified, is_active)
VALUES (
  'Test Pflegeheim Sonnenschein',
  pgp_sym_encrypt('Musterstraße 42', 'your-encryption-key'),
  '10115',
  'Berlin',
  TRUE,
  TRUE
) RETURNING id;  -- Snimi ovaj ID!

-- 2. Kreiranje Admin Institution usera
INSERT INTO users (
  email,
  password_hash,
  role,
  institution_id,
  is_verified,
  is_active
) VALUES (
  'admin@sonnenschein.de',
  -- Password: Test1234! (bcrypt hash)
  '$2b$12$K8p5M3E1oP2qA7xN9fC.KePmX5g7lR8vB3wQ2sY6tZ1uV4jN8kL9m',
  'admin_institution',
  'uuid-from-step-1',  -- ID iz prethodnog query-ja
  TRUE,
  TRUE
);
```

**Test Pacijent**:
```sql
INSERT INTO patients (
  institution_id,
  first_name,
  last_name,
  address,
  unique_code,
  is_active
) VALUES (
  'uuid-from-step-1',  -- ID ustanove
  pgp_sym_encrypt('Maria', 'your-encryption-key'),
  pgp_sym_encrypt('Müller', 'your-encryption-key'),
  pgp_sym_encrypt('Teststraße 5, 10115 Berlin', 'your-encryption-key'),
  'MARIA2024TEST',
  TRUE
) RETURNING id;  -- Snimi ovaj ID!
```

**Test Worker Login**:
```sql
INSERT INTO workers (
  patient_id,
  username,
  password_hash,
  is_active
) VALUES (
  'uuid-from-previous',  -- ID pacijenta
  'mariam24',
  '$2b$12$K8p5M3E1oP2qA7xN9fC.KePmX5g7lR8vB3wQ2sY6tZ1uV4jN8kL9m',  -- Test1234!
  TRUE
);
```

**Test Narudžbina**:
```sql
-- 1. Kreiranje narudžbine
INSERT INTO orders (
  institution_id,
  patient_id,
  created_by_user_id,
  status,
  total_amount
) VALUES (
  'institution-uuid',
  'patient-uuid',
  'user-uuid',
  'new',
  40.48
) RETURNING id;

-- 2. Dodavanje stavki
INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, subtotal)
VALUES
  ('order-uuid', 'product-uuid-handschuhe-m', 2, 15.99, 31.98),
  ('order-uuid', 'product-uuid-desinfektion', 1, 8.50, 8.50);
```

---

## 🔍 Korisni Query-ji

### Pregled svih tabela
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Pregled svih ENUM tipova
```sql
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'order_status', 'product_type', 'glove_size')
ORDER BY t.typname, e.enumsortorder;
```

### Pregled svih indexa
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Statistika po tabelama
```sql
SELECT
  schemaname,
  relname AS table_name,
  n_tup_ins AS inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins DESC;
```

### Sve narudžbine sa proizvodima (JOIN)
```sql
SELECT
  o.id AS order_id,
  o.status,
  i.name AS institution_name,
  pgp_sym_decrypt(p.first_name, 'key') || ' ' || pgp_sym_decrypt(p.last_name, 'key') AS patient_name,
  pr.name_de AS product_name,
  oi.quantity,
  oi.subtotal,
  o.total_amount,
  o.created_at
FROM orders o
JOIN institutions i ON o.institution_id = i.id
JOIN patients p ON o.patient_id = p.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products pr ON oi.product_id = pr.id
ORDER BY o.created_at DESC;
```

### Top 5 proizvoda (po narudžbinama)
```sql
SELECT
  p.name_de,
  p.type,
  COUNT(oi.id) AS times_ordered,
  SUM(oi.quantity) AS total_quantity
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name_de, p.type
ORDER BY times_ordered DESC
LIMIT 5;
```

### Statistika po ustanovama
```sql
SELECT
  i.name AS institution,
  COUNT(DISTINCT p.id) AS patient_count,
  COUNT(DISTINCT o.id) AS order_count,
  COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM institutions i
LEFT JOIN patients p ON i.id = p.institution_id AND p.is_active = TRUE
LEFT JOIN orders o ON i.id = o.institution_id AND o.status = 'shipped'
GROUP BY i.id, i.name
ORDER BY total_revenue DESC;
```

---

## 🛡️ Backup & Restore

### Backup cele baze

**pgAdmin**:
1. Desni klik na `MEDWEG` bazu
2. Backup...
3. Format: `Custom` ili `Directory`
4. Include: `Data`, `Schema`, `Owner`
5. Save

**Command line** (pg_dump):
```bash
pg_dump -h localhost -U postgres -F c -b -v -f "medweg_backup_2025-01-07.backup" MEDWEG
```

**Parametri**:
- `-F c` - Custom format (kompresovan)
- `-b` - Include blobs (BYTEA)
- `-v` - Verbose output

### Restore baze

```bash
pg_restore -h localhost -U postgres -d MEDWEG -v "medweg_backup_2025-01-07.backup"
```

### Automatski backup (preporuka)

**Windows Task Scheduler**:
```batch
@echo off
set PGPASSWORD=your-password
set BACKUP_DIR=C:\Backups\MEDWEG
set DATE=%date:~-4%%date:~3,2%%date:~0,2%

"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -h localhost -U postgres -F c -b -f "%BACKUP_DIR%\medweg_%DATE%.backup" MEDWEG

echo Backup completed: %DATE%
```

Schedule: Svake nedelje u nedeljnu 02:00h

---

## 📊 Monitoring & Maintenance

### Provera performance-a

```sql
-- Slow queries (ako postoje)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Vacuum & Analyze (održavanje)

```sql
-- Vacuum (oslobađa prostor)
VACUUM ANALYZE;

-- Detaljni vacuum po tabeli
VACUUM FULL ANALYZE patients;
```

**Schedule**: Mesečno ili kad baza postane spora.

### Provera veličine baze

```sql
SELECT pg_size_pretty(pg_database_size('MEDWEG'));
```

### Provera dead rows

```sql
SELECT
  schemaname,
  relname,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;
```

Ako `dead_percentage` > 20% → Run VACUUM!

---

## 🚨 Troubleshooting

### Problem: "relation does not exist"
**Uzrok**: Tabela nije kreirana ili si na pogrešnoj bazi.
**Rešenje**:
```sql
-- Proveri trenutnu bazu
SELECT current_database();

-- Konektuj se na MEDWEG
\c MEDWEG
```

### Problem: "pgcrypto extension not found"
**Uzrok**: Ekstenzija nije instalirana.
**Rešenje**:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Problem: "permission denied"
**Uzrok**: User nema prava.
**Rešenje**:
```sql
-- Daj prava postgres useru
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### Problem: Enkripcija ne radi
**Uzrok**: Encryption key nije ispravan.
**Provera**:
```sql
-- Enkriptuj + odmah dekriptuj
SELECT pgp_sym_decrypt(
  pgp_sym_encrypt('test', 'my-key'),
  'my-key'
);
-- Trebalo bi da vrati: "test"
```

### Problem: Slow queries
**Dijagnoza**:
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'new';
```

**Rešenje**: Proveri da li index postoji:
```sql
SELECT * FROM pg_indexes WHERE tablename = 'orders';
```

---

## 📚 Dodatne Informacije

### GDPR Compliance Checklist

- ✅ Enkripcija osetljivih podataka (pgcrypto)
- ✅ Audit log (ko je pristupio podacima)
- ✅ Ograničen pristup (RBAC - role-based)
- ✅ Backup & Recovery strategija
- ✅ Data retention policy (1 godina)
- ⚠️ TODO: Implement "Right to be forgotten" (brisanje na zahtev)
- ⚠️ TODO: Export korisničkih podataka (GDPR request)

### Connection String Format

**Node.js (pg)**:
```
postgresql://username:password@localhost:5432/MEDWEG?ssl=false
```

**Production (AWS RDS)**:
```
postgresql://username:password@medweg.xxxx.eu-central-1.rds.amazonaws.com:5432/MEDWEG?ssl=true
```

### Environment Variables (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MEDWEG
DB_USER=postgres
DB_PASSWORD=your-password
DB_SSL=false

DB_ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
```

---

## 🔄 Verzionisanje Šeme

### Current Version: 1.0.0

**Changelog**:

**v1.0.0** (2025-01-07)
- ✅ Inicijalna šema (10 tabela)
- ✅ ENUM tipovi (4)
- ✅ Indexi (27)
- ✅ Trigeri (5 auto-update)
- ✅ Enkripcija (pgcrypto)
- ✅ Seed data (Admin user + 6 proizvoda)

**Planned v1.1.0**:
- TODO: Email log tabela (tracking sent emails)
- TODO: System settings tabela (app config)
- TODO: Notification preferences (user settings)

---

## 📞 Support

Za pitanja kontaktiraj:
- **Email**: admin@medweg.de
- **Dokumentacija**: `TECHNICAL_DOCUMENTATION.md`

---

**Poslednji update**: 2025-01-07
**Autor**: Claude Code
**Verzija dokumenta**: 1.0.0
