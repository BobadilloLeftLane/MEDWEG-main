# Changelog

All notable changes to the MEDWEG Frontend PWA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Full UI implementation
- Authentication pages (Login, Register, Verify)
- Dashboard components (Admin App, Admin Institution, Worker)
- Patient management
- Order management
- Product catalog
- Invoice viewing/download
- Push notifications
- PWA functionality (offline, install)
- Dark mode support
- Unit & integration tests
- Production deployment

---

## [0.1.0] - 2025-01-07

### Added
- ✅ Initial project structure
- ✅ Vite configuration
- ✅ TypeScript configuration
- ✅ ESLint + Prettier setup
- ✅ Environment variables template (`.env.example`)
- ✅ Package.json with all required dependencies
- ✅ PWA configuration (vite-plugin-pwa)
- ✅ Material-UI setup
- ✅ Folder structure (component-based architecture)
  - `src/components` - React components
    - `common/` - Reusable components
    - `dashboard/` - Dashboard-specific components
    - `auth/` - Authentication components
  - `src/pages` - Page components (routes)
  - `src/hooks` - Custom React hooks
  - `src/services` - API communication layer
  - `src/store` - State management (Zustand)
  - `src/utils` - Helper functions
  - `src/theme` - MUI theme configuration
  - `src/types` - TypeScript type definitions
  - `src/assets` - Images, icons, fonts
- ✅ Git ignore configuration
- ✅ README.md documentation
- ✅ CHANGELOG.md (this file)

### Dependencies
- `react` (^18.2.0) - UI library
- `react-dom` (^18.2.0) - React DOM renderer
- `react-router-dom` (^6.21.1) - Routing
- `@mui/material` (^5.15.3) - UI components
- `@mui/icons-material` (^5.15.3) - Material icons
- `@mui/x-data-grid` (^6.18.7) - Data tables
- `@emotion/react` (^11.11.3) - CSS-in-JS
- `axios` (^1.6.5) - HTTP client
- `zustand` (^4.4.7) - State management
- `@tanstack/react-query` (^5.17.9) - Server state
- `react-hook-form` (^7.49.3) - Form handling
- `zod` (^3.22.4) - Schema validation
- `date-fns` (^3.0.6) - Date utilities
- `recharts` (^2.10.3) - Charts
- `react-toastify` (^10.0.3) - Toast notifications
- `workbox-*` (^7.0.0) - PWA/Service Worker

### Dev Dependencies
- `vite` (^5.0.11) - Build tool
- `@vitejs/plugin-react` (^4.2.1) - React plugin
- `vite-plugin-pwa` (^0.17.4) - PWA plugin
- `typescript` (^5.3.3) - TypeScript compiler
- `eslint` (^8.56.0) - Code linting
- `prettier` (^3.1.1) - Code formatting
- `vitest` (^1.1.1) - Testing framework
- `@testing-library/react` (^14.1.2) - React testing
- All TypeScript type definitions

### Configuration
- Vite config with PWA support
- TypeScript strict mode enabled
- ESLint + Prettier integration
- Path aliases (@components, @pages, etc.)
- PWA manifest configuration
- Service Worker with Workbox
- Responsive design support (mobile-first)

### Notes
- Backend API must be running (http://localhost:8080)
- No UI components implemented yet (only structure)
- Ready for development

---

## Version History

| Version | Date | Status | Description |
|---------|------|--------|-------------|
| 0.1.0 | 2025-01-07 | ✅ Complete | Initial project setup |
| 0.2.0 | TBD | 🔄 Planned | Theme, layouts, routing |
| 0.3.0 | TBD | 🔄 Planned | Authentication pages |
| 0.4.0 | TBD | 🔄 Planned | Dashboard components |
| 0.5.0 | TBD | 🔄 Planned | Patient & order management |
| 0.6.0 | TBD | 🔄 Planned | Invoice viewing |
| 0.7.0 | TBD | 🔄 Planned | PWA features (offline, push) |
| 0.8.0 | TBD | 🔄 Planned | Testing & bug fixes |
| 0.9.0 | TBD | 🔄 Planned | Beta release |
| 1.0.0 | TBD | 🔄 Planned | Production release |

---

## Conventions

### Change Types
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

### Commit Message Format
```
type(scope): description

Examples:
- feat(auth): add login page UI
- fix(dashboard): correct responsive layout
- style(components): improve button styling
```

---

**Note**: This changelog will be updated with each release. Breaking changes will be clearly marked with ⚠️.
