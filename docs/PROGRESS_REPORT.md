# Rental Management System - Progress Report

This file is the single coordination source for the three-person team. Each AI agent must read this file before working, claim one unchecked task from its owner section, update only that task's files, and mark the task done when verified.

## Coordination Standard

### Ownership

- Person A owns backend business modules, API contracts, PostgreSQL schema, and backend tests.
- Person B owns React UI, route structure, frontend API adapters, and frontend tests.
- Person C owns Docker, Kubernetes, Redis, queues, background workers, events, realtime/dashboard plumbing, and deployment docs.

### No-Conflict Rules

- Only edit files inside your owned directories unless a task explicitly says otherwise.
- Before changing a shared contract, update the contract section in this file first.
- Backend and frontend communicate only through `/api/v1` contracts.
- Background work communicates through domain events listed in [PROJECT_PLAN.md](./PROJECT_PLAN.md).
- All new API fields must be added, never renamed, during the hackathon unless all dependent tasks are marked not started.
- Every completed task must include the verification command or manual check in the task note.

### Branch Standard

- Person A branch prefix: `backend/`.
- Person B branch prefix: `frontend/`.
- Person C branch prefix: `platform/`.
- Task branch format: `<prefix><task-id>-short-name`.
- Example: `backend/A04-rental-checkout`.

### Commit Standard

Use this format:

```text
<task-id>: <short imperative summary>
```

Example:

```text
A04: implement rental checkout transaction
```

### Done Standard

A task is done only when:

- Code is implemented.
- Local checks pass for that owned area.
- API/event contracts touched by the task are documented.
- The checkbox is marked `[x]`.
- The task note includes files changed and verification.

### Shared Contract Files

These files may be edited by any person only when their task requires a contract update:

- `docs/PROGRESS_REPORT.md`
- `docs/PROJECT_PLAN.md`
- `docs/ARCHITECTURE.md`
- `backend/src/shared/contracts/**`
- `frontend/src/types/api.ts`

When changing shared contract files, keep edits minimal and append-compatible.

## Current Overall Status

- Problem statement read: `[x]`
- Project plan created: `[x]`
- Architecture diagram created: `[x]`
- Implementation started: `[x]`
- MVP complete: `[ ]`
- Demo-winning features complete: `[ ]`
- Deployment-ready: `[ ]`

## MVP Milestones

| Milestone | Status | Owner | Notes |
| --- | --- | --- | --- |
| M1 Repo scaffold | Not started | Person C | Create backend/frontend/infra skeleton and local compose |
| M2 Auth + roles | Not started | Person A + B | Backend endpoints and frontend screens |
| M3 Catalog + pricing | Not started | Person A + B | Products, variants, price list, availability UI |
| M4 Checkout + rental order | Not started | Person A + B | Cart, deposit, invoice metadata |
| M5 Admin dashboard | Not started | Person A + B + C | Metrics API, UI cards, realtime/event updates |
| M6 Pickup and return | Not started | Person A + B | Operational workflow |
| M7 Late fee + deposit settlement | Not started | Person A + B + C | Transactional settlement and worker detection |
| M8 Docker demo | Not started | Person C | One command to run |

## Person A - Backend Core + Database

### A01 Backend Scaffold

- Status: `[x]`
- Scope: Create Express app structure, TypeScript config, lint/test setup, health endpoint.
- Own files: `backend/**`
- Depends on: None
- Must expose:
  - `GET /api/v1/health`
- Done note: Implemented Express + TypeScript scaffold with standard API response envelope, request ID middleware, CORS/Helmet/Morgan setup, centralized 404/error handlers, `GET /api/v1/health`, Vitest/Supertest health test, lint/typecheck scripts, and backend env example. Files changed: `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.json`, `backend/tsconfig.test.json`, `backend/vitest.config.ts`, `backend/.eslintrc.cjs`, `backend/.env.example`, `backend/src/**`, `backend/tests/health.test.ts`. Verification: `npm run typecheck` passed, `npm run lint` passed, `npm test` passed, `npm run build` passed, `npm audit --omit=dev` found 0 production vulnerabilities, manual `curl -i http://localhost:4000/api/v1/health` returned HTTP 200 with standard envelope.

### A02 Database Schema

- Status: `[x]`
- Scope: Create PostgreSQL schema/migrations for users, products, variants, inventory, price lists, rental periods, pricing rules, deposits, rentals, invoices, pickup/return, inspections.
- Own files: `backend/prisma/**` or `backend/migrations/**`, `backend/src/db/**`
- Depends on: A01
- Must follow: snake_case DB columns and enum values from project plan.
- Done note: Created schema in `backend/prisma/schema.prisma` matching all requirements and snake_case mapping. Created initial migration `20260718062000_init_schema`. Configured Prisma client with pg adapter in `backend/src/db/prisma.ts`. Verification: ran `npm run typecheck` which passed successfully.

