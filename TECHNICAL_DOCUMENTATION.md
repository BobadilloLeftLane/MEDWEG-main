# Technische Dokumentation und Strategieplan
## B2B Web-Anwendung für Medizinischen Materialevertrieb

---

## 📋 PROJEKTÜBERSICHT

### Geschäftsmodell
- **Art**: B2B Online-Verkauf von medizinischem Material
- **Zielgruppe**: Pflegedienste, Pflegeheime, Ambulanzen in Deutschland
- **Produkte**:
  - Handschuhe (S/M/L/XL) - Nitril
  - Desinfektionsmittel (Flüssigkeit)
  - Desinfektionstücher
- **Erwartete Größe**: Bis zu 100 Kunden
- **Rechtsstatus**: Einzelunternehmer (Kleinunternehmerregelung §19 UStG)

### Kernfunktionen
1. Produktkatalog mit Filtern
2. Bestellsystem (manuell und automatisch)
3. Patienten-Management
4. Bestellverfolgung
5. Benutzerverwaltung (3 Rollen)
6. Automatische Fakturierung (PDF)
7. Email-Benachrichtigungen & Push-Notifications
8. Dashboard für Admin & Einrichtungen

---

## 👥 BENUTZERROLLEN & ZUGRIFFSRECHTE

### 1. **Admin Anwendung** (Super-Administrator)
**Zugriffslevel**: Vollständiger Zugriff auf alle Daten und Funktionen

**Funktionen**:
- Verwaltung aller Einrichtungen (anzeigen, deaktivieren)
- Produktkatalog verwalten (hinzufügen, bearbeiten, Preise ändern)
- Alle Bestellungen überwachen und genehmigen
- Dashboard mit Statistiken:
  - Monatliche Übersicht aller Einrichtungen (Kartendarstellung)
  - Neue Bestellungen mit Warnzeichen (!)
  - Bestellstatus: Neu → Genehmigt → Versendet
- Email/Push-Benachrichtigungen bei neuen Bestellungen
- Fakturenverwaltung (Download, Archiv)
- Manuelle Bestellungen für Einrichtungen erstellen
- Neue Einrichtungen registrieren oder Registrierungen genehmigen
- Backup-Verwaltung und Datenarchivierung (nach 1 Jahr)

### 2. **Admin Einrichtung** (Einrichtungsadministrator)
**Zugriffslevel**: Zugriff nur auf eigene Einrichtungsdaten

**Funktionen**:
- Patientenverwaltung:
  - Patienten hinzufügen (Name, Vorname, Adresse)
  - Patienten bearbeiten/deaktivieren
  - Einzigartige Login-Daten für Mitarbeiter pro Patient generieren
  - Patient-Code regenerieren bei Bedarf
- Bestellungen erstellen:
  - Neue Bestellung für einen Patienten
  - Bestellung wiederholen (nach Monaten oder Zwischenbestellung)
  - Automatische Bestellungen planen (Datum wählen)
- Dashboard-Ansicht:
  - Liste aller eigenen Patienten
  - Bestellstatus-Anzeige (Genehmigt ✓)
  - Statistiken pro Patient (Bestellhistorie letzte Monate)
  - Suchfunktion für Patienten (nach Name)
- Bestellungen stornieren (bis zur Genehmigung)
- PDF-Rechnungen herunterladen
- Profilverwaltung (Adresse, Kontaktdaten ändern)

**Registrierung**:
- Email, Firmenadresse, Firmenname, Passwort (2x eingeben)
- Email-Verifikation mit 6-stelligem Code (gültig 5 Minuten)
- Bestätigung durch Admin Anwendung optional

### 3. **Mitarbeiter** (Pflegekraft)
**Zugriffslevel**: Zugriff nur auf zugewiesenen Patienten

**Funktionen**:
- Login mit Patient-spezifischen Zugangsdaten (von Admin Einrichtung generiert)
  - Beispiel: Username: `Milam12`, Password: `nu38d83hw`
- Bestellung für zugewiesenen Patienten erstellen
- Frühere Bestellungen des Patienten einsehen
- Keine Verwaltungsfunktionen

**Wichtig**: Mehrere Mitarbeiter können dieselben Login-Daten für einen Patienten verwenden

---

## 🔐 DATENSCHUTZ & COMPLIANCE (GDPR/DSGVO)

### Rechtlicher Rahmen

#### 1. **GDPR/DSGVO-Anforderungen für Gesundheitsdaten**
Patientendaten (Name, Adresse) fallen unter **Artikel 9 Absatz 1 DSGVO** (besondere Kategorien personenbezogener Daten).

**Pflichten**:
- ✅ **Verschlüsselung obligatorisch**:
  - Daten at-rest (Datenbank-Verschlüsselung)
  - Daten in-transit (HTTPS/TLS)
  - Field-level encryption für Patientenname und Adresse
- ✅ **Datenschutzbeauftragter**: Bei umfangreicher Verarbeitung von Artikel 9-Daten erforderlich
- ✅ **Datenschutz-Folgenabschätzung (DSFA)**: Notwendig bei hohem Risiko für Betroffene
- ✅ **Datenminimierung**: Nur notwendige Daten erheben
- ✅ **Speicherbegrenzung**: Daten nach 1 Jahr archivieren/löschen
- ✅ **Transparenz**: Datenschutzerklärung bereitstellen

#### 2. **Technische Maßnahmen**

**Verschlüsselung**:
- **At-Rest**: PostgreSQL mit pgcrypto für Feldverschlüsselung
  - Patientenname: verschlüsselt
  - Patientenadresse: verschlüsselt
  - Weitere sensible Daten: verschlüsselt
- **In-Transit**: HTTPS mit TLS 1.3
- **Key Management**: AWS KMS (Key Management Service)

**Zugriffskontrolle**:
- Role-Based Access Control (RBAC)
- Principle of Least Privilege
- Audit-Logs für alle Datenzugriffe

**Backup & Retention**:
- Wöchentliche automatisierte Backups (AWS RDS)
- Verschlüsselte Backups in AWS S3 (Frankfurt Region)
- 1 Jahr Aufbewahrungspflicht für Rechnungen
- Nach 1 Jahr: Manuelle Archivierung durch Admin

#### 3. **NIS-2-Richtlinie (ab 2025)**
Falls Unternehmen wächst (>50 Mitarbeiter oder >10M€ Umsatz):
- Erhöhte IT-Sicherheitsanforderungen
- Meldepflicht bei Sicherheitsvorfällen
- Regelmäßige Sicherheitsaudits

### Hosting & Datenresidenz

**AWS Frankfurt Region (eu-central-1)**:
- ✅ DSGVO-konformes Hosting
- ✅ Daten bleiben in Deutschland/EU
- ✅ GDPR Data Processing Addendum (DPA)
- ✅ Standard Contractual Clauses (SCC)
- ⚠️ **Hinweis**: US Cloud Act gilt weiterhin → zusätzliche Verschlüsselung empfohlen

**Empfohlene AWS Services**:
- **Compute**: AWS EC2 oder AWS Elastic Beanstalk
- **Database**: AWS RDS PostgreSQL (mit Encryption at Rest)
- **Storage**: AWS S3 (verschlüsselt für Backups/PDFs)
- **Email**: AWS SES (Simple Email Service)
- **Key Management**: AWS KMS
- **Monitoring**: AWS CloudWatch
- **Backup**: AWS Backup (automatisiert)

---

## 🏗️ TECHNISCHE ARCHITEKTUR

### Tech-Stack Empfehlung

#### **Frontend**
- **Framework**: React 18+ mit TypeScript
- **UI-Bibliothek**: Material-UI (MUI) v5
  - Warum? Professionelles Design, mobile-responsive, große Community
  - Empfehlung: MUI Dashboard Template als Basis nutzen
- **State Management**:
  - **Zustand** (leichtgewichtig) oder **Redux Toolkit** (bei komplexerer Logik)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Yup (Validierung)
