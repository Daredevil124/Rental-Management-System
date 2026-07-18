# Rental Management System - Comprehensive Project Handbook

Welcome to the **Rental Management System** project! This handbook is designed to give you a complete, high-level and detailed understanding of the entire project, its architecture, structure, database, and workflow. Whether you are a developer, designer, or system administrator, this guide will help you navigate and understand the codebase.

---

## 1. Project Overview

The **Rental Management System** is a full-stack SaaS application built to manage a rental business. It addresses two primary audiences:
1. **Customers (Customer Portal):** Customers browse products, select rental periods, add items to a cart, pay rental fees along with security deposits, check out, download invoices, and track their rental history/due dates.
2. **Rental Managers / Admins (Admin Console):** Admins configure products, inventory units, pricing lists, late fee rules, and deposit rules. They manage offline quotations, track daily pickups and returns, perform return inspections (tracking damage/missing accessories), settle deposits (refunding or deducting penalties), and monitor real-time business health via an operational dashboard.

---

## 2. Technology Stack

The application is split into a **Frontend**, **Backend**, and **Platform/Infrastructure** layer:

| Layer | Technologies Used | Key Purpose |
|---|---|---|
| **Frontend** | React, Vite, CSS, React Router | Modern, responsive, component-based user interface. |
| **Backend** | Node.js, Express, TypeScript, Zod | Fast, type-safe REST API server implementing business rules. |
| **Database** | PostgreSQL, Prisma ORM | SQL source of truth for structured data. Prisma for migrations. |
| **Caching/Jobs** | Redis, BullMQ | Background job queues (overdue detection, reminders), SSE pub/sub. |
| **Containerization** | Docker, Docker Compose | One-command local development setup. |
| **Orchestration** | Kubernetes (K8s) | Scalable production deployments. |

---

## 3. Directory & File Structure

Here is the simplified layout of the repository so you know exactly where everything lives:

```text
Rental-Management-System/
├── backend/                        # Express API Backend
│   ├── prisma/                     # Database Schema & Migrations
│   │   ├── schema.prisma           # Prisma Data Model
│   │   └── migrations/             # SQL Migrations History
│   ├── src/
│   │   ├── app.ts                  # App Configuration & Route Mounting
│   │   ├── server.ts               # Server Entrypoint
│   │   ├── config/                 # Env and DB Configurations
│   │   ├── db/                     # Prisma & Redis client instances
│   │   ├── middleware/             # Auth, error handling, logging, request ID
│   │   ├── modules/                # Core Business Logic (Controllers, Routes, Services)
│   │   │   ├── auth/               # User registration, login, JWT issuance
│   │   │   ├── users/              # Profiles, addresses, profile images
│   │   │   ├── products/           # Products, variants, inventory, accessories
│   │   │   ├── pricing/            # Price lists, rental periods, late fee & deposit rules
│   │   │   ├── cart/               # Shopping cart storage
│   │   │   ├── rentals/            # Rental order checkout & status tracking
│   │   │   ├── quotations/         # Quotation templates & client offers
│   │   │   ├── invoices/           # Invoice records & PDF generators
│   │   │   ├── deposits/           # Deposit transaction history & deductions
│   │   │   ├── pickup-return/      # Operational tasks for dispatch & returns
│   │   │   └── dashboard/          # Metric aggregation & realtime SSE feed
│   │   ├── events/                 # EventBus for decoupling actions via events
│   │   └── jobs/                   # BullMQ background workers (e.g. overdue check)
│   └── tests/                      # Vitest backend tests
├── frontend/                       # Vite + React Frontend
│   ├── src/
│   │   ├── app/                    # Routing rules and store config
│   │   ├── api/                    # API Adapters to talk to `/api/v1`
│   │   ├── components/             # Reusable UI Atoms (buttons, inputs, cards)
│   │   ├── routes/                 # App view declarations
│   │   ├── styles/                 # Core styling system (CSS tokens, layouts)
│   │   └── features/               # Frontend screens grouped by feature (Auth, Catalog, Cart, AdminDashboard, Operations)
├── infra/                          # Docker configuration and config assets
└── k8s/                            # Kubernetes manifests for microservices
```

---

## 4. Database Schema (Prisma Models)

The data model uses PostgreSQL. Below is an overview of the key entities:

