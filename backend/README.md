# MEDWEG Backend API

> RESTful API backend za MEDWEG B2B Medical Supplies Management System

**Verzija**: 0.1.0
**Status**: In Development (Beta)
**Tehnologije**: Node.js, Express, TypeScript, PostgreSQL

---

## 📋 Pregled

MEDWEG Backend je RESTful API server koji omogućava B2B online prodaju medicinskog materijala (rukavice, dezinfekciona sredstva) namenjen Pflegeheimen, Pflegediensten i Ambulanzama u Nemačkoj.

### Ključne Funkcionalnosti

- ✅ **Autentifikacija & Autorizacija** (JWT, 3 role)
- ✅ **Upravljanje ustanovama** (Pflegeheime, Pflegedienste)
- ✅ **Upravljanje pacijentima** (enkriptovani podaci, GDPR)
- ✅ **Sistem narudžbina** (manuelne + automatske)
- ✅ **Automatsko fakturisanje** (PDF, Kleinunternehmer §19 UStG)
- ✅ **Email notifikacije** (AWS SES)
- ✅ **Push notifikacije** (PWA)
- ✅ **Cron jobs** (automatske narudžbine, reminderi)
- ✅ **Audit logging** (GDPR compliance)

---

## 🏗️ Arhitektura

### Layered Architecture (Clean Code)

```
┌─────────────────────────────────────┐
│         Controllers                 │  ← HTTP Request Handlers
├─────────────────────────────────────┤
│         Services                    │  ← Business Logic
├─────────────────────────────────────┤
│         Repositories                │  ← Database Access
├─────────────────────────────────────┤
│         Database (PostgreSQL)       │  ← Data Storage
└─────────────────────────────────────┘
```

### Folder Struktura

```
backend/
├── src/
│   ├── config/           # Konfiguracija (DB, AWS, JWT, etc.)
│   ├── controllers/      # HTTP Controllers
│   ├── middleware/       # Express Middleware (auth, validation, error)
│   ├── models/           # TypeScript Interfaces & Types
│   ├── repositories/     # Database Access Layer
│   ├── routes/           # API Routes
│   ├── services/         # Business Logic
│   ├── utils/            # Helper Functions
│   ├── types/            # Custom TypeScript Types
│   ├── cron/             # Cron Jobs (scheduled tasks)
│   └── app.ts            # Express App Entry Point
├── tests/                # Unit & Integration Tests
├── logs/                 # Application Logs
├── dist/                 # Compiled JavaScript (build output)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Preduslov

- **Node.js** v20+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ (sa MEDWEG bazom)
- **npm** v9+ ili **yarn** v1.22+
- **.env** fajl (kopiraj `.env.example`)

### Instalacija

```bash
# 1. Kloniraj repo (ili download)
cd backend

# 2. Instaliraj dependencies
npm install

# 3. Kreiraj .env fajl
cp .env.example .env

# 4. Edituj .env (dodaj DB credentials, JWT secrets, itd.)
nano .env  # ili koristi text editor

# 5. Proveri PostgreSQL konekciju
psql -U postgres -d MEDWEG -c "SELECT version();"

# 6. Pokreni development server
npm run dev
```

Server bi trebao da radi na: **http://localhost:8080**

Test endpoint: http://localhost:8080/api/v1/health

---

## ⚙️ Environment Variables

Sve environment varijable su definisane u `.env` fajlu. Kopiraj `.env.example` i prilagodi:

### Kritične Varijable (MORA promeniti!)

| Variable | Description | Primer |
|----------|-------------|--------|
| `DB_PASSWORD` | PostgreSQL password | `postgres123` |
| `DB_ENCRYPTION_KEY` | Key za enkripciju (min 32 chars) | `super-secret-key-32-characters...` |
| `JWT_SECRET` | Secret za JWT access tokens | `jwt-secret-change-in-prod` |
| `JWT_REFRESH_SECRET` | Secret za refresh tokens | `refresh-secret-change-in-prod` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

⚠️ **NIKADA ne commit-uj `.env` fajl u Git!**

---

## 📡 API Endpoints

### Base URL

```
Development: http://localhost:8080/api/v1
Production:  https://api.medweg.de/api/v1
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registracija Admin Einrichtung | - |
| POST | `/auth/verify-email` | Verifikacija email-a (6-digit code) | - |
| POST | `/auth/login` | Login (svi useri) | - |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/auth/logout` | Logout | JWT |
| POST | `/auth/forgot-password` | Zaboravljena lozinka | - |
| POST | `/auth/reset-password` | Reset lozinke | Reset Token |

### Institutions (Admin App)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/institutions` | Lista svih ustanova | Admin App |
| GET | `/institutions/:id` | Detalji ustanove | Admin App |
| PATCH | `/institutions/:id` | Ažuriraj ustanovu | Admin App |
| DELETE | `/institutions/:id` | Deaktiviraj ustanovu | Admin App |