- **HTTP Client**: Axios
- **PWA**: Service Workers für:
  - Offline-Funktionalität (begrenzt)
  - Push-Benachrichtigungen
  - App-Installation auf Mobilgeräten

#### **Backend**
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Sprache**: TypeScript
- **Architektur**: Layered Architecture (Clean Architecture)
  - **Controller Layer**: HTTP-Anfragen verarbeiten
  - **Service Layer**: Geschäftslogik
  - **Repository Layer**: Datenbankzugriff
  - **Models**: Datenstrukturen

#### **Datenbank**
- **Primär**: PostgreSQL 16
  - **Warum?**:
    - Bessere GDPR-Compliance (granulare Kontrolle)
    - Field-Level Encryption mit pgcrypto
    - ACID-Konformität
    - Bewährte Lösung für Healthcare-Daten
    - Ausgereifte Backup-Strategien

**Schema-Struktur** (Vereinfacht):
```
Users (Admin Anwendung, Admin Einrichtung)
├── id (UUID)
├── email (verschlüsselt)
├── password_hash (bcrypt)
├── role (enum)
├── institution_id (FK)
└── created_at

Institutions (Einrichtungen)
├── id (UUID)
├── name
├── address_street (verschlüsselt)
├── address_plz
├── address_city
├── verified
└── created_at

Patients (Patienten)
├── id (UUID)
├── institution_id (FK)
├── first_name (verschlüsselt)
├── last_name (verschlüsselt)
├── address (verschlüsselt)
├── unique_code (für Mitarbeiter-Login)
├── is_active
└── created_at

Workers (Mitarbeiter-Logins)
├── id (UUID)
├── patient_id (FK)
├── username
├── password_hash (bcrypt)
└── created_at

Products (Produkte)
├── id (UUID)
├── name_de
├── description_de
├── type (enum: gloves, disinfectant_liquid, disinfectant_wipes)
├── size (nur für Handschuhe: S/M/L/XL)
├── quantity_per_box
├── price_per_box
└── is_available

Orders (Bestellungen)
├── id (UUID)
├── institution_id (FK)
├── patient_id (FK)
├── status (enum: new, approved, shipped)
├── created_by_user_id (FK)
├── is_recurring
├── scheduled_date
└── created_at

Order_Items
├── id (UUID)
├── order_id (FK)
├── product_id (FK)
├── quantity
└── price_at_order

Invoices (Rechnungen)
├── id (UUID)
├── order_id (FK)
├── invoice_number (auto-increment)
├── total_amount
├── pdf_path (S3)
├── created_at
└── year
```

#### **Authentifizierung & Sicherheit**

**Strategie**: **Hybrid (JWT + HTTP-Only Cookies)**

**Warum?**:
- JWT für API-Zugriff (mobile-freundlich)
- HTTP-Only Cookies gegen XSS-Angriffe
- Refresh Tokens für längere Sessions

**Implementierung**:
1. **Registration Flow** (Admin Einrichtung):
   - Email + Passwort (min. 12 Zeichen)
   - Generiere 6-stelligen Code: `Math.floor(100000 + Math.random() * 900000)`
   - Speichere Code + Timestamp in DB
   - Sende Code via AWS SES
   - Code gültig: 5 Minuten
   - Unbegrenzte Versuche während Gültigkeit
   - Nach Verifikation: Account aktiv

2. **Login Flow**:
   - Email/Username + Passwort
   - Passwort mit bcrypt vergleichen (Salt Rounds: 10-12)
   - Bei Erfolg:
     - Generiere Access Token (JWT, gültig: 15 Min)
     - Generiere Refresh Token (JWT, gültig: 7 Tage)
     - Setze Tokens in HTTP-Only Cookies
   - Bei zu vielen Fehlversuchen: Rate Limiting (siehe unten)

3. **Password Reset**:
   - "Passwort vergessen" Link
   - Reset-Link per Email (gültig 30 Min)
   - Neues Passwort setzen

**Password Hashing**:
- **Bibliothek**: bcrypt
- **Salt Rounds**: 10-12
- **Niemals** Passwort-Hashes loggen oder exponieren

**JWT-Struktur**:
```json
{
  "userId": "uuid",
  "role": "admin_institution",
  "institutionId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Sicherheits-Middleware** (Express):
1. **Helmet**: HTTP-Header-Sicherheit
   ```javascript
   app.use(helmet());
   ```

2. **CORS**: Cross-Origin-Anfragen kontrollieren
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

3. **Rate Limiting**: Brute-Force-Schutz
   ```javascript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 Minuten
     max: 100, // Max 100 Anfragen
     message: 'Zu viele Anfragen, bitte später erneut versuchen.'
   });

   app.use('/api/', limiter);

   // Strengeres Limit für Login
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5,
     message: 'Zu viele Login-Versuche.'
   });

   app.use('/api/auth/login', loginLimiter);
   ```

4. **Input-Validierung**: Joi oder Zod für alle Eingaben

5. **SQL-Injection-Schutz**: Parametrisierte Queries (TypeORM/Prisma)

---

## 📧 EMAIL-SYSTEM (AWS SES)

### Setup

1. **AWS SES Sandbox verlassen**:
   - Support-Anfrage im AWS Support Center
   - Warte ~24 Stunden auf Genehmigung
   - Produktions-Zugriff erforderlich für unbegrenzte Empfänger

2. **Domain verifizieren**:
   - Domain in SES registrieren
   - DNS-Records (TXT/CNAME) hinzufügen
   - DKIM/SPF konfigurieren (bessere Zustellbarkeit)

3. **Email-Vorlagen** (Deutsch):

**Verifikations-Email**:
```
Betreff: Verifizieren Sie Ihre E-Mail-Adresse

Sehr geehrte/r [Name],

vielen Dank für Ihre Registrierung bei [Firmenname].

Ihr Verifizierungscode lautet: [123456]

Dieser Code ist 5 Minuten gültig.

Mit freundlichen Grüßen,
Ihr [Firmenname]-Team
```

**Neue Bestellung (für Admin Anwendung)**:
```
Betreff: Neue Bestellung eingegangen

Sehr geehrte/r [Admin Name],

eine neue Bestellung ist eingegangen.

Einrichtung: [Einrichtungsname]
Patient: [Patientenname]

Zur Bestellung: [Link zum Dashboard]

Mit freundlichen Grüßen,
Ihr System
```

**Bestellung genehmigt (für Admin Einrichtung)**:
```
Betreff: Bestellung wurde genehmigt

Sehr geehrte/r [Name],

Ihre Bestellung für Patient [Patientenname] wurde genehmigt und wird bearbeitet.

Bestelldetails: [Link]

Mit freundlichen Grüßen,
Ihr [Firmenname]-Team
```

**Reminder für automatische Bestellung**:
```
Betreff: Erinnerung: Geplante Bestellung bestätigen

Sehr geehrte/r [Name],

die folgenden geplanten Bestellungen stehen in 10 Tagen an:

- Patient: [Name 1]
- Patient: [Name 2]
- ...

Bitte bestätigen Sie die Bestellungen: [Link]

Mit freundlichen Grüßen,
Ihr [Firmenname]-Team
```

### Node.js-Implementierung (AWS SES)

```typescript
import AWS from 'aws-sdk';

