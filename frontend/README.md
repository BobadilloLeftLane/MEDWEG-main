# MEDWEG Frontend

> Progressive Web App (PWA) für MEDWEG B2B Medical Supplies Management System

**Verzija**: 0.1.0
**Status**: In Development (Beta)
**Tehnologije**: React 18, TypeScript, Material-UI (MUI), Vite, PWA

---

## 📋 Pregled

MEDWEG Frontend je moderna Progressive Web App (PWA) koja omogućava upravljanje B2B prodajom medicinskog materijala. Aplikacija je optimizovana za mobilne uređaje (mobile-first) i podržava instalaciju na home screen, offline funkcionalnost i push notifikacije.

### Ključne Funkcionalnosti

- ✅ **Progressive Web App** (instalacija, offline, push notifikacije)
- ✅ **Mobile-First dizajn** (responsive za sve uređaje)
- ✅ **Material-UI komponente** (profesionalan UI/UX)
- ✅ **3 User Role** (Admin App, Admin Einrichtung, Mitarbeiter)
- ✅ **Real-time notifikacije** (push notifications)
- ✅ **Dark mode** (opciono)
- ✅ **TypeScript** (type safety)
- ✅ **Vite** (brz build i development)

---

## 🏗️ Arhitektura

### Component Hijerarhija

```
App
├── Auth Pages (Login, Register, Verify)
├── Dashboard
│   ├── AdminDashboard (Admin Aplikacije)
│   ├── InstitutionDashboard (Admin Ustanove)
│   └── WorkerView (Mitarbeiter)
├── Patients Management
├── Orders Management
├── Products Catalog
└── Invoices
```

### Folder Struktura

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json         # PWA Manifest
│   ├── robots.txt
│   ├── favicon.ico
│   ├── pwa-192x192.png        # PWA Icons
│   └── pwa-512x512.png
├── src/
│   ├── components/            # React Components
│   │   ├── common/            # Reusable (Button, Card, Input, etc.)
│   │   ├── dashboard/         # Dashboard components
│   │   └── auth/              # Auth components
│   ├── pages/                 # Page Components (Routes)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── ...
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   └── ...
│   ├── services/              # API Communication
│   │   ├── api.ts             # Axios instance
│   │   ├── authService.ts
│   │   ├── orderService.ts
│   │   └── ...
│   ├── store/                 # State Management (Zustand)
│   │   ├── authStore.ts
│   │   └── ...
│   ├── utils/                 # Helper Functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── ...
│   ├── theme/                 # MUI Theme
│   │   └── theme.ts
│   ├── types/                 # TypeScript Types
│   │   └── index.ts
│   ├── assets/                # Images, Icons, Fonts
│   │   ├── images/
│   │   └── icons/
│   ├── App.tsx                # Root Component
│   ├── main.tsx               # Entry Point
│   └── vite-env.d.ts
├── tests/                     # Tests (Vitest)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Preduslov

- **Node.js** v20+ ([Download](https://nodejs.org/))
- **npm** v9+ ili **yarn** v1.22+
- **Backend API** running na http://localhost:8080

### Instalacija

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env (set API URL)
nano .env  # ili text editor

# 5. Start development server
npm run dev
```

Aplikacija bi trebala da bude dostupna na: **http://localhost:3000**

---

## ⚙️ Environment Variables

Sve environment varijable moraju početi sa `VITE_` prefiksom (Vite requirement).

**`.env` file**:
```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
VITE_API_TIMEOUT=10000

# PWA Push Notifications
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key

# Application
VITE_APP_NAME=MEDWEG
VITE_APP_VERSION=0.1.0
```

**Pristup u kodu**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 🎨 Material-UI Theme

### Konfiguracija

Theme je definisan u `src/theme/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Plava (vertrauen)
    },
    secondary: {
      main: '#4caf50', // Zelena (erfolg)
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16, // Veća osnovna font
    button: {
      textTransform: 'none', // Bez uppercase
    },
  },
  shape: {
    borderRadius: 8, // Zaobljeni uglovi
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // Touch-friendly
        },
      },
    },
  },
});
```

### Upotreba u App.tsx

```typescript
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

---

## 🔐 Autentifikacija

### Auth Flow

```
1. User login → Server returns JWT tokens (HTTP-Only Cookies)
2. Frontend stores user data in Zustand store
3. Protected routes check authentication status
4. If token expired → Auto-refresh or redirect to login
```

### Auth Store (Zustand)

**`src/store/authStore.ts`**:
```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'admin_application' | 'admin_institution' | 'worker';
  institutionId?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

---

## 📡 API Communication

### Axios Instance

**`src/services/api.ts`**:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  withCredentials: true, // Za HTTP-Only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (auto-attach token if needed)
api.interceptors.request.use((config) => {
  // Add custom logic if needed
  return config;
});

// Response interceptor (error handling)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired → redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Example

**`src/services/orderService.ts`**:
```typescript
import api from './api';