### Patients (Admin Einrichtung)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/patients` | Lista pacijenata (svoje ustanove) | Admin Institution |
| GET | `/patients/:id` | Detalji pacijenta | Admin Institution |
| POST | `/patients` | Kreiranje pacijenta | Admin Institution |
| PATCH | `/patients/:id` | Ažuriranje pacijenta | Admin Institution |
| DELETE | `/patients/:id` | Deaktiviranje pacijenta | Admin Institution |
| POST | `/patients/:id/generate-worker-login` | Generisanje worker login-a | Admin Institution |

### Products (Admin App)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Lista proizvoda | Svi |
| GET | `/products/:id` | Detalji proizvoda | Svi |
| POST | `/products` | Kreiranje proizvoda | Admin App |
| PATCH | `/products/:id` | Ažuriranje proizvoda | Admin App |
| DELETE | `/products/:id` | Brisanje proizvoda | Admin App |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders` | Lista narudžbina | Admin App / Admin Institution |
| GET | `/orders/:id` | Detalji narudžbine | Authorized |
| POST | `/orders` | Kreiranje narudžbine | Admin Institution / Worker |
| PATCH | `/orders/:id/approve` | Odobrenje narudžbine | Admin App |
| PATCH | `/orders/:id/ship` | Označavanje kao poslata + faktura | Admin App |
| DELETE | `/orders/:id` | Otkazivanje narudžbine | Admin Institution |

### Invoices

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/invoices` | Lista faktura (svoje ustanove) | Admin Institution |
| GET | `/invoices/:id` | Detalji fakture | Authorized |
| GET | `/invoices/:id/download` | Download PDF fakture | Authorized |

### Push Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/push/subscribe` | Subscribe za push notif | JWT |
| DELETE | `/push/unsubscribe` | Unsubscribe | JWT |

### Health Check

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Server health status | - |
| GET | `/health/db` | Database connection status | - |

---

## 🔐 Autentifikacija & Autorizacija

### JWT Token Flow

```
1. User login → Server returns:
   - Access Token (HTTP-Only Cookie, 15min)
   - Refresh Token (HTTP-Only Cookie, 7 days)

2. Client requests → Sends Access Token
3. Access Token expired → Use Refresh Token to get new Access Token
4. Refresh Token expired → User must login again
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `admin_application` | Full access (manage institutions, products, approve orders, view all data) |
| `admin_institution` | Manage own patients, create orders, view own invoices |
| `worker` | Create orders for assigned patient only |

### Middleware

```typescript
// Protected route (any authenticated user)
router.get('/profile', authenticate, getProfile);

// Role-specific route
router.get('/institutions', authenticate, authorize(['admin_application']), getInstitutions);

// Multiple roles allowed
router.post('/orders', authenticate, authorize(['admin_institution', 'worker']), createOrder);
```

---

## 🗄️ Database

### Connection

PostgreSQL connection preko `pg` biblioteke.

**Config** (`src/config/database.ts`):
```typescript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Enkripcija/Dekripcija

Helper funkcije u `src/utils/encryption.ts`:

```typescript
import { encrypt, decrypt } from '@utils/encryption';

// Enkripcija
const encryptedName = await encrypt('Maria');

// Dekripcija
const decryptedName = await decrypt(encryptedBuffer);
```

**⚠️ Encryption key se čuva u `.env` (`DB_ENCRYPTION_KEY`)**

---

## 📧 Email Notifikacije (AWS SES)

### Setup

1. AWS SES sandbox mode → Production (request via AWS Support)
2. Verify domain/email
3. Configure DKIM/SPF records
4. Dodaj credentials u `.env`