AWS.config.update({
  region: 'eu-central-1', // Frankfurt
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export async function sendVerificationEmail(
  toEmail: string,
  code: string
): Promise<void> {
  const params = {
    Source: process.env.SENDER_EMAIL, // z.B. noreply@ihrefirma.de
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Subject: {
        Data: 'Verifizieren Sie Ihre E-Mail-Adresse',
        Charset: 'UTF-8'
      },
      Body: {
        Text: {
          Data: `Ihr Verifizierungscode lautet: ${code}\n\nDieser Code ist 5 Minuten gültig.`,
          Charset: 'UTF-8'
        },
        Html: {
          Data: `<p>Ihr Verifizierungscode lautet: <strong>${code}</strong></p><p>Dieser Code ist 5 Minuten gültig.</p>`,
          Charset: 'UTF-8'
        }
      }
    }
  };

  await ses.sendEmail(params).promise();
}
```

---

## 🔔 PUSH-BENACHRICHTIGUNGEN (PWA)

### Progressive Web App (PWA) Setup

**Warum PWA?**:
- ✅ Eine Anwendung für Desktop + Mobile
- ✅ Installation auf Homescreen möglich
- ✅ Push-Benachrichtigungen ohne App Store
- ✅ Offline-Funktionalität (Service Worker)
- ✅ Einfacher als native Apps

**Browser-Support**:
- ✅ Chrome/Edge/Opera (Desktop + Android)
- ✅ Safari (iOS 16.4+) - nur nach Installation
- ✅ Firefox (Desktop + Android)

### Implementierung

1. **Service Worker registrieren**:
```javascript
// public/service-worker.js
self.addEventListener('push', (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: { url: data.url }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

2. **Push-Abonnement anfordern** (Frontend):
```javascript
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
  });

  // Subscription an Backend senden
  await axios.post('/api/push/subscribe', subscription);
}
```

3. **Push von Backend senden**:
```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:info@ihrefirma.de',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(
  subscription: PushSubscription,
  title: string,
  body: string,
  url: string
) {
  const payload = JSON.stringify({ title, body, url });

  await webpush.sendNotification(subscription, payload);
}
```

**Benachrichtigungs-Trigger**:
- Neue Bestellung → Admin Anwendung
- Bestellung genehmigt → Admin Einrichtung
- Reminder 10 Tage vor automatischer Bestellung → Admin Einrichtung

---

## 📅 AUTOMATISIERUNG & SCHEDULER

### Automatische Bestellungen

**Use Case**:
- Admin Einrichtung plant Bestellung für Patient
- Datum: z.B. jeden 15. des Monats
- 10 Tage vorher: Reminder-Email
- Am Datum: Bestellung wird automatisch versendet

### Implementierung mit node-cron

**Bibliothek**: `node-cron` (einfach, ausreichend für <100 Kunden)

**Alternative**: Für größere Skalierung → **Bull** + **Redis** (datenbank-basiert, überlebt Crashes)

```typescript
import cron from 'node-cron';
import { getScheduledOrders, sendOrder } from './services/orderService';
import { sendReminderEmail } from './services/emailService';

// Täglich um 09:00 Uhr (CET) prüfen
cron.schedule('0 9 * * *', async () => {
  console.log('Prüfe geplante Bestellungen...');

  const today = new Date();
  const in10Days = new Date(today);
  in10Days.setDate(today.getDate() + 10);

  // Reminder versenden (10 Tage vorher)
  const reminders = await getScheduledOrders(in10Days);
  for (const order of reminders) {
    await sendReminderEmail(order.institution, order.patients);
  }

  // Automatische Bestellungen ausführen
  const todayOrders = await getScheduledOrders(today);
  for (const order of todayOrders) {
    if (order.confirmed) {
      await sendOrder(order.id);
    }
  }
}, {
  timezone: 'Europe/Berlin'
});
```

**Wichtig**:
- Fehlerbehandlung implementieren
- Logs schreiben (CloudWatch)
- Monitoring aufsetzen (Cronitor oder ähnlich)
- Bei Crash: Alle geplanten Jobs gehen verloren → Bull/Redis erwägen

---

## 🧾 FAKTURIERUNG (PDF-Generierung)

### Kleinunternehmerregelung §19 UStG

**Wichtig**:
- ❌ **KEINE MwSt/USt ausweisen oder berechnen**
- ✅ Pflichthinweis auf Rechnung:
  - **"Gemäß § 19 UStG wird keine Umsatzsteuer berechnet"**
  - oder: **"Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG"**

**Umsatzgrenze**:
- Bis 22.000€/Jahr (ab 2025: 25.000€/Jahr prüfen)
- Bei Überschreitung: USt-pflichtig ab nächstem Jahr

### Pflichtangaben auf Rechnung

Gemäß §14 UStG:
1. ✅ Vollständiger Name und Anschrift des Leistenden (Ihre Firma)
2. ✅ Vollständiger Name und Anschrift des Leistungsempfängers (Admin Einrichtung)
3. ✅ Steuernummer oder Kleinunternehmer-ID-Nummer
4. ✅ Rechnungsnummer (fortlaufend, eindeutig)
5. ✅ Rechnungsdatum
6. ✅ Lieferdatum oder Leistungszeitpunkt
7. ✅ Menge und Art der gelieferten Gegenstände (Produktname, Menge)
8. ✅ Patient, für den die Lieferung erfolgt
9. ✅ Einzelpreise und Gesamtbetrag
10. ✅ Kleinunternehmer-Hinweis (§19 UStG)

**Aufbewahrungspflicht**: 10 Jahre (GoBD-konform)

### PDF-Generierung mit Node.js

**Empfohlene Bibliothek**: `pdfkit` oder `@h1dd3nsn1p3r/pdf-invoice`

```typescript
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export async function generateInvoice(order: Order): Promise<string> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const fileName = `rechnung-${order.invoice_number}.pdf`;
  const filePath = path.join('/tmp', fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text('[Ihr Firmenname]', 50, 50);
  doc.fontSize(10).text('[Ihre Adresse]', 50, 75);
  doc.text('[PLZ Stadt]', 50, 90);
  doc.text('Steuernummer: [Ihre Steuernummer]', 50, 105);

  // Empfänger
  doc.fontSize(12).text('Rechnung an:', 50, 150);
  doc.fontSize(10)
     .text(order.institution.name, 50, 170)
     .text(order.institution.address, 50, 185);

  // Rechnungsdetails
  doc.fontSize(10)
     .text(`Rechnungsnummer: ${order.invoice_number}`, 350, 150)
     .text(`Rechnungsdatum: ${new Date().toLocaleDateString('de-DE')}`, 350, 165)
     .text(`Lieferdatum: ${order.shipped_date.toLocaleDateString('de-DE')}`, 350, 180);

  // Patient
  doc.fontSize(10).text(`Patient: ${order.patient.name}`, 50, 230);

  // Tabelle
  doc.fontSize(12).text('Pos.', 50, 270);
  doc.text('Artikel', 100, 270);
  doc.text('Menge', 350, 270);
  doc.text('Preis', 450, 270);

  let y = 290;
  let total = 0;

  order.items.forEach((item, index) => {
    doc.fontSize(10)
       .text(index + 1, 50, y)
       .text(item.product.name, 100, y)
       .text(item.quantity, 350, y)
       .text(`${item.price.toFixed(2)} €`, 450, y);
    total += item.price * item.quantity;
    y += 20;
  });

  // Summe
  doc.fontSize(12).text('Gesamtsumme:', 350, y + 20);
  doc.text(`${total.toFixed(2)} €`, 450, y + 20);

  // Kleinunternehmer-Hinweis
  doc.fontSize(9)
     .text('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 50, y + 60);

  doc.end();

  // Warte auf Fertigstellung
  await new Promise((resolve) => doc.on('end', resolve));

  // Upload zu S3
  const fileContent = fs.readFileSync(filePath);
  const s3Key = `invoices/${order.id}/${fileName}`;

  await s3.upload({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: 'application/pdf',
    ServerSideEncryption: 'AES256'
  }).promise();

  // Lokale Datei löschen
  fs.unlinkSync(filePath);

  return s3Key; // Speichere in DB
}
```

**Automatische Generierung**:
- Trigger: Admin Anwendung setzt Bestellung auf "Versendet"
- Rechnung wird generiert und in S3 gespeichert
- Admin Einrichtung kann PDF herunterladen

---

## 🌐 PLZ-VALIDIERUNG & ADRESSVERIFIKATION

### Anforderungen
- Validierung deutscher Postleitzahlen (PLZ: 5 Ziffern)
- Format-Check für Straße, Stadt
- Adresse muss vollständig sein (Straße + Hausnummer, PLZ, Stadt)

### Empfohlene Lösung

**Option 1: OpenPLZ API** (kostenlos, open source)
- API für Deutschland, Österreich, Schweiz, Liechtenstein
- REST API
- Keine Registrierung nötig

```typescript
import axios from 'axios';

interface PlzValidationResult {
  valid: boolean;
  city?: string;
}

export async function validatePlz(plz: string): Promise<PlzValidationResult> {
  // Format-Check
  if (!/^\d{5}$/.test(plz)) {
    return { valid: false };
  }

  try {
    const response = await axios.get(
      `https://openplzapi.org/de/Localities?postalCode=${plz}`
    );

    if (response.data.length > 0) {
      return {
        valid: true,
        city: response.data[0].name
      };
    }

    return { valid: false };
  } catch (error) {
    console.error('PLZ-Validierung fehlgeschlagen:', error);
    return { valid: false };
  }
}
```

**Option 2: Regex-Validierung** (ohne API, schneller)
```typescript
export function validatePlzFormat(plz: string): boolean {
  return /^\d{5}$/.test(plz);
}