- **Users (`User`):** Identity tracking with a `role` (`CUSTOMER` or `ADMIN`).
- **Addresses (`Address`):** Delivery or billing addresses linked to a customer.
- **Products & Variants (`Product`, `ProductVariant`):** Catalog setup. Variants track SKU, manufacturer, color, size, etc.
- **Inventory Units (`InventoryUnit`):** The actual rentable physical items. Each unit tracks its `assetTag`, `qrCode`, condition (`GOOD`, `DAMAGED`, etc.), and availability status (`AVAILABLE`, `RESERVED`, `RENTED`, `MAINTENANCE`).
- **Accessories (`Accessory`):** Expected items bundled with a rental (e.g., power cords).
- **Price Lists & Pricing Rules (`PriceList`, `PricingRule`):** Defines the base rent cost depending on the `RentalPeriod` (hourly, daily, weekly, monthly).
- **Deposit & Late Fee Rules (`DepositRule`, `LateFeeRule`):** Business rules governing how security deposits are held (fixed/percentage) and late penalties are calculated (grace periods, hourly/daily caps).
- **Carts (`Cart`, `CartItem`):** In-memory or database-backed customer drafts.
- **Rental Orders (`RentalOrder`, `RentalItem`):** The master checkout contract tracking total sums (subtotal, deposit, damage fee, late fee) and progression status (`DRAFT` -> `CONFIRMED` -> `PICKED_UP` -> `RETURNED` -> `CLOSED`).
- **Quotations (`Quotation`, `QuotationItem`):** Draft proposals created by admins for offline/in-store customers.
- **Invoices (`Invoice`):** Legally required billing snapshots and PDF urls.
- **Payments (`Payment`):** Transactions mapped to credit card, UPI, cash, etc.
- **Deposit Transactions (`DepositTransaction`):** Full transaction history of a deposit (HOLD -> DEDUCTION/REFUND -> SETTLED).
- **Pickup & Return Tasks (`PickupTask`, `ReturnTask`):** Board schedules for fulfillment operations.
- **Return Inspections (`ReturnInspection`, `InspectionAccessory`):** Logged condition, damage notes, and accessory checks upon item return.
- **Repair Tasks (`RepairTask`):** Maintenance lifecycle for damaged inventory.

---

## 5. Architectural Flow & Sequences

### The Checkout Flow
1. Customer submits `POST /api/v1/rentals/checkout`.
2. Backend queries price lists, verifies availability, and ensures dates are valid.
3. Database transaction writes:
   - `RentalOrder` & `RentalItem` rows.
   - `Invoice` metadata.
   - `DepositTransaction` (creates a `HOLD` status).
   - Updates `InventoryUnit.status` to `RESERVED`.
4. Domain event `rental.created.v1` is published.
5. BullMQ picks up the event and schedules return reminders, updates dashboard metrics, and initiates PDF invoice generation.

### The Return & Settlement Flow
1. Admin inspects returned items and submits inspection findings.
2. Backend calculates:
   - Accessory missing fees (deducted from deposit).
   - Late return penalties (if past grace period, calculated hourly/daily up to `maxFee`).
   - Damage fees.
3. System processes `DepositTransaction`:
   - Deducts fees.
   - Generates a `REFUND` for the remainder.
   - Marks status as `REFUNDED` or `FORFEITED`.
4. Inventory units are updated back to `AVAILABLE` or sent to `MAINTENANCE`.
5. Dashboard metrics are refreshed in real-time.

---

## 6. API Routing Details

All APIs are versioned under `/api/v1`. 

### Public / Customer Endpoints
- **Authentication:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- **Users:** `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- **Catalog:** `GET /api/v1/products`, `GET /api/v1/products/:productId`
- **Cart:** `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PATCH/DELETE /api/v1/cart/items/:itemId`
- **Rentals:** `POST /api/v1/rentals/checkout`, `GET /api/v1/rentals`, `GET /api/v1/rentals/:rentalId`

### Admin Endpoints
- **Product Management:** `POST /api/v1/admin/products`, `PATCH /api/v1/admin/products/:productId`, `POST /api/v1/admin/products/:productId/variants`, `POST /api/v1/admin/inventory-units`
- **Pricing Configuration:** `POST /api/v1/admin/price-lists`, `POST /api/v1/admin/late-fee-rules`, `POST /api/v1/admin/deposit-rules`
- **Quotations:** `POST /api/v1/admin/quotations`, `POST /api/v1/admin/quotations/:quotationId/confirm`
- **Fulfillment Operations:** `GET /api/v1/admin/pickups`, `POST /api/v1/admin/rentals/:rentalId/confirm-pickup`, `GET /api/v1/admin/returns`, `POST /api/v1/admin/rentals/:rentalId/confirm-return`
- **Settlement:** `POST /api/v1/admin/rentals/:rentalId/settle-deposit`
- **Dashboard Summary:** `GET /api/v1/admin/dashboard/summary`, `GET /api/v1/admin/dashboard/rental-activity`
- **Realtime Metrics:** `GET /api/v1/admin/dashboard/events` (SSE Channel)

---

## 7. How to Run the Project (Development Setup)

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if running locally without Docker)

### Backend Local Launch
1. Navigate to `/backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy env variables:
   ```bash
   cp .env.example .env
   ```
4. Run migrations and generate Prisma client:
   ```bash
   npx prisma generate
   npm run db:migrate # Configures postgres schema
   ```
5. Start development hot-reloader:
   ```bash
   npm run dev
   ```

### Frontend Local Launch
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker Compose (Runs Everything)
To launch Backend, Frontend, Redis, Worker, and PostgreSQL with one command:
```bash
docker-compose up --build
```

---

## 8. Development Coordination (Keep in Mind!)
If you are developing features, please coordinate changes in `docs/PROGRESS_REPORT.md`:
- Mark your started task as `[ ]` to `[x]`.
- Provide a summary note under `Done note`.
- Ensure `npm run typecheck` passes before committing.
- Commit messages should format as `<task-id>: <summary>` (e.g., `A03: implement auth register`).