### Email Templates

Svi email template-i su u `src/services/emailService.ts`:

- **Verifikacija** - 6-digit code (5min expiry)
- **Nova narudžbina** - Notifikacija Admin App
- **Odobrena narudžbina** - Notifikacija Admin Institution
- **Reminder** - 10 dana pre automatske narudžbine
- **Password reset** - Link sa tokenom

### Slanje email-a

```typescript
import { sendVerificationEmail } from '@services/emailService';

await sendVerificationEmail('user@example.com', '123456');
```

---

## 🔔 Push Notifikacije (PWA)

### Setup

1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Dodaj u `.env`:
```env
VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@medweg.de
```

3. Client subscribe (frontend):
```javascript
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
});

// Send subscription to backend
await fetch('/api/v1/push/subscribe', {
  method: 'POST',
  body: JSON.stringify(subscription)
});
```

4. Backend send (automatic):
```typescript
import { sendPushNotification } from '@services/pushService';

await sendPushNotification(userId, {
  title: 'Neue Bestellung',
  body: 'Pflegeheim Sonnenschein hat eine Bestellung erstellt',
  url: '/dashboard/orders/123'
});
```

---

## ⏰ Cron Jobs (Automatizacija)

### Active Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| **Check Scheduled Orders** | Daily 09:00 CET | Provera automatskih narudžbina za danas |
| **Send Reminders** | Daily 09:00 CET | Slanje reminder-a 10 dana pre |
| **Cleanup Expired Codes** | Daily 02:00 CET | Brisanje isteklih verification kodova |
| **Database Backup** | Weekly Sun 03:00 | (TODO: implementirati) |

### Konfiguracija

**Enable/Disable**:
```env
CRON_ENABLED=true
CRON_TIMEZONE=Europe/Berlin
```

**Manual trigger** (za testing):
```typescript
import { checkScheduledOrders } from '@cron/orderScheduler';

await checkScheduledOrders(); // Run immediately
```

---

## 🧾 PDF Fakture

### Generisanje

Automatski se generišu kada Admin App označi narudžbinu kao "Versendet" (shipped).

**Workflow**:
1. Admin App → PATCH `/orders/:id/ship`
2. Server → Status: `approved` → `shipped`
3. Server → Generiše PDF (pdfkit)
4. Server → Upload na S3: `invoices/2025/2025-001.pdf`
5. Server → Insert u `invoices` tabelu
6. Server → Email notifikacija Admin Institution

### Pflichtangaben (§14 UStG)

Svaka faktura sadrži:
- ✅ Ime i adresa isporučioca (vaša firma)
- ✅ Ime i adresa kupca (Admin Institution)
- ✅ Steuernummer
- ✅ Rechnungsnummer (2025-001, 2025-002, ...)
- ✅ Datum
- ✅ Proizvodi + količine + cene
- ✅ **Kleinunternehmer klauzula**: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet"

### Download

```http
GET /api/v1/invoices/:id/download
Authorization: Bearer <JWT_TOKEN>

Response: PDF file (Content-Type: application/pdf)
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

**Lokacija**: `tests/unit/`

**Primer**:
```typescript
// tests/unit/services/orderService.test.ts
import { createOrder } from '@services/orderService';

describe('OrderService', () => {
  it('should create order with valid data', async () => {
    const order = await createOrder({ ... });
    expect(order).toHaveProperty('id');
  });
});
```

### Integration Tests

**Lokacija**: `tests/integration/`

**Primer**:
```typescript
// tests/integration/orders.test.ts
import request from 'supertest';
import app from '@/app';

describe('POST /api/v1/orders', () => {
  it('creates order when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ patientId: '...', items: [...] });

    expect(response.status).toBe(201);
  });
});
```

### Test Coverage Goal

- **Unit Tests**: >80%
- **Integration Tests**: >60%
- **Critical paths**: 100% (auth, payments, encryption)

---

## 🐛 Debugging

### Logging

Winston logger sa 5 nivoa:

```typescript
import logger from '@utils/logger';