export function validateAddress(address: {
  street: string;
  plz: string;
  city: string;
}): string[] {
  const errors: string[] = [];

  if (!address.street || address.street.length < 3) {
    errors.push('Straße muss mindestens 3 Zeichen lang sein.');
  }

  if (!validatePlzFormat(address.plz)) {
    errors.push('PLZ muss 5 Ziffern enthalten.');
  }

  if (!address.city || address.city.length < 2) {
    errors.push('Stadt muss mindestens 2 Zeichen lang sein.');
  }

  return errors;
}
```

**Empfehlung**:
- Für Beta: Regex-Validierung (schneller, keine externe Abhängigkeit)
- Für Production: OpenPLZ API als zusätzliche Validierung (bessere UX)

---

## 🎨 UI/UX DESIGN - MOBILE-FIRST

### Design-Prinzipien für Healthcare B2B

1. **Klarheit & Einfachheit**:
   - Große, lesbare Schriftarten (min. 16px)
   - Viel Weißraum (reduziert Stress)
   - Klare visuelle Hierarchie
   - Intuitive Navigation

2. **Mobile-First**:
   - Responsive Design (Mobile → Tablet → Desktop)
   - Touch-freundliche Buttons (min. 44x44px)
   - Große Tap-Targets
   - Schnelle Ladezeiten

3. **Accessibility (WCAG 2.1)**:
   - Hoher Kontrast (min. 4.5:1)
   - Keyboard-Navigation
   - Screen-Reader-freundlich
   - Fehlerhinweise klar & verständlich

4. **Beruhigendes Design**:
   - Sanfte Farben (Blau/Grün für Vertrauen)
   - Konsistente Animationen (300ms Übergänge)
   - Klare Statusanzeigen (Icons + Text)

### Dashboard-Layout

**Admin Anwendung Dashboard**:
```
┌─────────────────────────────────────────┐
│ [Logo]  Admin Dashboard      [Profil]   │
├─────────────────────────────────────────┤
│                                          │
│  📊 Statistiken                          │
│  ├─ Bestellungen heute: 5                │
│  ├─ Neue Einrichtungen: 2                │
│  └─ Umsatz Monat: 12.450 €              │
│                                          │
│  🏥 Einrichtungen (Monat: Mai 2025)      │
│  ┌────────────────┬────────────────┐    │
│  │ Pflegeheim A   │ Ambulante B    │    │
│  │ 3 Patienten    │ 5 Patienten    │    │
│  │ ⚠️ 1 neue Best. │ ✓ Alles OK     │    │
│  └────────────────┴────────────────┘    │
│  ┌────────────────┬────────────────┐    │
│  │ ...            │ ...            │    │
│  └────────────────┴────────────────┘    │
│                                          │
│  📦 Neue Bestellungen (5)                │
│  ├─ Pflegeheim A - Patient M. Müller    │
│  │  └─ [Details] [Genehmigen]           │
│  └─ ...                                  │
└─────────────────────────────────────────┘
```

**Admin Einrichtung Dashboard**:
```
┌─────────────────────────────────────────┐
│ [Logo]  Meine Patienten      [Profil]   │
├─────────────────────────────────────────┤
│                                          │
│  🔍 [Suche nach Patient...]              │
│                                          │
│  👥 Patienten (24)                       │
│  ┌──────────────────────────────────┐   │
│  │ 👤 Müller, Maria                  │   │
│  │    📍 Musterstraße 12, 10115 Berlin │
│  │    📊 Letzte Best.: 12.05.2025    │   │
│  │    [Neue Bestellung] [Wiederholen]│   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 👤 Schmidt, Hans                  │   │
│  │    ...                            │   │
│  └──────────────────────────────────┘   │
│                                          │
│  [+ Neuen Patienten hinzufügen]          │
└─────────────────────────────────────────┘
```

**Mitarbeiter-Ansicht** (Einfachste):
```
┌─────────────────────────────────────────┐
│ [Logo]  Patient: Maria Müller           │
├─────────────────────────────────────────┤
│                                          │
│  📦 Neue Bestellung erstellen            │
│                                          │
│  Handschuhe (Nitril):                    │
│  ☐ Größe S  [0] Kartons                 │
│  ☐ Größe M  [0] Kartons                 │
│  ☐ Größe L  [0] Kartons                 │
│  ☐ Größe XL [0] Kartons                 │
│                                          │
│  Desinfektionsmittel:                    │
│  ☐ Flüssigkeit (500ml) [0] Flaschen     │
│  ☐ Tücher (100 Stück) [0] Packungen     │
│                                          │
│  [Bestellung absenden]                   │
│                                          │
│  📜 Frühere Bestellungen (3)             │
│  └─ 12.05.2025 - 2x Handschuhe M, 1x... │
└─────────────────────────────────────────┘
```

### Material-UI Theme (Beispiel)

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Beruhigendes Blau
    },
    secondary: {
      main: '#4caf50', // Grün für Erfolg
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16, // Größere Basisschrift
    h1: { fontSize: '2rem', fontWeight: 500 },
    h2: { fontSize: '1.75rem', fontWeight: 500 },
    button: { textTransform: 'none' }, // Keine Großbuchstaben
  },
  shape: {
    borderRadius: 8, // Weichere Ecken
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // Touch-freundlich
        },
      },
    },
  },
});
```

### Empfohlene MUI-Komponenten

- **AppBar**: Top-Navigation
- **Drawer**: Sidebar (Desktop), Hamburger-Menü (Mobile)
- **Card**: Für Patienten/Bestellungen/Einrichtungen
- **DataGrid** (MUI X): Tabellen mit Sortierung/Filterung
- **Chip**: Für Status-Badges (Neu, Genehmigt, Versendet)
- **Badge**: Für Benachrichtigungs-Counter
- **Snackbar**: Für Toast-Notifications
- **Dialog**: Für Bestätigungen/Modals
- **Stepper**: Für mehrstufige Formulare

### Performance-Optimierungen

1. **Code-Splitting**:
   - React.lazy() für Routes
   - Separate Bundles für Admin/Einrichtung/Mitarbeiter

2. **Lazy Loading**:
   - Bilder: `loading="lazy"`
   - Infinite Scroll für große Listen

3. **Caching**:
   - React Query für Server-State
   - Service Worker für Assets

4. **Bildoptimierung**:
   - WebP-Format
   - Responsive Images (srcset)

---

## 🧪 WORKFLOW & FEATURES

### 1. Registrierung & Onboarding (Admin Einrichtung)

**Flow**:
1. User besucht `/registrieren`
2. Formular ausfüllen:
   - Email (Validierung: gültiges Format)
   - Firmenname (min. 2 Zeichen)
   - Adresse:
     - Straße + Hausnummer
     - PLZ (5 Ziffern, OpenPLZ-Validierung)
     - Stadt
   - Passwort (min. 12 Zeichen, 1 Großbuchstabe, 1 Ziffer, 1 Sonderzeichen)
   - Passwort wiederholen (muss übereinstimmen)