### A03 Auth And RBAC API

- Status: `[ ]`
- Scope: Registration, login, refresh/logout if time permits, password hashing, role middleware.
- Own files: `backend/src/modules/auth/**`, `backend/src/modules/users/**`, backend auth tests.
- Depends on: A01, A02
- Must expose:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/users/me`
  - `PATCH /api/v1/users/me`
- Done note:

### A04 Product, Variant, Inventory API

- Status: `[ ]`
- Scope: Product CRUD, variants, inventory unit status, accessories, public catalog list.
- Own files: `backend/src/modules/products/**`
- Depends on: A02
- Must expose:
  - `GET /api/v1/products`
  - `GET /api/v1/products/:productId`
  - `POST /api/v1/admin/products`
  - `PATCH /api/v1/admin/products/:productId`
  - `POST /api/v1/admin/products/:productId/variants`
  - `POST /api/v1/admin/inventory-units`
- Done note:

### A05 Pricing, Rental Periods, Late Fee Rules

- Status: `[ ]`
- Scope: Default/custom price lists, rental periods, deposit rules, late fee rules.
- Own files: `backend/src/modules/pricing/**`
- Depends on: A02
- Must expose:
  - `GET /api/v1/pricing/rental-periods`
  - `GET /api/v1/admin/price-lists`
  - `POST /api/v1/admin/price-lists`
  - `POST /api/v1/admin/late-fee-rules`
  - `POST /api/v1/admin/deposit-rules`
- Done note:

### A06 Cart And Checkout

- Status: `[ ]`
- Scope: Cart items, date validation, availability reservation, rental order creation, invoice record, deposit hold record.
- Own files: `backend/src/modules/rentals/**`, `backend/src/modules/invoices/**`, `backend/src/modules/deposits/**`
- Depends on: A03, A04, A05
- Must expose:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `PATCH /api/v1/cart/items/:itemId`
  - `DELETE /api/v1/cart/items/:itemId`
  - `POST /api/v1/rentals/checkout`
  - `GET /api/v1/rentals`
  - `GET /api/v1/rentals/:rentalId`
  - `GET /api/v1/rentals/:rentalId/invoice`
- Must publish:
  - `rental.created.v1`
  - `deposit.collected.v1`
  - `invoice.generated.v1`
  - `inventory.reserved.v1`
- Done note:

### A07 Admin Quotation Flow

- Status: `[ ]`
- Scope: Quotation templates, quote create/update, confirm quote into rental order and invoice.
- Own files: `backend/src/modules/quotations/**`
- Depends on: A04, A05, A06
- Must expose:
  - `GET /api/v1/admin/quotation-templates`
  - `POST /api/v1/admin/quotation-templates`
  - `POST /api/v1/admin/quotations`
  - `POST /api/v1/admin/quotations/:quotationId/confirm`
- Done note:

### A08 Pickup And Return Workflow API

- Status: `[ ]`
- Scope: Pickup schedule, pickup confirmation, return inspection, damage/missing accessory entry, inventory update.
- Own files: `backend/src/modules/pickup-return/**`
- Depends on: A06
- Must expose:
  - `GET /api/v1/admin/pickups`
  - `POST /api/v1/admin/rentals/:rentalId/confirm-pickup`
  - `GET /api/v1/admin/returns`
  - `POST /api/v1/admin/rentals/:rentalId/confirm-return`
- Must publish:
  - `rental.picked_up.v1`
  - `rental.returned.v1`
  - `inventory.released.v1`
- Done note:

### A09 Deposit Settlement And Late Fee Calculation

- Status: `[ ]`
- Scope: Late fee calculation with grace period, max cap, deposit deduction, refund amount, transaction history.
- Own files: `backend/src/modules/deposits/**`, `backend/src/modules/rentals/**`
- Depends on: A05, A08
- Must expose:
  - `GET /api/v1/admin/deposits`
  - `GET /api/v1/admin/rentals/:rentalId/deposit-history`
  - `POST /api/v1/admin/rentals/:rentalId/settle-deposit`
- Must publish:
  - `late_fee.calculated.v1`
  - `deposit.settled.v1`
- Done note:

### A10 Dashboard Metrics API

- Status: `[ ]`
- Scope: Aggregated metrics for active rentals, due today, pickups, returns, overdue, revenue, deposits held, late fees.
- Own files: `backend/src/modules/dashboard/**`
- Depends on: A06, A08, A09
- Must expose:
  - `GET /api/v1/admin/dashboard/summary`
  - `GET /api/v1/admin/dashboard/rental-activity`
- Done note:

## Person B - Frontend Customer + Admin UI

### B01 Frontend Scaffold

- Status: `[ ]`
- Scope: React app setup, routing, layout shells, API client, auth token storage, design tokens.
- Own files: `frontend/**`
- Depends on: None
- Must include: customer layout and admin layout.
- Done note:

### B02 Auth Screens

- Status: `[ ]`
- Scope: Splash, login, signup, profile creation, protected routes.
- Own files: `frontend/src/features/auth/**`, `frontend/src/routes/**`
- Depends on: B01, A03 contract
- Uses endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/users/me`
- Done note:

### B03 Customer Catalog

- Status: `[ ]`
- Scope: Product listing, filters, product details, variant display, availability hints.
- Own files: `frontend/src/features/catalog/**`
- Depends on: B01, A04 contract
- Uses endpoints:
  - `GET /api/v1/products`
  - `GET /api/v1/products/:productId`
- Done note:

### B04 Cart And Checkout UI

- Status: `[ ]`
- Scope: Cart, date picker, delivery/store pickup selector, address selector, payment info form, price/deposit breakdown.
- Own files: `frontend/src/features/cart/**`, `frontend/src/features/checkout/**`
- Depends on: B03, A06 contract
- Uses endpoints:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `POST /api/v1/rentals/checkout`
- Done note:

### B05 Customer Orders, Profile, Invoice

- Status: `[ ]`
- Scope: Rental order list/details, invoice download button, address/profile/profile image UI, return instructions.
- Own files: `frontend/src/features/orders/**`, `frontend/src/features/profile/**`
- Depends on: B02, A06 contract
- Uses endpoints:
  - `GET /api/v1/rentals`
  - `GET /api/v1/rentals/:rentalId`
  - `GET /api/v1/rentals/:rentalId/invoice`
  - `PATCH /api/v1/users/me`
- Done note:

### B06 Admin Dashboard UI

- Status: `[ ]`
- Scope: Operational dashboard cards, tables for due today/upcoming/overdue, revenue/deposit/late fee cards.
- Own files: `frontend/src/features/admin-dashboard/**`
- Depends on: B01, A10 contract
- Uses endpoints:
  - `GET /api/v1/admin/dashboard/summary`
  - `GET /api/v1/admin/dashboard/rental-activity`
- Done note:

### B07 Admin Products And Pricing UI

- Status: `[ ]`
- Scope: Product CRUD screens, variants, inventory unit forms, price lists, rental periods, deposit and late fee rules.
- Own files: `frontend/src/features/admin-products/**`, `frontend/src/features/admin-pricing/**`
- Depends on: A04, A05 contracts
- Uses endpoints: A04 and A05 admin endpoints.
- Done note:

### B08 Admin Quotation UI

- Status: `[ ]`
- Scope: Quotation template editor, quotation builder, confirm quotation action.
- Own files: `frontend/src/features/admin-quotations/**`
- Depends on: A07 contract
- Uses endpoints: A07 endpoints.
- Done note:

### B09 Pickup And Return Operations UI

- Status: `[ ]`
- Scope: Daily pickup board, daily return board, QR scan simulation, inspection form, damage/missing accessories, deposit settlement display.
- Own files: `frontend/src/features/pickup-return/**`
- Depends on: A08, A09 contracts
- Uses endpoints:
  - `GET /api/v1/admin/pickups`
  - `GET /api/v1/admin/returns`
  - `POST /api/v1/admin/rentals/:rentalId/confirm-pickup`
  - `POST /api/v1/admin/rentals/:rentalId/confirm-return`
  - `POST /api/v1/admin/rentals/:rentalId/settle-deposit`
- Done note:

### B10 UI Polish And Demo Flow

- Status: `[ ]`
- Scope: Seed-data-friendly screens, empty/loading/error states, responsive checks, demo navigation path.
- Own files: `frontend/src/**`
- Depends on: B02-B09
- Done note:

## Person C - Platform + Realtime + Integrations

### C01 Repo And Docker Scaffold

- Status: `[ ]`
- Scope: Create root package scripts if needed, `docker-compose.yml`, service env examples, local startup docs.
- Own files: `docker-compose.yml`, `.env.example`, `infra/**`, root README updates.
- Depends on: None
- Must provide:
  - one command to start local stack.
- Done note:

### C02 Redis And Queue Adapter

- Status: `[ ]`
- Scope: Backend Redis client, queue client, worker entrypoint, event publisher interface.
- Own files: `backend/src/events/**`, `backend/src/jobs/**`, `infra/redis/**`
- Depends on: A01
- Must support events from project plan.
- Done note:

### C03 Background Jobs

- Status: `[ ]`
- Scope: Overdue detection, return reminders, invoice generation worker hook, dashboard counter refresh.
- Own files: `backend/src/jobs/**`
- Depends on: C02, A06, A09
- Must publish:
  - `rental.overdue.v1`
  - `notification.requested.v1`
- Done note:

### C04 Realtime Dashboard Channel

- Status: `[ ]`
- Scope: SSE or WebSocket endpoint for dashboard updates, Redis pub/sub bridge, frontend adapter contract notes.
- Own files: `backend/src/events/**`, `frontend/src/api/realtime.ts` if needed, docs contract update.
- Depends on: C02, A10
- Must expose:
  - `GET /api/v1/admin/dashboard/events`
- Done note:

### C05 Seed Data

- Status: `[ ]`
- Scope: Demo admin, demo customers, products, inventory units, price lists, late fee rules, rentals in active/due/overdue states.
- Own files: `backend/src/db/seed.*`, `infra/postgres/**`
- Depends on: A02
- Done note:

### C06 Invoice PDF Generation Integration

- Status: `[ ]`
- Scope: Implement or integrate invoice PDF generation if not completed by A06, store metadata, expose downloadable file.
- Own files: `backend/src/modules/invoices/**`, `backend/src/jobs/**`
- Depends on: A06, C02
- Done note:

### C07 Kubernetes Manifests

- Status: `[ ]`
- Scope: Backend, frontend, worker, Postgres, Redis, ConfigMap, Secret placeholders, Ingress.
- Own files: `k8s/**`
- Depends on: C01
- Done note:

### C08 Observability And Audit Trail

- Status: `[ ]`
- Scope: Request logging, request IDs, basic metrics endpoint, audit log subscriber for admin actions/deposit settlement.
- Own files: `backend/src/middleware/**`, `backend/src/events/**`, `backend/src/modules/audit/**`
- Depends on: A01, C02
- Done note:

### C09 Demo Runbook

- Status: `[ ]`
- Scope: Document commands, demo users, demo script, troubleshooting, deployment notes.
- Own files: `README.md`, `docs/DEMO_RUNBOOK.md`
- Depends on: C01-C08 and MVP features.
- Done note:

## API Contract Checklist

When adding an endpoint, update this table.

| Endpoint | Owner | Status | Frontend Consumer | Notes |
| --- | --- | --- | --- | --- |
| `GET /api/v1/health` | A | Done | C | Implemented in A01; returns standard success envelope and `x-request-id` header |
| `POST /api/v1/auth/register` | A | Not started | B02 | Customer/admin registration depending seed policy |
| `POST /api/v1/auth/login` | A | Not started | B02 | Returns token and user |
| `GET /api/v1/users/me` | A | Not started | B02/B05 | Current user |
| `GET /api/v1/products` | A | Not started | B03 | Catalog list |
| `GET /api/v1/products/:productId` | A | Not started | B03 | Product detail |
| `POST /api/v1/rentals/checkout` | A | Not started | B04 | Converts cart to rental |
| `GET /api/v1/admin/dashboard/summary` | A | Not started | B06/C04 | Dashboard cards |
| `GET /api/v1/admin/pickups` | A | Not started | B09 | Daily pickups |
| `GET /api/v1/admin/returns` | A | Not started | B09 | Daily returns |

## Integration Order

1. C01 creates scaffold and Docker Compose.
2. A01 creates backend health endpoint.
3. B01 creates frontend shell.
4. A02 creates schema and seed hooks.
5. A03 and B02 integrate auth.
6. A04/A05 and B03/B07 integrate catalog/admin setup.
7. A06 and B04/B05 integrate checkout/orders.
8. A08/A09 and B09 integrate operations.
9. A10/C04 and B06 integrate dashboard realtime.
10. C05/C09 finalize demo.

## Risk Log

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Too much scope for hackathon | Incomplete demo | Complete MVP slice first, then bonus features |
| Merge conflicts across AI agents | Slow integration | Follow ownership rules and shared contract update rule |
| Late fee/deposit logic bugs | Demo credibility risk | Centralize calculation in backend and test edge cases |
| Realtime complexity | Wasted time | Use SSE first; upgrade to WebSockets only if needed |
| Kubernetes consumes time | MVP delay | Keep K8s manifests as deploy-ready stretch after Docker Compose |
| Payment integration complexity | Blocking checkout | Simulate payment provider with deterministic mock status |

## What Is Left To Do

- All implementation tasks A01-A10, B01-B10, and C01-C09 are left to do.
- Replace Person A/B/C with real teammate names.
- Choose backend ORM/migration tool: Prisma is recommended for speed.
- Choose message queue implementation: BullMQ on Redis is recommended for speed.
- Confirm whether payment is mocked or integrated with a real provider. Mocking is recommended for hackathon.

## What Is Not Left To Do

- Problem statement analysis is complete.
- Technical stack is selected.
- Team ownership boundaries are defined.
- API naming, response envelope, enum, event, and branch standards are defined.
- Architecture diagram is prepared in [ARCHITECTURE.md](./ARCHITECTURE.md).