export interface CreateOrderDto {
  patientId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const createOrder = async (data: CreateOrderDto) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};
```

---

## 🔔 Push Notifikacije (PWA)

### Subscription Flow

```
1. User enables notifications → Browser prompts permission
2. Service Worker registers push subscription
3. Subscription sent to backend (/api/v1/push/subscribe)
4. Backend sends push when event occurs (nova narudžbina, itd.)
```

### Implementation

**`src/utils/pushNotifications.ts`**:
```typescript
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported');
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY
    ),
  });

  // Send subscription to backend
  await api.post('/push/subscribe', subscription);

  return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

---

## 🧩 Custom Hooks

### useAuth Hook

```typescript
// src/hooks/useAuth.ts
import { useAuthStore } from '@store/authStore';
import { loginApi, logoutApi } from '@services/authService';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      const userData = await loginApi(email, password);
      login(userData);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    logout();
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
};
```

### useOrders Hook

```typescript
// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, createOrder } from '@services/orderService';

export const useOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders,
    isLoading,
    error,
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
  };
};
```

---

## 📱 Mobile-First Design

### Breakpoints

Material-UI breakpoints:
- **xs**: 0px (extra-small, mobile)
- **sm**: 600px (small, tablet portrait)
- **md**: 900px (medium, tablet landscape)
- **lg**: 1200px (large, desktop)
- **xl**: 1536px (extra-large, wide desktop)

### Responsive Components

```typescript
import { useMediaQuery, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ padding: isMobile ? 2 : 4 }}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
}
```

### Touch-Friendly UI

- Minimum button size: **44x44px**
- Large tap targets
- Sufficient spacing between interactive elements
- Swipe gestures support (opciono)

---

## 🧪 Testing

### Vitest Setup

**`vite.config.ts`** (test configuration):
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

### Component Testing

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@components/common/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Run Tests

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

---

## 📦 Build & Deployment

### Build za Production

```bash
npm run build
```

Output: `dist/` folder

### Preview Production Build

```bash
npm run preview
```

### Deploy na AWS S3 + CloudFront

```bash
# 1. Build
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Environment Variables (Production)

Kreiraj `.env.production`:
```env
VITE_API_URL=https://api.medweg.de/api/v1
VITE_VAPID_PUBLIC_KEY=your-production-vapid-key
```

Build sa production env:
```bash
npm run build -- --mode production
```

---

## 🎯 User Roles & Views

### 1. Admin Anwendung

**Dashboard**:
- Lista svih ustanova (kartice)
- Nove narudžbine (uzvičnik badge)
- Statistike (ukupno narudžbina, revenue)

**Permissions**:
- View all institutions
- Approve orders
- Manage products
- View all invoices

### 2. Admin Einrichtung

**Dashboard**:
- Lista svojih pacijenata
- Kreiranje novih pacijenata
- Generisanje worker login-a
- Kreiranje narudžbina

**Permissions**:
- Manage own patients
- Create orders
- View own invoices
- Generate worker credentials

### 3. Mitarbeiter (Worker)

**View**:
- Minimalistički interfejs
- Samo jedan pacijent (assign via code)
- Kreiranje narudžbina za tog pacijenta
- Pregled prethodnih narudžbina

**Permissions**:
- Create orders for assigned patient
- View order history for assigned patient

---

## 🔧 Development Tips

### Hot Module Replacement (HMR)

Vite automatski reloaduje kod pri izmeni fajla.

### VS Code Extensions

Preporučeno:
- **ESLint**
- **Prettier**
- **TypeScript Vue Plugin (Volar)**
- **Material-UI Snippets**

### Code Snippets

**React Functional Component**:
```typescript
import React from 'react';

interface Props {
  // Define props
}

export const MyComponent: React.FC<Props> = ({ }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

---

## 🤝 Contributing

### Code Style

- **TypeScript** strict mode
- **ESLint** + **Prettier**
- **Naming conventions**:
  - Components: PascalCase (`PatientCard.tsx`)
  - Hooks: camelCase with "use" prefix (`useAuth.ts`)
  - Utilities: camelCase (`formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE

### Commit Messages

Format: `type(scope): description`

**Examples**:
```
feat(auth): add email verification page
fix(orders): correct date formatting
style(dashboard): improve mobile layout
```

---

## 📚 Resources

### Dokumentacija

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

### Interni Dokumenti

- `../TECHNICAL_DOCUMENTATION.md` - Kompletna tehnička dokumentacija
- `../DATABASE_SETUP.md` - Database setup
- `../backend/README.md` - Backend dokumentacija
- `CHANGELOG.md` - Version history

---

## 📄 License

**UNLICENSED** - Privatni projekat, sva prava zadržana.

---

**Poslednji update**: 2025-01-07
**Autor**: MEDWEG Team
**Verzija**: 0.1.0