3. Submit → Backend:
   - Validierung
   - Prüfe: Email bereits registriert?
   - Generiere 6-stelligen Code
   - Speichere: Email, Hash(Passwort), Code, Timestamp
   - Sende Code via AWS SES
4. User wird zu `/verifizieren` weitergeleitet
5. User gibt 6-stelligen Code ein
   - Validierung: Code korrekt? Noch gültig (<5 Min)?
   - Bei Erfolg: Account aktiviert
   - Bei Ablauf: "Neuen Code anfordern"-Button
6. Weiterleitung zu `/login`
7. Optional: Admin Anwendung bekommt Benachrichtigung über neuen User

### 2. Patienten-Management (Admin Einrichtung)

**Patienten hinzufügen**:
1. Klick auf "Neuen Patienten hinzufügen"
2. Formular:
   - Vorname
   - Nachname
   - Adresse (Straße, PLZ, Stadt)
3. Submit → Backend:
   - Daten verschlüsseln (pgcrypto)
   - Patient in DB speichern
   - **Optional**: Automatisch Mitarbeiter-Login generieren
4. Success: Patient erscheint in Liste

**Mitarbeiter-Login generieren**:
1. Bei Patient auf "Login-Daten generieren" klicken
2. Backend generiert:
   - Username: `{VornameKurz}{NachnameKurz}{Random}` (z.B. `Milam12`)
   - Password: Zufällig (z.B. `nu38d83hw`)
   - Hash(Password) speichern
3. Anzeige im Modal:
   ```
   Login-Daten für Patient Maria Müller:

   Benutzername: Milam12
   Passwort: nu38d83hw

   [Kopieren] [Drucken] [Per Email senden]

   ⚠️ Diese Daten werden nicht erneut angezeigt!
   ```
4. Admin Einrichtung gibt Daten an Mitarbeiter weiter

**Login-Daten regenerieren**:
- Button "Neue Login-Daten generieren"
- Alte werden ungültig
- Neue werden generiert und angezeigt

**Patient deaktivieren**:
- Button "Patient deaktivieren"
- Bestätigung
- Patient wird `is_active = false`
- Mitarbeiter-Logins werden deaktiviert
- Alte Bestellungen bleiben sichtbar (Archiv)

### 3. Bestellprozess

#### 3a. Neue Bestellung (Admin Einrichtung oder Mitarbeiter)

**Flow**:
1. Patient auswählen (Admin Einrichtung) oder automatisch (Mitarbeiter)
2. Produktauswahl:
   - Handschuhe S: [_] Kartons (50 Stück/Karton) - 15,99 €/Karton
   - Handschuhe M: [_] Kartons - 15,99 €
   - Handschuhe L: [_] Kartons - 15,99 €
   - Handschuhe XL: [_] Kartons - 15,99 €
   - Desinfektionsmittel (500ml): [_] Flaschen - 8,50 €
   - Desinfektionstücher (100 Stück): [_] Packungen - 6,99 €
3. Mindestens 1 Produkt muss ausgewählt sein (Validierung)
4. Submit → Backend:
   - Duplizierungsschutz (z.B. Token oder Debounce)
   - Bestellung erstellen (`status = 'new'`)
   - Order_Items erstellen
5. Benachrichtigungen:
   - Email an Admin Anwendung
   - Push-Notification an Admin Anwendung
6. Success-Nachricht: "Bestellung wurde erfolgreich abgesendet."

#### 3b. Bestellung wiederholen

**Flow**:
1. Bei Patient auf "Wiederholen" klicken
2. Letzte Bestellung wird geladen (Produkte + Mengen vorausgefüllt)
3. User kann anpassen
4. Submit (wie 3a)

#### 3c. Automatische Bestellung planen

**Flow**:
1. Bei Patient auf "Automatische Bestellung" klicken
2. Formular:
   - Produkte auswählen (wie 3a)
   - **Datum wählen**: z.B. 15.05.2025
   - Option: "Monatlich wiederholen" ☐
3. Submit → Backend:
   - Bestellung erstellen (`status = 'scheduled'`, `scheduled_date = 15.05.2025`, `is_recurring = true/false`)
4. **10 Tage vorher** (05.05.2025, 09:00 Uhr):
   - Cron-Job sendet Reminder-Email
   - Liste aller geplanten Bestellungen für diesen Tag
   - Link: "Bestellungen bestätigen"
5. Admin Einrichtung kann:
   - Bestätigen (alle oder einzeln)
   - Bearbeiten
   - Stornieren
6. **Am geplanten Datum** (15.05.2025, 09:00 Uhr):
   - Cron-Job prüft: Bestätigt?
   - Wenn ja: Bestellung wird automatisch versendet (`status = 'new'`)
   - Admin Anwendung bekommt Benachrichtigung

### 4. Bestellgenehmigung (Admin Anwendung)

**Dashboard-Ansicht**:
- Einrichtungs-Karten
- Rotes Badge (⚠️ 1) bei neuer Bestellung
- Klick auf Karte → Detailansicht

**Detailansicht**:
```
Pflegeheim Sonnenschein
────────────────────────
📍 Musterstraße 12, 10115 Berlin
📧 info@sonnenschein.de

🔔 Neue Bestellungen (1):

┌─────────────────────────────────────────┐
│ Bestellung #2025-042                     │
│ Patient: Maria Müller                    │
│ Datum: 18.05.2025, 14:32 Uhr            │
│                                          │
│ Artikel:                                 │
│ - 2x Handschuhe M (à 15,99 €)           │
│ - 1x Desinfektionsmittel (à 8,50 €)     │
│                                          │
│ Gesamt: 40,48 €                          │
│                                          │
│ [Genehmigen] [Ablehnen]                  │
└─────────────────────────────────────────┘
```

**Nach Genehmigung**:
- Status: `new` → `approved`
- Email an Admin Einrichtung: "Bestellung genehmigt"
- Push-Notification an Admin Einrichtung
- Badge verschwindet

**Bestellung als "Versendet" markieren**:
- Button in Admin Dashboard
- Status: `approved` → `shipped`
- **Automatisch**: Rechnung generieren (PDF)
- PDF zu S3 hochladen
- Invoice-Eintrag in DB
- Email an Admin Einrichtung: "Bestellung versendet"

### 5. Faktura-Download (Admin Einrichtung)

**Ansicht**:
- Dashboard → "Rechnungen"
- Liste aller Rechnungen:
  ```
  Rechnungsnr.  Datum         Patient          Betrag    Download
  2025-001      12.05.2025    Maria Müller     40,48 €   [PDF ⬇]
  2025-002      13.05.2025    Hans Schmidt     28,99 €   [PDF ⬇]
  ```
- Klick auf [PDF ⬇] → Signierte S3-URL generieren → Download

### 6. Statistiken

**Admin Anwendung**:
- Umsatz pro Monat (Diagramm)
- Top-Einrichtungen (nach Bestellmenge)
- Top-Produkte
- Neue Einrichtungen (letzte 30 Tage)

**Admin Einrichtung**:
- Bestellungen pro Patient (letzte 6 Monate)
- Gesamtausgaben pro Monat
- Häufigste Produkte

---

## 🚀 DEPLOYMENT & INFRASTRUKTUR

### AWS-Architektur (Frankfurt Region)

