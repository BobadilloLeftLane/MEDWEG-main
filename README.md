# MEDWEG - Medizinischer Großhandel

Modern web aplikacija za upravljanje medicinskim veleprodajnim poslovanjem za Pflegedienst ustanove u Nemačkoj.

## 🚀 Brzi Start

### Preduslov
- Node.js 18+
- PostgreSQL 14+
- npm ili yarn

### Instalacija

```bash
# Instaliraj sve dependencies (root, backend, frontend)
npm run install:all
```

### Pokretanje Development Servera

```bash
# Pokreni backend (port 5000) i frontend (port 3000) istovremeno
npm run dev
```

Aplikacija će biti dostupna na:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Zaustavljanje Servera

```bash
# Zaustavi oba servera i oslobodi portove
npm stop
```

## 🗄️ Baza Podataka

### Seed Test Podaci

```bash
# Očisti bazu i ubaci test podatke
npm run seed
```

### Test Nalozi

Nakon seedinga, možeš se ulogovati sa:

1. **Admin Aplikacije** (vidi sve institucije):
   - Email: `admin@gmail.com`
   - Password: `Admin123!`

2. **Pflege Berlin Mitte**:
   - Email: `pflege.mitte@gmail.com`
   - Password: `Admin123!`

3. **Pflege München Süd**:
   - Email: `pflege.muenchen@gmail.com`
   - Password: `Admin123!`

4. **Pflege Hamburg Nord**:
   - Email: `pflege.hamburg@gmail.com`
   - Password: `Admin123!`

## 📁 Struktura Projekta

```
MED_WEG/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── modules/     # Feature modules (auth, patients, products, orders)
│   │   ├── config/      # Database, env config
│   │   ├── middleware/  # Auth, validation, error handling
│   │   └── utils/       # Helpers, encryption, logger
│   └── scripts/         # Database seeding
│
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── store/      # Zustand state management
│   │   ├── theme/      # MUI theme configuration
│   │   └── api/        # API client (TODO)
│   └── public/
│
└── scripts/            # Root dev/stop scripts
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: pg (raw SQL)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **PDF**: PDFKit
- **Encryption**: crypto (AES-256-CBC)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router Dom v6
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios (TODO)
- **Notifications**: React Toastify

## 🎨 Design System

- **Primary Color**: Blue (#2563EB)
- **Secondary Color**: Green (#10B981)
- **Accent Color**: Cyan (#06B6D4)
- **Background**: Light Gray (#F8FAFC)
- **Style**: Modern, clean, with shadows and textures

## 📝 Available Scripts

### Root Commands
- `npm run dev` - Pokreni backend + frontend
- `npm stop` - Zaustavi sve servere
- `npm run install:all` - Instaliraj sve dependencies
- `npm run seed` - Seed test data

### Backend Commands
```bash
cd backend
npm run dev          # Development server
npm run build        # Build TypeScript
npm run start        # Production server
npm run seed         # Seed database
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

## 🔐 User Roles

1. **ADMIN_APPLICATION**:
   - Vidi sve institucije
   - Upravlja sistemom
   - Dashboard: `/admin/dashboard`

2. **ADMIN_INSTITUTION**:
   - Vidi samo svoju instituciju
   - Upravlja pacijentima, porudžbinama
   - Dashboard: `/institution/dashboard`

3. **WORKER**:
   - Osnovni pristup (TODO)

## 🚧 TODO

- [ ] Implementirati real API komunikaciju (zaменити mock login)
- [ ] Dodati protected route guards
- [ ] Implementirati Products page
- [ ] Implementirati Orders page
- [ ] Dodati role-based navigation menu
- [ ] Implementirati real-time notifications
- [ ] Dodati unit tests
- [ ] Dodati Docker setup

## 📄 License

MIT License

---

Developed with ❤️ for MEDWEG
