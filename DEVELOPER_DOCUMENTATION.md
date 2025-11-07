# MEDWEG - COMPREHENSIVE DEVELOPER DOCUMENTATION

> **Last Updated**: 2025-11-07
> **Version**: 1.0.0
> **Authors**: Development Team

---

## Table of Contents

1. [Overall Architecture](#overall-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Key Features](#key-features)
7. [File Structure](#file-structure)
8. [Data Flow](#data-flow)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Important Business Logic](#important-business-logic)

---

## Overall Architecture

### Project Structure

MEDWEG is a **monorepo** with separate backend and frontend applications:

```
MED_WEG/
├── backend/              # Node.js + Express + TypeScript REST API
├── frontend/             # React + TypeScript + Vite SPA
├── scripts/              # Development utilities
└── package.json          # Root package configuration
```

### Architecture Pattern: Layered (Clean) Architecture

**Backend follows a 4-layer architecture:**

```
┌──────────────────────────────────────┐
│     Controllers (HTTP Layer)         │  ← Request/Response handling
├──────────────────────────────────────┤
│     Services (Business Logic)        │  ← Core application logic
├──────────────────────────────────────┤
│     Repositories (Data Access)       │  ← Database queries
├──────────────────────────────────────┤
│     Database (PostgreSQL)            │  ← Data persistence
└──────────────────────────────────────┘
```

### Server Configuration

- **Frontend**: Runs on `http://localhost:3000` (Vite dev server)
- **Backend API**: Runs on `http://localhost:5000/api/v1`
- **Database**: PostgreSQL on `localhost:5432`

---

## Technology Stack

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | Express.js | 4.18.2 | HTTP server framework |
| **Language** | TypeScript | 5.3.3 | Type-safe JavaScript |
| **Database** | PostgreSQL | 14+ | Relational database |
| **Database Driver** | pg | 8.11.3 | Node.js PostgreSQL client |
| **Authentication** | jsonwebtoken | 9.0.2 | JWT token generation/verification |
| **Password Hashing** | bcrypt | 5.1.1 | Password encryption |
| **Validation** | Joi | 17.11.0 | Schema validation |
| **Data Encryption** | crypto (Node.js) | Built-in | AES-256-CBC encryption |
| **Logging** | winston | 3.11.0 | Structured logging |
| **Security** | helmet | 7.1.0 | HTTP security headers |
| **Rate Limiting** | express-rate-limit | 7.1.5 | Request throttling |
| **CORS** | cors | 2.8.5 | Cross-origin requests |

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI library |
| **Language** | TypeScript | 5.3.3 | Type-safe JavaScript |
| **Build Tool** | Vite | 5.0.11 | Fast module bundler |
| **UI Library** | Material-UI (MUI) | 5.15.3 | Component library |
| **Routing** | React Router | 6.21.1 | Client-side routing |
| **State Management** | Zustand | 4.4.7 | Lightweight state store |
| **Forms** | React Hook Form | 7.49.3 | Form management |
| **Validation** | Zod | 3.22.4 | TypeScript-first validation |
| **HTTP Client** | Axios | 1.6.5 | HTTP requests |
| **Notifications** | React Toastify | 10.0.3 | Toast messages |
| **Date Handling** | date-fns | 3.6.0 | Date utilities |
| **Icons** | MUI Icons | 5.15.3 | Material Design icons |
| **Date Picker** | MUI X Date Pickers | 8.17.0 | Date/time selection |

---

## Database Schema

### Tables Overview

| # | Table | Purpose | Key Fields | Relationships |
|---|-------|---------|-----------|---|
| 1 | `institutions` | Pflegedienste/Heime | id, name, address (encrypted) | 1:N Users, 1:N Patients, 1:N Orders |
| 2 | `users` | Admin Application & Admin Institution accounts | id, email, password_hash, role, institution_id | N:1 Institution, 1:N Orders (as approver) |
| 3 | `patients` | Patient records (GDPR protected) | id, first_name (enc), last_name (enc), address (enc), unique_code | 1:N Orders, 1:N Workers |
| 4 | `workers` | Worker login for patients | id, username, password_hash, patient_id | N:1 Patient, 1:N Orders |
| 5 | `products` | Medical supplies catalog | id, name_de, type, size, price_per_unit, is_available | 1:N OrderItems |
| 6 | `orders` | Order records | id, institution_id, patient_id, status, total_amount, scheduled_date | N:1 Institution, N:1 Patient, 1:N OrderItems |
| 7 | `order_items` | Individual items in orders | id, order_id, product_id, quantity, price_per_unit, subtotal | N:1 Order, N:1 Product |

### Encrypted Fields (GDPR Compliance)

The following fields are encrypted using AES-256-CBC at the database level:

| Table | Field | Type | Reason |
|-------|-------|------|--------|
| `institutions` | `address_street` | BYTEA | Sensitive location data |
| `patients` | `first_name` | BYTEA | Personal health data (Article 9 GDPR) |
| `patients` | `last_name` | BYTEA | Personal health data (Article 9 GDPR) |
| `patients` | `address` | BYTEA | Personal health data (Article 9 GDPR) |

### Enumerations

#### User Role Enum
```sql
CREATE TYPE user_role AS ENUM (
  'admin_application',    -- Super admin (application owner)
  'admin_institution',    -- Institution admin (owns one institution)
  'worker'                -- Healthcare worker (assigned to patient)
);
```

#### Order Status Enum
```sql
CREATE TYPE order_status AS ENUM (
  'pending',              -- Order created, awaiting approval
  'confirmed',            -- Order confirmed by admin
  'shipped',              -- Order shipped
  'delivered',            -- Order delivered to patient
  'cancelled'             -- Order cancelled
);
```

#### Product Type Enum
```sql
CREATE TYPE product_type AS ENUM (
  'gloves',               -- Nitrile gloves
  'disinfectant_liquid',  -- Liquid disinfectant
  'disinfectant_wipes'    -- Disinfectant wipes
);
```

#### Glove Size Enum
```sql
CREATE TYPE glove_size AS ENUM (
  'S',    -- Small
  'M',    -- Medium
  'L',    -- Large
  'XL'    -- Extra Large
);
```

### Key Database Constraints

```sql
-- Foreign key relationships
ALTER TABLE users ADD CONSTRAINT fk_users_institution
  FOREIGN KEY (institution_id) REFERENCES institutions(id);

ALTER TABLE patients ADD CONSTRAINT fk_patients_institution
  FOREIGN KEY (institution_id) REFERENCES institutions(id);

ALTER TABLE workers ADD CONSTRAINT fk_workers_patient
  FOREIGN KEY (patient_id) REFERENCES patients(id);

ALTER TABLE orders ADD CONSTRAINT fk_orders_institution
  FOREIGN KEY (institution_id) REFERENCES institutions(id);

ALTER TABLE orders ADD CONSTRAINT fk_orders_patient
  FOREIGN KEY (patient_id) REFERENCES patients(id);

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product
  FOREIGN KEY (product_id) REFERENCES products(id);
```

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Public Routes (No Authentication Required)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `POST` | `/auth/register` | Register new institution | `RegisterDto` | `{ email: string }` |
| `POST` | `/auth/verify-email` | Verify email with code | `{ email, code }` | `{ message: string }` |
| `POST` | `/auth/resend-code` | Resend verification code | `{ email }` | `{ message: string }` |
| `POST` | `/auth/login` | Login (Admin App/Institution) | `LoginDto` | `LoginResponse` |
| `POST` | `/auth/worker-login` | Login as worker | `WorkerLoginDto` | `LoginResponse` |
| `POST` | `/auth/forgot-password` | Request password reset | `{ email }` | `{ message: string }` |
| `POST` | `/auth/reset-password` | Reset password with token | `ResetPasswordDto` | `{ message: string }` |
| `POST` | `/auth/refresh` | Refresh access token | `{ refreshToken }` | `{ accessToken, refreshToken }` |

#### Protected Routes

| Method | Endpoint | Roles | Purpose | Response |
|--------|----------|-------|---------|----------|
| `POST` | `/auth/logout` | All | Logout user | `{ message: string }` |
| `GET` | `/auth/me` | All | Get current user | `UserResponse` |

### Patient Management Endpoints

| Method | Endpoint | Roles | Purpose | Request Body | Response |
|--------|----------|-------|---------|--------------|----------|
| `POST` | `/patients` | ADMIN_INSTITUTION | Create patient | `CreatePatientDto` | `Patient` |
| `GET` | `/patients` | ADMIN_INSTITUTION | Get patients list | Query params | `Patient[]` |
| `GET` | `/patients/:id` | ADMIN_INSTITUTION | Get patient details | - | `Patient` |
| `PUT` | `/patients/:id` | ADMIN_INSTITUTION | Update patient | `UpdatePatientDto` | `Patient` |
| `DELETE` | `/patients/:id` | ADMIN_INSTITUTION | Delete patient | - | `{ message: string }` |

### Product Management Endpoints

| Method | Endpoint | Roles | Purpose | Request Body | Response |
|--------|----------|-------|---------|--------------|----------|
| `GET` | `/products` | All Authenticated | Get products catalog | Query params | `Product[]` |
| `GET` | `/products/:id` | All Authenticated | Get product details | - | `Product` |
| `POST` | `/products` | ADMIN_APPLICATION | Create product | `CreateProductDto` | `Product` |
| `PUT` | `/products/:id` | ADMIN_APPLICATION | Update product | `UpdateProductDto` | `Product` |
| `DELETE` | `/products/:id` | ADMIN_APPLICATION | Delete product | - | `{ message: string }` |

### Order Management Endpoints

| Method | Endpoint | Roles | Purpose | Request Body | Response |
|--------|----------|-------|---------|--------------|----------|
| `POST` | `/orders` | ADMIN_INSTITUTION, WORKER | Create order | `CreateOrderDto` | `OrderWithItems` |
| `GET` | `/orders` | ADMIN_INSTITUTION, WORKER | Get institution orders | Query params | `Order[]` |
| `GET` | `/orders/:id` | All | Get order details | - | `OrderWithItems` |
| `GET` | `/orders/all` | ADMIN_APPLICATION | Get all orders | Query params | `OrderWithDetails[]` |
| `PATCH` | `/orders/:id/status` | ADMIN_INSTITUTION | Update order status | `{ status }` | `Order` |
| `PATCH` | `/orders/:id/admin-status` | ADMIN_APPLICATION | Update order status (admin) | `{ status }` | `Order` |
| `PATCH` | `/orders/:id/confirm` | ADMIN_APPLICATION | Confirm order | - | `Order` |
| `DELETE` | `/orders/:id` | All | Cancel pending order | - | `{ message: string }` |

### Worker Management Endpoints

| Method | Endpoint | Roles | Purpose | Response |
|--------|----------|-------|---------|----------|
| `POST` | `/workers/generate/:patientId` | ADMIN_INSTITUTION | Generate worker credentials | `{ username, password }` |
| `GET` | `/workers/patient/:patientId` | ADMIN_INSTITUTION | Get worker for patient | `Worker` |
| `GET` | `/workers` | ADMIN_INSTITUTION | Get all workers | `Worker[]` |
| `DELETE` | `/workers/:id` | ADMIN_INSTITUTION | Deactivate worker | `{ message: string }` |
| `PATCH` | `/workers/:id/reset-password` | ADMIN_INSTITUTION | Reset worker password | `{ newPassword: string }` |

### Institution Management Endpoints

| Method | Endpoint | Roles | Purpose | Response |
|--------|----------|-------|---------|----------|
| `GET` | `/institutions` | ADMIN_APPLICATION | Get all institutions | `Institution[]` |
| `GET` | `/institutions/:id` | ADMIN_APPLICATION | Get institution details | `Institution` |
| `PATCH` | `/institutions/:id/verify` | ADMIN_APPLICATION | Verify institution | `{ message: string }` |

---

## Authentication Flow

### JWT Token Structure

**Access Token** (15 minutes expiry):
```typescript
{
  userId: string;
  email: string;
  role: 'admin_application' | 'admin_institution' | 'worker';
  institutionId?: string;
  patientId?: string;  // For workers assigned to a patient
  iat: number;         // Issued at
  exp: number;         // Expiration time
}
```

**Refresh Token** (7 days expiry):
```typescript
{
  userId: string;
  email: string;
  role: string;
  institutionId?: string;
  patientId?: string;
  iat: number;
  exp: number;
}
```

### Login Workflows

#### Admin Application / Institution Login

```
1. User submits email + password
   ↓
2. Frontend POST /auth/login
   ↓
3. Backend:
   - Find user by email
   - Verify password (bcrypt)
   - Check if verified & active
   ↓
4. Generate JWT tokens
   ↓
5. Return { user, accessToken, refreshToken }
   ↓
6. Frontend:
   - Store in Zustand + localStorage
   - Redirect to dashboard
```

#### Worker Login

```
1. Worker submits username + password
   ↓
2. Frontend POST /auth/worker-login
   ↓
3. Backend:
   - Find worker by username (case-insensitive)
   - Verify password
   - Get associated patient
   ↓
4. Generate tokens with patientId
   ↓
5. Return tokens + user info
   ↓
6. Frontend redirects to /worker/dashboard
```

#### Token Refresh

When access token expires (401 response):

```
1. Axios interceptor detects 401
   ↓
2. POST /auth/refresh with refreshToken
   ↓
3. Backend verifies refresh token
   ↓
4. Generate new access token
   ↓
5. Update Zustand store
   ↓
6. Retry original request
```

### Middleware: Auth & Authorization

```typescript
// 1. authenticate middleware
- Extracts token from Authorization header
- Verifies JWT signature
- Adds payload to req.user
- Throws UnauthorizedError if invalid

// 2. authorize middleware
- Checks if user has required role(s)
- Throws ForbiddenError if unauthorized
- Usage: authorize([UserRole.ADMIN_APPLICATION])
```

---

## Key Features

### 1. User Management & Authentication

- **3-tier Role System**:
  - Admin Application (super admin)
  - Admin Institution (institution admin)
  - Worker (healthcare worker)

- **JWT-based Authentication**:
  - 15-minute access tokens
  - 7-day refresh tokens
  - HTTP-only secure cookies

- **Email Verification**:
  - 6-digit verification codes (5-minute expiry)
  - Code resending capability

- **Password Management**:
  - bcrypt hashing (10 salt rounds)
  - Password strength validation
  - Password reset via email token

### 2. Patient Management (GDPR Compliant)

- **Patient Data**:
  - Encrypted fields: first_name, last_name, address
  - AES-256-CBC encryption at rest
  - Unique identifier code for patients

- **CRUD Operations**:
  - Create/Read/Update patients
  - Soft delete (is_active flag)
  - Permanent deletion (GDPR right to be forgotten)

- **Data Isolation**:
  - Institution admins only see their patients
  - Workers only see assigned patients

### 3. Product Catalog Management

- **Product Types**:
  - Gloves (with sizes: S, M, L, XL)
  - Liquid disinfectant
  - Disinfectant wipes

- **Product Features**:
  - Name in German (name_de)
  - Description (optional)
  - Unit price
  - Quantity per box
  - Minimum order quantity
  - Availability flag

### 4. Order Management System

- **Order Workflow**:
  ```
  pending → confirmed → shipped → delivered
     ↓
  cancelled
  ```

- **Order Features**:
  - Multiple items per order
  - Patient association (optional)
  - Scheduled delivery dates
  - Order confirmation tracking
  - Total amount calculation

- **Order Creation Validation**:
  - Minimum order quantity checks
  - Product availability verification
  - Stock validation
  - Price snapshots at order time

### 5. Worker Account Management

- **Worker Features**:
  - Auto-generated credentials per patient
  - Username/password authentication
  - Assigned to specific patients
  - Password reset capability

### 6. Data Encryption & Security

- **At-Rest Encryption**:
  - AES-256-CBC for sensitive fields
  - Database-level encryption

- **In-Transit Security**:
  - HTTPS/TLS enforcement
  - CORS configuration
  - HTTP-only cookies
  - Security headers (helmet)

- **Access Control**:
  - Role-based access control (RBAC)
  - Institution-based data isolation

---

## File Structure

### Backend Structure

```
backend/
├── src/
│   ├── app.ts                          # Express app entry point
│   │
│   ├── config/
│   │   └── database.ts                 # PostgreSQL connection
│   │
│   ├── controllers/                    # HTTP Request Handlers
│   │   ├── authController.ts           # Auth endpoints
│   │   ├── patientController.ts        # Patient CRUD
│   │   ├── productController.ts        # Product management
│   │   ├── orderController.ts          # Order operations
│   │   ├── workerController.ts         # Worker credentials
│   │   └── institutionController.ts    # Institution admin
│   │
│   ├── middleware/                     # Express Middleware
│   │   ├── auth.ts                     # JWT auth & authorization
│   │   ├── validation.ts               # Joi validation
│   │   └── errorHandler.ts             # Error handling
│   │
│   ├── models/
│   │   └── User.ts                     # User model helpers
│   │
│   ├── repositories/                   # Data Access Layer
│   │   ├── userRepository.ts           # User CRUD
│   │   ├── patientRepository.ts        # Patient CRUD
│   │   ├── productRepository.ts        # Product queries
│   │   ├── orderRepository.ts          # Order CRUD
│   │   ├── workerRepository.ts         # Worker CRUD
│   │   └── institutionRepository.ts    # Institution CRUD
│   │
│   ├── routes/                         # API Route Definitions
│   │   ├── auth.routes.ts              # /auth endpoints
│   │   ├── patient.routes.ts           # /patients endpoints
│   │   ├── product.routes.ts           # /products endpoints
│   │   ├── order.routes.ts             # /orders endpoints
│   │   ├── worker.routes.ts            # /workers endpoints
│   │   └── institution.routes.ts       # /institutions endpoints
│   │
│   ├── services/                       # Business Logic Layer
│   │   ├── authService.ts              # Authentication logic
│   │   ├── patientService.ts           # Patient business logic
│   │   ├── productService.ts           # Product business logic
│   │   ├── orderService.ts             # Order workflow logic
│   │   ├── workerService.ts            # Worker management
│   │   └── emailService.ts             # Email sending
│   │
│   ├── types/
│   │   └── index.ts                    # TypeScript types & enums
│   │
│   └── utils/                          # Helper Utilities
│       ├── jwt.ts                      # Token generation/verification
│       ├── password.ts                 # Password hashing
│       ├── encryption.ts               # AES-256 encryption
│       └── logger.ts                   # Winston logging
│
├── package.json
├── tsconfig.json
└── .env.example
```

### Frontend Structure

```
frontend/
├── src/
│   ├── main.tsx                        # React entry point
│   ├── App.tsx                         # Main routing
│   │
│   ├── api/                            # API Client Layer
│   │   ├── client.ts                   # Axios instance
│   │   ├── authApi.ts                  # Auth API calls
│   │   ├── patientApi.ts               # Patient API calls
│   │   ├── productApi.ts               # Product API calls
│   │   ├── orderApi.ts                 # Order API calls
│   │   └── workerApi.ts                # Worker API calls
│   │
│   ├── store/
│   │   └── authStore.ts                # Zustand auth state
│   │
│   ├── pages/                          # Page Components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx           # Login form
│   │   │   └── RegisterPage.tsx        # Registration form
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx      # Admin dashboard
│   │   │   └── CustomersPage.tsx       # Institutions list
│   │   │
│   │   ├── institution/
│   │   │   └── InstitutionDashboard.tsx # Institution dashboard
│   │   │
│   │   ├── worker/
│   │   │   └── WorkerDashboard.tsx     # Worker dashboard
│   │   │
│   │   ├── patients/
│   │   │   └── PatientsPage.tsx        # Patient management
│   │   │
│   │   ├── products/
│   │   │   └── ProductsPage.tsx        # Product catalog
│   │   │
│   │   └── orders/
│   │       ├── OrdersPage.tsx          # Orders list
│   │       └── CreateOrderDialog.tsx   # Create order form
│   │
│   └── components/                     # Reusable Components
│       └── layout/
│           └── DashboardLayout.tsx     # Dashboard wrapper
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## Data Flow

### Complete Request/Response Cycle

#### Example: Creating an Order

```
FRONTEND
│
├─ User fills order form
│  └─ Items: [{ productId, quantity }]
│  └─ patientId (optional)
│  └─ scheduledDate (optional)
│
├─ Validation with Zod schema
│
├─ POST /orders
│  Headers: { Authorization: "Bearer <token>" }
│  Body: CreateOrderDto
│
└─ Axios interceptor adds token

   BACKEND
   │
   ├─ Express receives POST request
   │
   ├─ authenticate middleware
   │  ├─ Extract token from header
   │  ├─ Verify JWT signature
   │  └─ Add user payload to req.user
   │
   ├─ authorize middleware
   │  └─ Check if user has required role
   │
   ├─ validate middleware
   │  └─ Validate body with Joi schema
   │
   ├─ orderController.createOrder()
   │  └─ Extract institutionId, userId, role from req.user
   │
   ├─ orderService.createOrder()
   │  │
   │  ├─ Validate items array
   │  ├─ For each item:
   │  │  ├─ Fetch product from repository
   │  │  ├─ Check if available
   │  │  ├─ Check stock
   │  │  ├─ Check min order quantity
   │  │  └─ Get price snapshot
   │  │
   │  └─ Call orderRepository.createOrder()
   │
   ├─ orderRepository.createOrder()
   │  │
   │  ├─ BEGIN TRANSACTION
   │  │
   │  ├─ INSERT into orders
   │  │  ├─ institution_id
   │  │  ├─ patient_id
   │  │  ├─ created_by_user_id (if admin/institution)
   │  │  ├─ created_by_worker_id (if worker)
   │  │  ├─ status = 'pending'
   │  │  ├─ total_amount
   │  │  └─ scheduled_date
   │  │
   │  ├─ For each item:
   │  │  └─ INSERT into order_items
   │  │
   │  ├─ COMMIT
   │  └─ Return OrderWithItems
   │
   ├─ Return 201 with order data
   │
   └─ Frontend receives response
      │
      ├─ Parse response
      ├─ Show success toast
      └─ Redirect to orders list
```

### Data Encryption Flow

```
SENSITIVE DATA INPUT
│
├─ Patient name, address
│
└─ Frontend submits

   BACKEND
   │
   ├─ encryptionService.encrypt(plaintext)
   │  ├─ Generate random IV
   │  ├─ Create cipher with AES-256-CBC
   │  ├─ Encrypt using DB_ENCRYPTION_KEY
   │  └─ Return Buffer (IV + encrypted data)
   │
   └─ Store as BYTEA in PostgreSQL

   RETRIEVAL
   │
   ├─ Query database (BYTEA returned)
   │
   ├─ encryptionService.decrypt(buffer)
   │  ├─ Extract IV from buffer
   │  ├─ Create decipher with AES-256-CBC
   │  ├─ Decrypt using DB_ENCRYPTION_KEY
   │  └─ Return plaintext
   │
   └─ Send to frontend
```

---

## User Roles & Permissions

### ADMIN_APPLICATION (Super Administrator)

**Scope**: Global system access

| Feature | Permissions |
|---------|-------------|
| **Institutions** | View all, verify, deactivate |
| **Users** | View all, manage admin_institution users |
| **Patients** | View all (all institutions) |
| **Products** | Create, read, update, delete |
| **Orders** | View all, approve, update status |
| **Dashboard** | System-wide statistics |

**Routes Accessible**:
- `/admin/dashboard`
- `/admin/customers`
- `/admin/products`
- `/admin/orders`

### ADMIN_INSTITUTION (Institution Administrator)

**Scope**: Single institution only

| Feature | Permissions |
|---------|-------------|
| **Institution** | View own, update profile |
| **Patients** | Create, read, update, delete (own institution) |
| **Products** | Read/View only |
| **Orders** | Create, read, update status (own institution) |
| **Workers** | Create credentials, manage (own institution) |

**Routes Accessible**:
- `/institution/dashboard`
- `/institution/patients`
- `/institution/products`
- `/institution/orders`

**Data Isolation**:
```sql
WHERE institution_id = req.user.institutionId
```

### WORKER (Healthcare Worker)

**Scope**: Single patient only

| Feature | Permissions |
|---------|-------------|
| **Patient** | View assigned patient only |
| **Products** | Read/View only |
| **Orders** | Create for assigned patient only |

**Routes Accessible**:
- `/worker/dashboard`
- `/api/v1/orders` (create only)
- `/api/v1/products` (view only)

**Access Control**:
```typescript
// Worker can only create orders for assigned patient
if (req.user.role === 'worker' && req.user.patientId !== data.patient_id) {
  throw new ForbiddenError("Cannot create order for different patient");
}
```

---

## Important Business Logic

### 1. Order Creation Workflow

**Key Validation Steps**:

```typescript
// 1. Validate items array is not empty
if (!data.items || data.items.length === 0) {
  throw new ValidationError("At least one item required");
}

// 2. For each item:
for (const item of data.items) {
  // 2a. Check product exists
  const product = await productRepo.findProductById(item.product_id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // 2b. Check product is available
  if (!product.is_available) {
    throw new ValidationError("Product not available");
  }

  // 2c. Check minimum order quantity
  if (item.quantity < product.min_order_quantity) {
    throw new ValidationError("Below minimum quantity");
  }
}

// 3. Determine creator field based on role
const isWorker = userRole === 'worker';
const orderData = {
  created_by_user_id: isWorker ? undefined : userId,
  created_by_worker_id: isWorker ? userId : undefined,
  // ... other fields
};

// 4. Create order in database transaction
// 5. Return order with items
```

### 2. Patient Data Protection (GDPR)

**Encryption on Insert**:

```typescript
const encryptedFirstName = await encrypt(firstName);
const encryptedAddress = await encrypt(address);

const query = `
  INSERT INTO patients (first_name, address, ...)
  VALUES ($1, $2, ...)
`;
// $1 and $2 are encrypted buffers
```

**Decryption on Retrieval**:

```typescript
const patientRow = await pool.query("SELECT first_name FROM patients");
const firstName = await decrypt(patientRow.first_name); // Buffer → string
```

**Permanent Deletion (Right to be Forgotten)**:

```typescript
// DELETE /api/v1/patients/:id
const query = `
  DELETE FROM patients WHERE id = $1 AND institution_id = $2
`;
// Cascading deletes orders, order_items, etc.
```

### 3. Worker Credential Generation

**Process**:

```typescript
export const generateWorkerForPatient = async (patientId: string) => {
  // 1. Check if worker already exists
  const existing = await workerRepo.findByPatientId(patientId);
  if (existing) {
    throw new AppError(400, "Worker already exists for this patient");
  }

  // 2. Get patient name for username
  const patient = await patientRepo.findById(patientId);
  const firstName = await decrypt(patient.first_name);
  const lastName = await decrypt(patient.last_name);

  // 3. Generate username: FirstLetterLastName (e.g., VFilipovic)
  const baseUsername = `${firstName.charAt(0)}${lastName}`;
  let username = baseUsername;
  let counter = 1;

  // 4. Ensure unique username
  while (await workerRepo.findByUsername(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  // 5. Generate random password (10 chars alphanumeric)
  const password = generateRandomPassword(); // e.g., "veut1viqni"

  // 6. Hash password
  const passwordHash = await hashPassword(password);

  // 7. Create worker record
  const worker = await workerRepo.create({
    patient_id: patientId,
    institution_id: institutionId,
    username,
    password_hash: passwordHash
  });

  // 8. Return credentials (password only shown once!)
  return { username, password, workerId: worker.id };
};
```

### 4. Password Visibility (Show/Hide)

When admin clicks eye icon to view worker password:

```typescript
handleTogglePasswordVisibility = async (workerId, patientId) => {
  // If already visible, hide it
  if (visiblePasswordMap.has(patientId)) {
    visiblePasswordMap.delete(patientId);
    return;
  }

  // Otherwise, reset password and show new one
  const result = await workerApi.resetWorkerPassword(workerId);
  visiblePasswordMap.set(patientId, result.newPassword);

  toast.info("New password generated and displayed");
};
```

**IMPORTANT**: Each time password is viewed, a NEW password is generated for security.

### 5. Rate Limiting & Security

**Global Rate Limiting**:

```typescript
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: "Too many requests"
});
```

**Login Rate Limiting**:

```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 login attempts
  skipSuccessfulRequests: true
});
```

**Security Headers** (via Helmet):

```typescript
app.use(helmet()); // Sets:
// - Strict-Transport-Security
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Content-Security-Policy
```

### 6. Error Handling

**Custom Error Classes**:

```typescript
throw new ValidationError("Invalid email format");
throw new UnauthorizedError("Invalid credentials");
throw new ForbiddenError("Access denied");
throw new NotFoundError("Resource not found");
```

**Global Error Handler**:

```typescript
app.use((err: Error, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Unexpected error
  logger.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});
```

---

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=medweg_db

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
DB_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Email (if using email service)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your_email@example.com
# SMTP_PASS=your_email_password
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Database Setup

```bash
# Create database
createdb medweg_db

# Run migrations (if available)
# Or manually execute SQL files in backend/migrations/
```

---

## Testing

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

---

## Common Issues & Solutions

### Issue: Token expired errors

**Solution**: Check JWT_EXPIRES_IN in .env. In development, use longer expiry (e.g., 24h).

### Issue: Database connection failed

**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DB credentials in .env
3. Check DB_HOST (use 'localhost' not '127.0.0.1')

### Issue: CORS errors

**Solution**: Ensure FRONTEND_URL in backend .env matches actual frontend URL.

### Issue: Encrypted data not decrypting

**Solution**: Ensure DB_ENCRYPTION_KEY is exactly 32 characters and matches between environments.

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Summary

This comprehensive documentation covers:

1. **Architecture**: Clean layered architecture with separation of concerns
2. **Technology**: Modern full-stack with React, Express, TypeScript, PostgreSQL
3. **Database**: 7 core tables with GDPR encryption and proper relationships
4. **API**: 40+ RESTful endpoints with role-based access control
5. **Authentication**: JWT tokens with refresh mechanism
6. **Features**: Complete B2B ordering system with GDPR compliance
7. **File Structure**: Well-organized codebase with clear module separation
8. **Data Flow**: Detailed request-response cycles and encryption flows
9. **Permissions**: Three-tier role system with proper authorization
10. **Business Logic**: Order processing, data encryption, worker credentials

The system is production-ready with proper error handling, validation, encryption, logging, and security measures.

---

**For questions or support, contact the development team.**