```
┌─────────────────────────────────────────────────────────┐
│                       Internet                           │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                   AWS Route 53 (DNS)                     │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│        AWS CloudFront (CDN) + SSL Certificate            │
│               [React PWA Frontend]                       │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│     AWS Elastic Load Balancer (Application LB)          │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│   AWS EC2 / Elastic Beanstalk (Node.js Backend)         │
│   - Express.js API                                       │
│   - Auto Scaling Group (min 1, max 3)                   │
└─────────┬───────────────────────────┬───────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐   ┌─────────────────────────────┐
│  AWS RDS PostgreSQL │   │     AWS S3 Buckets          │
│  - Multi-AZ         │   │  - Rechnungen (PDFs)        │
│  - Encrypted        │   │  - Backups                  │
│  - Auto Backup      │   │  - Logs                     │
└─────────────────────┘   └─────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                   AWS Backup (Weekly)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Weitere Services:                                       │
│  - AWS SES (Email)                                       │
│  - AWS KMS (Key Management)                              │
│  - AWS CloudWatch (Monitoring & Logs)                    │
│  - AWS Secrets Manager (Credentials)                     │
│  - AWS Certificate Manager (SSL)                         │
└─────────────────────────────────────────────────────────┘
```

### Deployment-Strategie

**Option 1: AWS Elastic Beanstalk** (Empfohlen für Beta)
- ✅ Einfaches Deployment (ZIP hochladen oder Git)
- ✅ Auto-Scaling integriert
- ✅ Load Balancer integriert
- ✅ Monitoring integriert
- ✅ Wenig Konfiguration

**Option 2: Docker + ECS** (Für Production)
- Mehr Kontrolle
- Container-basiert
- CI/CD mit GitHub Actions / GitLab CI

**Frontend-Hosting**:
- **AWS S3** + **CloudFront** (CDN)
  - React Build zu S3 hochladen
  - CloudFront für globale Verfügbarkeit + SSL
  - Sehr günstig (<5€/Monat)

### CI/CD-Pipeline (Beispiel mit GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm test

      - name: Deploy to Elastic Beanstalk
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: med-weg-api
          environment_name: med-weg-api-prod
          region: eu-central-1
          version_label: ${{ github.sha }}
          deployment_package: backend.zip

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install & Build
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@v0.5.1
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: 'eu-central-1'
          SOURCE_DIR: 'frontend/build'

      - name: Invalidate CloudFront Cache
        uses: chetan/invalidate-cloudfront-action@v2
        env:
          DISTRIBUTION: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
          PATHS: '/*'
          AWS_REGION: 'eu-central-1'
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Umgebungsvariablen (.env)

**Backend**:
```env
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=postgresql://user:pass@rds-instance.amazonaws.com:5432/medweg
DB_SSL=true

# JWT
JWT_SECRET=<your-secret-key>
JWT_REFRESH_SECRET=<your-refresh-secret>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=medweg-invoices
SES_SENDER_EMAIL=noreply@ihrefirma.de

# Encryption
ENCRYPTION_KEY=<your-encryption-key>

# PWA Push
VAPID_PUBLIC_KEY=<your-vapid-public>
VAPID_PRIVATE_KEY=<your-vapid-private>

# Frontend URL (für CORS)
FRONTEND_URL=https://ihrefirma.de
```

**Frontend** (.env.production):
```env
REACT_APP_API_URL=https://api.ihrefirma.de
REACT_APP_VAPID_PUBLIC_KEY=<your-vapid-public>
```

### Monitoring & Logging

**AWS CloudWatch**:
- Application Logs (Express)
- Error Tracking
- Performance Metrics (CPU, Memory, Response Time)
- Custom Metrics (Bestellungen/Tag, etc.)

**Alerts einrichten**:
- High Error Rate (>5% in 5 Min)
- High Response Time (>2s avg)
- Database Connection Errors
- Cron-Job Failures

**Tools**:
- **Sentry** (optional): Error Tracking mit Context
- **Datadog** (optional): Erweiterte Metriken

---

## 🧪 TESTING-STRATEGIE

### Test-Pyramide

```
       /\
      /  \      E2E Tests (5%)
     /────\     Integration Tests (15%)
    /──────\    Unit Tests (80%)
   /────────\
```

### 1. Unit Tests

**Backend** (Jest + Supertest):
```typescript
// services/orderService.test.ts
import { createOrder } from './orderService';
import { db } from '../db';

jest.mock('../db');

describe('OrderService', () => {
  it('should create order with valid data', async () => {
    const mockOrder = {
      institutionId: 'uuid',
      patientId: 'uuid',
      items: [{ productId: 'uuid', quantity: 2 }]
    };

    const result = await createOrder(mockOrder);

    expect(result).toHaveProperty('id');
    expect(result.status).toBe('new');
  });

  it('should throw error with empty items', async () => {
    const mockOrder = {
      institutionId: 'uuid',
      patientId: 'uuid',
      items: []
    };

    await expect(createOrder(mockOrder)).rejects.toThrow(
      'Mindestens ein Produkt erforderlich'
    );
  });
});
```

**Frontend** (Jest + React Testing Library):
```typescript
// components/PatientCard.test.tsx
import { render, screen } from '@testing-library/react';
import PatientCard from './PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: '1',
    firstName: 'Maria',
    lastName: 'Müller',
    address: 'Musterstraße 12, 10115 Berlin'
  };

  it('renders patient name', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('Müller, Maria')).toBeInTheDocument();
  });

  it('shows new order button', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByRole('button', { name: /neue bestellung/i }))
      .toBeInTheDocument();
  });
});
```

### 2. Integration Tests

**API-Tests** (Supertest):
```typescript
// routes/orders.integration.test.ts
import request from 'supertest';
import app from '../app';
import { seedDatabase, clearDatabase } from '../test-utils';

describe('POST /api/orders', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('creates order when authenticated', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: 'uuid',
        items: [{ productId: 'uuid', quantity: 2 }]
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('orderId');
  });
});
```

### 3. E2E-Tests (Playwright oder Cypress)

```typescript
// e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Admin Einrichtung can create order', async ({ page }) => {
  // Login
  await page.goto('https://app.ihrefirma.de/login');
  await page.fill('[name="email"]', 'admin@einrichtung.de');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to patient
  await expect(page).toHaveURL('/dashboard');
  await page.click('text=Maria Müller');

  // Create order
  await page.click('text=Neue Bestellung');
  await page.fill('[name="quantity-gloves-m"]', '2');
  await page.click('button:has-text("Bestellung absenden")');

  // Verify success
  await expect(page.locator('.success-message')).toContainText(
    'Bestellung wurde erfolgreich abgesendet'
  );
});
```

### Test-Coverage-Ziel

- Unit Tests: **>80%**
- Integration Tests: **>60%**
- E2E Tests: Kritische User Flows (Login, Bestellung, Genehmigung)

---

## 📊 KOSTENABSCHÄTZUNG (AWS)

**Annahmen**: 100 Kunden, 500 Bestellungen/Monat, 50.000 Page Views/Monat

| Service | Konfiguration | Kosten/Monat |
|---------|--------------|--------------|
| **EC2** (t3.small) | 1 Instance, 24/7 | ~17€ |
| **RDS PostgreSQL** (db.t3.micro) | Single-AZ, 20GB | ~20€ |
| **S3** | 10GB Storage + Requests | ~1€ |
| **CloudFront** | 50GB Transfer | ~5€ |
| **SES** | 10.000 Emails | ~1€ |
| **Route 53** | Hosted Zone | ~0,50€ |
| **Backups** (AWS Backup) | 50GB/Woche | ~2€ |
| **CloudWatch** | Logs + Monitoring | ~5€ |
| **KMS** | 1 Key | ~1€ |
| **Elastic Load Balancer** | Application LB | ~20€ |
| **Certificate Manager** | SSL (kostenlos) | 0€ |
| **TOTAL** | | **~72,50€/Monat** |

**Bei Wachstum** (1000 Kunden):
- EC2: t3.medium (2 Instances) → ~80€
- RDS: db.t3.small (Multi-AZ) → ~80€
- **Total**: ~200-250€/Monat

**Kosten sparen**:
- Reserved Instances (bis -40%)
- Savings Plans
- Spot Instances für Dev/Staging

---

## 📝 PROJEKTSTRUKTUR (Empfohlen)

