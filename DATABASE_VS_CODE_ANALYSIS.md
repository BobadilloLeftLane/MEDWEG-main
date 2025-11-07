# ANALIZA: BAZA vs KOD - NESLAGANJA

**Datum:** 2025-11-07
**Projekat:** MEDWEG
**Inspektovano:** PostgreSQL baza `MEDWEG` + Backend TypeScript tipovi

---

## 🔴 KRITIČNA NESLAGANJA

### 1. **WORKERS TABELA - MAJOR MISMATCH**

#### BAZA (PostgreSQL):
```sql
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,              -- ✅ POSTOJI, NOT NULL
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
-- ❌ NEMA: institution_id
-- ❌ NEMA: updated_at
```

#### KOD (backend/src/types/index.ts):
```typescript
export interface Worker {
  id: string;
  institution_id: string;                // ❌ NE POSTOJI U BAZI!
  username: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;                      // ❌ NE POSTOJI U BAZI!
  last_login_at: Date | null;
}
```

#### PROBLEMI:
- ❌ **`institution_id`** - U kodu postoji, u bazi **NE POSTOJI**
- ❌ **`updated_at`** - U kodu postoji, u bazi **NE POSTOJI**
- ✅ **`patient_id`** - U bazi postoji (NOT NULL), u kodu **NE POSTOJI**

#### KONSEKVENCE:
- Svaki worker login će **FAILOVATI** jer kod očekuje `institution_id`
- Repository queries će pokušati SELECT `institution_id` koja ne postoji
- INSERT queries će failovati jer nedostaje `patient_id`

---

### 2. **WORKER BUSINESS LOGIC NESLAGANJE**

**Baza kaže:**
Worker je vezan za **PACIJENTA** (`patient_id NOT NULL`)

**Kod kaže:**
Worker je vezan za **INSTITUCIJU** (`institution_id`)

**Dokumentacija kaže (DATABASE_SETUP.md):**
> "Worker logini se kreiraju za svakog pacijenta kako bi medicinsko osoblje moglo naručiti proizvode bez prijave putem email/password."

**Migracija kaže (001_add_patient_id_to_workers.sql):**
```sql
ALTER TABLE workers ADD COLUMN patient_id UUID REFERENCES patients(id);
```

#### ZAKLJUČAK:
Baza je **TAČNA**! Worker login je vezan za pacijenta, ne za instituciju.

---

## 🟠 DRUGA NESLAGANJA

### 3. **INSTITUTIONS TABELA**

