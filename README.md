# GCB Bank PLC — Customer Complaint Tracking System (CCTS)

A full-stack, enterprise-grade banking dispute and complaint tracking platform designed in compliance with the **Bank of Ghana (BoG) Consumer Protection Directive** and **ISO 9241 Ergonomics / Data Protection (Act 843)** standards.

---

## 🔐 System Accounts & Role Configurations

All reference testing accounts are pre-configured in the platform. Users can also change their passwords on their Profile page or register new customer accounts with custom passwords.

### Pre-Configured Reference Accounts Directory

| Role | Full Name | Email Address | Default Password | Branch Code | Description / Access Scope |
|---|---|---|---|---|---|
| **Customer** | **Ama Mensah** | `ama.mensah@customer.bank.gh` | `password123` | `ACC-01` (Accra High Street) | Lodges disputes, tracks timeline status progression, uploads PDF/receipt evidence, views public resolution notes. OWASP tenant-isolated. |
| **Customer** | **Kwesi Appiah** | `kwesi.appiah@customer.bank.gh` | `password123` | `KMS-02` (Kumasi Harper Road) | Retail banking customer with ATM and cash deposit dispute records. |
| **Staff Officer** | **Kofi Owusu** | `kofi.owusu@staff.bank.gh` | `password123` | `ACC-01` (Accra Operations) | Resolution specialist handling active dispute caseload, entering internal confidential notes, claiming unassigned disputes from branch register, and closing cases with mandatory resolution notes. |
| **Staff Officer** | **Abena Serwaa** | `abena.serwaa@staff.bank.gh` | `password123` | `ACC-01` (Accra Operations) | Resolution specialist managing card services and e-banking dispute inquiries. |
| **Branch Manager** | **Dr. Emmanuel Quaye** | `dr.quaye@manager.bank.gh` | `password123` | `ACC-HQ` (Head Office / Triage) | Executive supervisor with bank-wide and branch oversight, unassigned triage allocation, officer workload management, SLA audit telemetry, and executive resolution authority. |

> **Note on Custom Credentials**: When a customer or staff member registers a new account or updates their password via the **Profile -> Security & Preferences** page, their custom password is saved and persisted across sessions.

---

## 🏛️ Core Features & Capabilities

### 1. Multi-Tenant Role-Based Access Control (RBAC) & Privacy
- **Customer Portal**: Strict tenant isolation. Customers can only view and update their own lodged complaints. Internal staff investigation memos are automatically redacted from customer view in accordance with data protection rules.
- **Staff Resolution Workstation**: Officers view assigned caseloads, review evidence attachments, log confidential investigation notes (hidden from customers), and submit formal resolution summaries.
- **Concurrency & Ownership Guards**: Officers must claim unassigned disputes from the Branch Register before starting active investigation, preventing duplicate concurrent handling across specialists.
- **Branch Executive QA Oversight**: Full branch registry triage, bulk/individual officer reallocation, SLA compliance monitoring, and root-cause analytics.

### 2. User Profile & Security Management
- Custom photo uploads (converted to base64 Data URLs) and responsive avatar initials badge fallback.
- Personal data editing: Full legal name, email, telephone number (E.164), designated branch location, 13-digit GCB account number, department, job title, and bio memo.
- Portal password updates with current password verification and persistent credential validation.
- Notification dispatch preferences (SMS & Email alerts).

### 3. Real-Time Synchronization & Persistence
- Built-in Server-Sent Events (SSE) `/api/realtime/stream` event bus for instant live status updates across all connected browser tabs.
- Persistent file storage and local cache synchronization.
- Reference database reset button available in the platform header to instantly refresh testing states.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 18 SPA, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend API**: Express server running on Node.js / `tsx server.ts`.
- **Database / Storage**: Persistent JSON file storage with in-memory indexes and browser local storage fallback.
- **Protocols**: REST API (`/api/*`) and Server-Sent Events (`/api/realtime/stream`).

---

## 📡 Key API Endpoints

### Authentication & User Management
- `POST /api/auth/login` — Authenticate by email/account number and password.
- `POST /api/auth/register` — Self-registration for new customer dispute accounts.
- `POST /api/auth/logout` — Terminate session.
- `GET /api/users` — List users (filterable by role).
- `PUT /api/users/profile` — Update user profile details, particulars, and notification settings.
- `POST /api/users/change-password` — Verify current password and update to new password.

### Complaints & Workflow Actions
- `GET /api/complaints` — List complaints filtered by role, status, and category.
- `GET /api/complaints/:id` — Get full dossier by ID or tracking reference number (e.g. `CMP-2026-84920`).
- `POST /api/complaints` — Submit a new dispute claim.
- `POST /api/complaints/:id/claim` — Claim an unassigned complaint from the branch register.
- `POST /api/complaints/:id/assign` — (Manager) Reallocate complaint to a staff specialist.
- `PATCH /api/complaints/:id/status` — Advance status (`Submitted` -> `In Progress`).
- `POST /api/complaints/:id/resolve` — Mark complaint `Resolved` with mandatory formal resolution record.
- `GET /api/complaints/:id/updates` — Retrieve chronological audit log and messages.
- `POST /api/complaints/:id/updates` — Post internal investigation note or public customer notice.

---

## 🚀 Running the Platform

To run the development server locally:

```bash
npm run dev
```

The application runs at `http://localhost:3000`.