```
med-weg/
├── backend/
│   ├── src/
│   │   ├── controllers/        # HTTP-Handler
│   │   │   ├── authController.ts
│   │   │   ├── orderController.ts
│   │   │   └── ...
│   │   ├── services/           # Business Logic
│   │   │   ├── orderService.ts
│   │   │   ├── emailService.ts
│   │   │   └── ...
│   │   ├── repositories/       # Database Access
│   │   │   ├── orderRepository.ts
│   │   │   └── ...
│   │   ├── models/             # TypeScript Interfaces
│   │   │   ├── Order.ts
│   │   │   ├── User.ts
│   │   │   └── ...
│   │   ├── middleware/         # Express Middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── routes/             # API Routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── orders.routes.ts
│   │   │   └── index.ts
│   │   ├── utils/              # Helper Functions
│   │   │   ├── encryption.ts
│   │   │   ├── validation.ts
│   │   │   └── ...
│   │   ├── config/             # Configuration
│   │   │   ├── database.ts
│   │   │   ├── aws.ts
│   │   │   └── ...
│   │   ├── cron/               # Cron Jobs
│   │   │   └── scheduler.ts
│   │   └── app.ts              # Express App
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json       # PWA Manifest
│   │   ├── service-worker.js   # Service Worker
│   │   └── icons/
│   ├── src/
│   │   ├── components/         # Reusable Components
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   ├── PatientCard.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── ...
│   │   ├── pages/              # Page Components
│   │   │   ├── Dashboard/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── InstitutionDashboard.tsx
│   │   │   │   └── WorkerView.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ...
│   │   ├── hooks/              # Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useOrders.ts
│   │   │   └── ...
│   │   ├── services/           # API Calls
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   └── orderService.ts
│   │   ├── store/              # State Management (Zustand/Redux)
│   │   │   ├── authStore.ts
│   │   │   └── ...
│   │   ├── utils/              # Helper Functions
│   │   │   ├── validation.ts
│   │   │   └── formatting.ts
│   │   ├── theme/              # MUI Theme
│   │   │   └── theme.ts
│   │   ├── types/              # TypeScript Types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                       # Dokumentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD Pipeline
│
├── docker-compose.yml          # Für lokale Entwicklung
├── README.md
└── .gitignore
```

---

## 🎯 DEVELOPMENT ROADMAP (Beta → Production)

### Phase 1: Beta-MVP (8-12 Wochen)

**Woche 1-2: Setup & Grundlagen**
- [ ] Projekt-Setup (Frontend + Backend)
- [ ] AWS-Account einrichten (Frankfurt Region)
- [ ] PostgreSQL-Schema erstellen
- [ ] Basic Auth implementieren (JWT + Bcrypt)
- [ ] MUI-Theme & Layout-Grundgerüst

**Woche 3-4: Benutzerverwaltung**
- [ ] Registrierung Admin Einrichtung
- [ ] Email-Verifikation (AWS SES)
- [ ] Login/Logout (alle Rollen)
- [ ] Admin Anwendung: Einrichtungen-Übersicht
- [ ] Password Reset

**Woche 5-6: Patienten-Management**
- [ ] Patienten hinzufügen/bearbeiten/deaktivieren
- [ ] Field-Level Encryption (pgcrypto)
- [ ] Mitarbeiter-Login generieren
- [ ] PLZ-Validierung (OpenPLZ API)

**Woche 7-8: Bestellsystem**
- [ ] Produktkatalog (CRUD für Admin Anwendung)
- [ ] Bestellung erstellen (Admin Einrichtung + Mitarbeiter)
- [ ] Bestellung wiederholen
- [ ] Bestellgenehmigung (Admin Anwendung)

**Woche 9-10: Automatisierung & PDF**
- [ ] Automatische Bestellungen (Scheduling)
- [ ] Cron-Jobs (node-cron)
- [ ] Reminder-System
- [ ] PDF-Faktura-Generierung
- [ ] S3 Upload

**Woche 11-12: PWA & Testing**
- [ ] PWA-Setup (Service Worker, Manifest)
- [ ] Push-Benachrichtigungen
- [ ] Unit Tests (>70% Coverage)
- [ ] Integration Tests
- [ ] Beta-Deployment (AWS Elastic Beanstalk)
- [ ] Beta-Testing mit 5-10 Kunden

### Phase 2: Production-Ready (4-6 Wochen)

**Woche 13-14: Sicherheit & Compliance**
- [ ] Security Audit (Helmet, CORS, Rate Limiting)
- [ ] GDPR-Dokumentation (Datenschutzerklärung, AGB)
- [ ] Penetration Testing
- [ ] Backup-Strategie testen
- [ ] DSFA durchführen

**Woche 15-16: Performance & UX**
- [ ] Performance-Optimierung (Lazy Loading, Caching)
- [ ] E2E-Tests (kritische Flows)
- [ ] UI-Polish (Animationen, Feedback)
- [ ] Mobile-Testing (iOS, Android)
- [ ] Monitoring & Alerts (CloudWatch)

**Woche 17-18: Launch-Vorbereitung**
- [ ] Dokumentation vervollständigen
- [ ] Onboarding-Material (Video-Tutorials?)
- [ ] Support-System einrichten (Email? Ticketing?)
- [ ] Production-Deployment
- [ ] DNS-Setup & SSL
- [ ] Launch! 🚀

### Phase 3: Post-Launch (laufend)

**Erste 3 Monate**:
- [ ] User-Feedback sammeln
- [ ] Bugs fixen
- [ ] Performance monitoren
- [ ] Support leisten

**Erweiterungen** (nach Bedarf):
- Multi-Sprachen-Support (Englisch?)
- Mobile Apps (React Native?)
- Erweiterte Statistiken
- Inventar-Management
- API für Drittanbieter
- Automatische Zahlungsabwicklung

---

## ⚠️ RISIKEN & MITIGATIONEN

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| **GDPR-Verstoß** | Mittel | Hoch | Legal Review, DSFA, regelmäßige Audits |
| **Datenverlust** | Gering | Hoch | Automatische Backups, Multi-AZ RDS, Disaster Recovery Plan |
| **AWS-Kosten explodieren** | Mittel | Mittel | Budget Alerts, Reserved Instances, Monitoring |
| **Sicherheitslücken** | Mittel | Hoch | Security Audit, Penetration Testing, Updates |
| **Performance-Probleme** | Gering | Mittel | Load Testing, Auto-Scaling, Caching |
| **Kleinunternehmer-Grenze überschritten** | Mittel | Mittel | Umsatz-Monitoring, rechtzeitig USt-Anmeldung |
| **Email-Zustellung fehlschlägt** | Mittel | Mittel | SES Bounce-Handling, DKIM/SPF, Backup-Email |
| **Cron-Jobs versagen** | Mittel | Mittel | Monitoring, Alerts, Logging, Bull/Redis-Migration |

---

## 🔑 SECURITY CHECKLIST

### Vor Production-Launch:

- [ ] Alle Secrets in AWS Secrets Manager
- [ ] Environment Variables niemals committen
- [ ] HTTPS überall (TLS 1.3)
- [ ] CORS korrekt konfiguriert (nur Frontend-Domain)
- [ ] Rate Limiting aktiv (Express-Rate-Limit)
- [ ] Helmet-Middleware aktiv
- [ ] SQL-Injection-Schutz (Parametrisierte Queries)
- [ ] XSS-Schutz (Input Sanitization, CSP)
- [ ] CSRF-Protection (CSRF-Tokens)
- [ ] Passwörter mit Bcrypt (Salt Rounds: 10-12)
- [ ] JWT-Secrets rotieren
- [ ] Sensitive Logs nie ausgeben (Passwörter, Tokens)
- [ ] Field-Level Encryption für Patientendaten
- [ ] Database Encryption at Rest
- [ ] Regelmäßige Backups testen (Restore-Test!)
- [ ] Error-Handling ohne Stack Traces in Production
- [ ] Dependency-Updates (npm audit)
- [ ] Security-Headers testen (securityheaders.com)
- [ ] OWASP Top 10 prüfen