#### BAZA:
```sql
CREATE TABLE institutions (
  id UUID,
  name VARCHAR(255) NOT NULL,
  address_street BYTEA NOT NULL,          -- Enkriptovano!
  address_plz VARCHAR(10) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
```typescript
export interface Institution {
  id: string;
  name: string;
  address_street: Buffer;                 // ✅ Buffer je tačno za BYTEA
  address_plz: string;
  address_city: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 4. **PATIENTS TABELA**

#### BAZA:
```sql
CREATE TABLE patients (
  id UUID,
  institution_id UUID NOT NULL,
  first_name BYTEA NOT NULL,              -- Enkriptovano
  last_name BYTEA NOT NULL,               -- Enkriptovano
  address BYTEA NOT NULL,                 -- Enkriptovano
  unique_code VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
```typescript
export interface Patient {
  id: string;
  institution_id: string;
  first_name: Buffer;                     // ✅ Buffer je tačno
  last_name: Buffer;                      // ✅ Buffer je tačno
  address: Buffer;                        // ✅ Buffer je tačno
  unique_code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 5. **PRODUCTS TABELA**

#### BAZA:
```sql
CREATE TABLE products (
  id UUID,
  name_de VARCHAR(255) NOT NULL,
  description_de TEXT,
  type product_type NOT NULL,
  size glove_size,
  quantity_per_box INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price_per_unit NUMERIC(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
```typescript
export interface Product {
  id: string;
  name_de: string;
  description_de?: string;
  type: ProductType;
  size?: GloveSize;
  quantity_per_box: number;
  unit: string;
  price_per_unit: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 6. **ORDERS TABELA**

#### BAZA:
```sql
CREATE TABLE orders (
  id UUID,
  institution_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  created_by_user_id UUID,
  created_by_worker_id UUID,
  status order_status NOT NULL DEFAULT 'new',
  is_recurring BOOLEAN DEFAULT false,
  scheduled_date DATE,
  is_confirmed BOOLEAN DEFAULT false,
  approved_by_admin_id UUID,
  approved_at TIMESTAMP,
  shipped_at TIMESTAMP,
  total_amount NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
```typescript
export interface Order {
  id: string;
  institution_id: string;
  patient_id: string;
  created_by_user_id?: string;
  created_by_worker_id?: string;
  status: OrderStatus;
  is_recurring: boolean;
  scheduled_date?: Date;
  is_confirmed: boolean;
  approved_by_admin_id?: string;
  approved_at?: Date;
  shipped_at?: Date;
  total_amount?: number;
  created_at: Date;
  updated_at: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 7. **ORDER_ITEMS TABELA**

#### BAZA:
```sql
CREATE TABLE order_items (
  id UUID,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
```typescript
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  created_at: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 8. **INVOICES TABELA**

#### BAZA:
```sql
CREATE TABLE invoices (
  id UUID,
  order_id UUID NOT NULL,
  institution_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_year INTEGER NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  pdf_s3_key VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE
);
```

#### KOD:
```typescript
export interface Invoice {
  id: string;
  order_id: string;
  institution_id: string;
  patient_id: string;
  invoice_number: string;
  invoice_year: number;
  total_amount: number;
  pdf_s3_key?: string;
  created_at: Date;
  invoice_date: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 9. **USERS TABELA**

#### BAZA:
```sql
CREATE TABLE users (
  id UUID,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  institution_id UUID,
  is_verified BOOLEAN DEFAULT false,
  verification_code VARCHAR(6),
  verification_code_expires_at TIMESTAMP,
  reset_token VARCHAR(255),
  reset_token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

#### KOD:
```typescript
export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  institution_id?: string;
  is_verified: boolean;
  verification_code?: string;
  verification_code_expires_at?: Date;
  reset_token?: string;
  reset_token_expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}
```

✅ **OVO JE OK!** Match-uje 100%.

---

### 10. **AUDIT_LOGS TABELA**

#### BAZA:
```sql
CREATE TABLE audit_logs (
  id UUID,
  user_id UUID,
  worker_id UUID,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
❌ **NEMA INTERFACE-A** za `AuditLog`!

---

### 11. **PUSH_SUBSCRIPTIONS TABELA**

#### BAZA:
```sql
CREATE TABLE push_subscriptions (
  id UUID,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KOD:
❌ **NEMA INTERFACE-A** za `PushSubscription`!

---

## SUMMARY NESLAGANJA

### KRITIČNO:
1. **Workers tabela:**
   - U kodu: `institution_id`, `updated_at`
   - U bazi: `patient_id` (koji nedostaje u kodu)

### NEDOSTAJUĆI INTERFEJSI:
2. `AuditLog` - Tabela postoji, interface ne postoji
3. `PushSubscription` - Tabela postoji, interface ne postoji

### SVE OSTALO:
✅ Institucije, Pacijenti, Produkti, Narudžbine, Fakture, Useri - **SVE OK**

---

## POTREBNE AKCIJE

### PRIORITET 1 (Kritično):
1. Popraviti `Worker` interface u `backend/src/types/index.ts`:
   ```typescript
   export interface Worker {
     id: string;
     patient_id: string;           // DODATI (NOT NULL)
     username: string;
     password_hash: string;
     is_active: boolean;
     created_at: Date;
     last_login_at: Date | null;
     // OBRISATI: institution_id
     // OBRISATI: updated_at
   }
   ```

2. Popraviti sve `workerRepository.ts`, `workerService.ts`, `workerController.ts` sa ispravnim kolonama

### PRIORITET 2 (Važno):
3. Dodati interface za `AuditLog`
4. Dodati interface za `PushSubscription`

### PRIORITET 3 (Nice to have):
5. Kreirati `database_schema.sql` sa tačnom bazom

---

**Kraj izveštaja.**