logger.error('Error message', { error });
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
logger.verbose('Verbose message');
```

**Log Files**:
- `logs/error.log` - Samo errors
- `logs/combined.log` - Sve poruke
- Console output (development)

### Development Mode

```bash
npm run dev  # Nodemon auto-restart
```

### VSCode Debugging

**`.vscode/launch.json`** (kreiraj ako ne postoji):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/backend/src/app.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📦 Build & Deployment

### Build za Production

```bash
npm run build
```

Output: `dist/` folder sa compiled JavaScript.

### Production Server

```bash
npm start
```

### Docker (opciono)

**Dockerfile**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
CMD ["node", "dist/app.js"]
```

**Build & Run**:
```bash
docker build -t medweg-backend .
docker run -p 8080:8080 --env-file .env medweg-backend
```

### AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize:
```bash
eb init -p node.js-20 medweg-backend --region eu-central-1
```

3. Deploy:
```bash
npm run build
eb create medweg-backend-prod
eb deploy
```

---

## 🔒 Security Best Practices

### Implementirano

- ✅ **Helmet** - Security headers
- ✅ **CORS** - Cross-Origin kontrola
- ✅ **Rate Limiting** - Brute-force zaštita
- ✅ **JWT** - Token-based auth
- ✅ **bcrypt** - Password hashing (10-12 rounds)
- ✅ **Input Validation** - Joi schema validation
- ✅ **SQL Injection Protection** - Parametrizovani query-ji
- ✅ **XSS Protection** - Helmet CSP
- ✅ **HTTPS** - Production only (AWS ELB)
- ✅ **Environment Variables** - Secrets u `.env`
- ✅ **Encryption at Rest** - pgcrypto (DB)
- ✅ **Audit Logging** - Svi pristupi ličnim podacima

### Security Checklist

Pred production:
- [ ] Promeniti sve secrets (JWT, DB password, AWS keys)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Review CORS settings (samo frontend domain)
- [ ] Test rate limiting
- [ ] Run security audit: `npm audit`
- [ ] Test all authentication flows
- [ ] Verify encryption works correctly
- [ ] Check audit logs functionality
- [ ] Enable AWS CloudWatch alarms
- [ ] Backup & restore test

---

## 📊 Monitoring & Performance

### Health Checks

```bash
# Server health
curl http://localhost:8080/api/v1/health

# Database health
curl http://localhost:8080/api/v1/health/db
```

### Metrics (TODO)

Plan za production:
- Request/response times
- Error rates
- Database query performance
- Memory/CPU usage
- Active connections

**Tools**:
- AWS CloudWatch (logs + metrics)
- Sentry (error tracking) - opciono
- Datadog (APM) - opciono

---

## 🤝 Contributing

### Code Style

- **TypeScript** strict mode
- **ESLint** + **Prettier**
- **Naming conventions**:
  - Files: camelCase (`userService.ts`)
  - Classes: PascalCase (`UserService`)
  - Functions: camelCase (`createUser()`)
  - Constants: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)

### Commit Messages

Format: `type(scope): description`

**Types**:
- `feat` - Nova funkcionalnost
- `fix` - Bug fix
- `docs` - Dokumentacija
- `refactor` - Refactoring
- `test` - Dodavanje testova
- `chore` - Maintenance (dependencies, config)

**Primeri**:
```
feat(auth): add email verification endpoint
fix(orders): correct total amount calculation
docs(readme): update API endpoints section
```

### Pull Request Checklist

- [ ] Kod prolazi `npm run lint`
- [ ] Svi testovi prolaze `npm test`
- [ ] Dodati novi testovi za novu funkcionalnost
- [ ] Ažuriran CHANGELOG.md
- [ ] Ažuriran README.md (ako je potrebno)
- [ ] Proveren code coverage (>80%)

---

## 📚 Resources

### Dokumentacija

- [Express.js Docs](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

### Interni Dokumenti

- `../TECHNICAL_DOCUMENTATION.md` - Kompletna tehnička dokumentacija
- `../DATABASE_SETUP.md` - Database schema i setup
- `CHANGELOG.md` - Version history
- `API_DOCS.md` - Detaljni API dokumentacija (TODO)

---

## 📞 Support

Za pitanja ili probleme:
- **Email**: admin@medweg.de
- **GitHub Issues**: (TODO: add repo link)

---

## 📄 License

**UNLICENSED** - Privatni projekat, sva prava zadržana.

---

**Poslednji update**: 2025-01-07
**Autor**: MEDWEG Team
**Verzija**: 0.1.0