---

## 📚 EMPFOHLENE BIBLIOTHEKEN

### Backend (Node.js + TypeScript)

**Core**:
- `express` - Web-Framework
- `typescript` - Type Safety
- `pg` - PostgreSQL Client
- `typeorm` / `prisma` - ORM (empfohlen: Prisma)

**Security**:
- `bcrypt` - Password Hashing
- `jsonwebtoken` - JWT
- `helmet` - Security Headers
- `express-rate-limit` - Rate Limiting
- `cors` - CORS-Middleware
- `joi` / `zod` - Validation (empfohlen: Zod)

**AWS**:
- `aws-sdk` - AWS Services
- `@aws-sdk/client-s3` - S3
- `@aws-sdk/client-ses` - SES

**Email & PDF**:
- `nodemailer` - Email (optional, wenn SES nicht direkt)
- `pdfkit` - PDF-Generierung

**Scheduling**:
- `node-cron` - Cron Jobs
- `bull` + `redis` (optional, für Skalierung)

**Push Notifications**:
- `web-push` - PWA Push

**Testing**:
- `jest` - Test Framework
- `supertest` - API Testing
- `@faker-js/faker` - Test Data

**Dev Tools**:
- `nodemon` - Auto-Restart
- `dotenv` - Environment Variables
- `eslint` + `prettier` - Code Quality

### Frontend (React + TypeScript)

**Core**:
- `react` + `react-dom`
- `typescript`
- `react-router-dom` - Routing

**UI**:
- `@mui/material` - UI Components
- `@mui/icons-material` - Icons
- `@mui/x-data-grid` - Tabellen (optional)

**State Management**:
- `zustand` / `@reduxjs/toolkit`
- `react-query` / `@tanstack/react-query` - Server State

**Forms**:
- `react-hook-form` - Form Handling
- `yup` / `zod` - Validation

**HTTP**:
- `axios` - API Calls

**PWA**:
- `workbox-webpack-plugin` - Service Worker (in CRA integriert)
- `workbox-precaching` - Caching

**Charts** (optional):
- `recharts` / `chart.js` - Statistiken

**Testing**:
- `@testing-library/react` - Component Testing
- `@testing-library/jest-dom` - Matchers
- `jest` - Test Runner

**Dev Tools**:
- `eslint` + `prettier`
- `@typescript-eslint/*` - TS Linting

---

## 🌟 BEST PRACTICES - ZUSAMMENFASSUNG

### Code-Qualität
1. ✅ **TypeScript überall** - Type Safety first
2. ✅ **ESLint + Prettier** - Konsistenter Code-Style
3. ✅ **Layered Architecture** - Separation of Concerns
4. ✅ **DRY-Prinzip** - Don't Repeat Yourself
5. ✅ **SOLID-Prinzipien** - Clean Code

### Security
1. ✅ **Defense in Depth** - Mehrere Sicherheitsebenen
2. ✅ **Principle of Least Privilege** - Minimale Rechte
3. ✅ **Encryption everywhere** - At-Rest + In-Transit
4. ✅ **Input Validation** - Niemals Client-Input vertrauen
5. ✅ **Regular Updates** - Dependencies aktuell halten

### Performance
1. ✅ **Lazy Loading** - Code-Splitting
2. ✅ **Caching** - Redis, Browser-Cache, CDN
3. ✅ **Database Indexing** - Optimierte Queries
4. ✅ **Image Optimization** - WebP, Responsive Images
5. ✅ **Monitoring** - Proaktiv Probleme erkennen

### UX
1. ✅ **Mobile-First** - Kleinster Screen zuerst
2. ✅ **Accessibility** - WCAG 2.1 konform
3. ✅ **Loading States** - Feedback geben
4. ✅ **Error Handling** - User-friendly Fehlermeldungen
5. ✅ **Progressive Enhancement** - Funktioniert auch ohne JS (teilweise)

### DevOps
1. ✅ **Infrastructure as Code** - Terraform/CloudFormation
2. ✅ **CI/CD** - Automatisiertes Deployment
3. ✅ **Monitoring & Alerts** - Proaktiv handeln
4. ✅ **Backup & Disaster Recovery** - Regelmäßig testen!
5. ✅ **Documentation** - Code kommentieren, API dokumentieren

---

## 📞 NÄCHSTE SCHRITTE

### Sofort:
1. ✅ **AWS-Account erstellen** (Frankfurt Region wählen)
2. ✅ **Domain registrieren** (z.B. bei AWS Route 53 oder extern)
3. ✅ **GitHub/GitLab Repository erstellen**
4. ✅ **Projekt-Setup** (siehe Projektstruktur oben)
5. ✅ **Steuernummer beantragen** (falls noch nicht vorhanden)

### Diese Woche:
1. ✅ **PostgreSQL-Schema entwerfen** (detailliert)
2. ✅ **Wireframes erstellen** (Figma/Sketch/Papier)
3. ✅ **API-Endpunkte definieren** (OpenAPI/Swagger?)
4. ✅ **Datenschutzerklärung-Vorlage finden**
5. ✅ **Legal Review einplanen** (Anwalt für GDPR?)

### Nächste 2 Wochen:
1. ✅ **Backend-Grundgerüst** (Express + PostgreSQL + Auth)
2. ✅ **Frontend-Grundgerüst** (React + MUI + Routing)
3. ✅ **Erste API-Endpunkte** (User, Auth)
4. ✅ **Erste UI-Komponenten** (Login, Dashboard-Layout)

---

## 📖 ZUSÄTZLICHE RESSOURCEN

### Dokumentation:
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Material-UI**: https://mui.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **AWS Docs**: https://docs.aws.amazon.com/

### GDPR/Datenschutz:
- **GDPR-Text**: https://gdpr-info.eu/
- **Datenschutz-Generator**: https://www.e-recht24.de/
- **DSGVO-Checkliste**: https://www.datenschutz.org/

### Security:
- **OWASP Top 10**: https://owasp.org/Top10/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **OWASP Cheat Sheets**: https://cheatsheetseries.owasp.org/

### Testing:
- **Jest**: https://jestjs.io/
- **React Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev/

### Tutorials:
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **React Best Practices**: https://www.freecodecamp.org/news/best-practices-for-react/
- **AWS Tutorials**: https://aws.amazon.com/getting-started/

---

## ✅ FAZIT & EMPFEHLUNGEN

### Technologie-Stack (Final):
- ✅ **Frontend**: React 18 + TypeScript + Material-UI + PWA
- ✅ **Backend**: Node.js 20 + Express + TypeScript
- ✅ **Database**: PostgreSQL 16 (AWS RDS)
- ✅ **Hosting**: AWS Frankfurt (Elastic Beanstalk + S3 + CloudFront)
- ✅ **Auth**: JWT + HTTP-Only Cookies + Bcrypt
- ✅ **Email**: AWS SES
- ✅ **PDF**: PDFKit
- ✅ **Scheduler**: node-cron (Beta), Bull + Redis (Production)

### Wichtigste Prioritäten:
1. 🔐 **Security & GDPR** - Nicht verhandelbar!
2. 📱 **Mobile-First UX** - Hauptzielgruppe nutzt Mobilgeräte
3. 🚀 **Einfacher MVP** - Klein starten, iterieren
4. 📊 **Monitoring** - Von Anfang an!
5. 📚 **Dokumentation** - Für zukünftiges Selbst

### Erfolgs-Kriterien:
- ✅ GDPR-konform
- ✅ <2s Ladezeit (Mobile)
- ✅ >95% Uptime
- ✅ Intuitive Bedienung (ohne Schulung)
- ✅ <100€/Monat Betriebskosten (Beta)

---

**Viel Erfolg mit deinem Projekt! 🚀**

Bei Fragen zur Implementierung stehe ich zur Verfügung!
