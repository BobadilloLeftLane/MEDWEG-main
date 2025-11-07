# Changelog

All notable changes to the MEDWEG Backend API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Full API implementation
- Email notifications (AWS SES)
- Push notifications (PWA)
- PDF invoice generation
- Cron jobs for scheduled orders
- Unit & integration tests
- Production deployment

---

## [0.1.0] - 2025-01-07

### Added
- ✅ Initial project structure
- ✅ TypeScript configuration
- ✅ ESLint + Prettier setup
- ✅ Environment variables template (`.env.example`)
- ✅ Package.json with all required dependencies
- ✅ Folder structure (layered architecture)
  - `src/config` - Configuration files
  - `src/controllers` - HTTP request handlers
  - `src/middleware` - Express middleware
  - `src/models` - TypeScript interfaces
  - `src/repositories` - Database access layer
  - `src/routes` - API routes
  - `src/services` - Business logic
  - `src/utils` - Helper functions
  - `src/types` - Custom TypeScript types
  - `src/cron` - Scheduled tasks
- ✅ Git ignore configuration
- ✅ README.md documentation
- ✅ CHANGELOG.md (this file)

### Dependencies
- `express` (^4.18.2) - Web framework
- `pg` (^8.11.3) - PostgreSQL client
- `bcrypt` (^5.1.1) - Password hashing
- `jsonwebtoken` (^9.0.2) - JWT authentication
- `dotenv` (^16.3.1) - Environment variables
- `cors` (^2.8.5) - CORS middleware
- `helmet` (^7.1.0) - Security headers
- `express-rate-limit` (^7.1.5) - Rate limiting
- `joi` (^17.11.0) - Input validation
- `uuid` (^9.0.1) - UUID generation
- `node-cron` (^3.0.3) - Cron jobs
- `pdfkit` (^0.14.0) - PDF generation
- `aws-sdk` (^2.1515.0) - AWS services
- `web-push` (^3.6.6) - Push notifications
- `winston` (^3.11.0) - Logging
- `compression` (^1.7.4) - Response compression
- `cookie-parser` (^1.4.6) - Cookie parsing

### Dev Dependencies
- `typescript` (^5.3.3) - TypeScript compiler
- `ts-node` (^10.9.2) - TypeScript execution
- `nodemon` (^3.0.2) - Auto-restart
- `eslint` (^8.56.0) - Code linting
- `prettier` (^3.1.1) - Code formatting
- `jest` (^29.7.0) - Testing framework
- `supertest` (^6.3.3) - API testing
- All TypeScript type definitions

### Notes
- Database schema already created (see `../DATABASE_SETUP.md`)
- No code implementation yet (only project structure)
- Ready for development

---

## Version History

| Version | Date | Status | Description |
|---------|------|--------|-------------|
| 0.1.0 | 2025-01-07 | ✅ Complete | Initial project setup |
| 0.2.0 | TBD | 🔄 Planned | Database connection + config |
| 0.3.0 | TBD | 🔄 Planned | Authentication & authorization |
| 0.4.0 | TBD | 🔄 Planned | Core API endpoints |
| 0.5.0 | TBD | 🔄 Planned | Email & push notifications |
| 0.6.0 | TBD | 🔄 Planned | PDF invoice generation |
| 0.7.0 | TBD | 🔄 Planned | Cron jobs |
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
- feat(auth): add email verification endpoint
- fix(orders): correct total amount calculation
- docs(readme): update API documentation
```

---

**Note**: This changelog will be updated with each release. Breaking changes will be clearly marked with ⚠️.
