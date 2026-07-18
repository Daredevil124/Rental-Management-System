# Rental Management System - Comprehensive Project Plan

## 1. Hackathon Goal

Build a full-stack rental operations platform that lets customers rent products online and lets admins manage the complete rental lifecycle from one operational dashboard.

The winning version should emphasize:

- A clear end-to-end rental flow: browse, cart, checkout, deposit, invoice, pickup, return, settlement.
- Admin visibility: due today, overdue, pickups, returns, deposits held, late fees, revenue.
- Automation: late fee calculation, deposit settlement, stock updates, notifications, invoice generation.
- Scalable architecture using Node.js, Express, React, PostgreSQL, Redis, message queues, Docker, and Kubernetes.
- Clean module boundaries so three people can work in parallel without merge conflicts.

## 2. Scope From Problem Statement

### Customer Portal

- Splash screen, login, signup, profile creation.
- Product browsing with filters for categories, variants, availability, price lists, and rental period.
- Cart with rental dates, delivery or store pickup option, address selection, and pricing breakdown.
- Checkout with rental payment plus security deposit.
- Invoice download after successful payment.
- Profile management, profile image, addresses, saved payment metadata, and rental order history.
- Return flow visibility: due date, return instructions, penalties, refund status.

### Admin Backend

- Admin authentication and role-based access.
- Product, variant, stock, accessory, and condition management.
- Price list management including default price list, time-bound price lists, fixed/percentage deposits, and late fee rules.
- Rental period configuration.
- Quotation template, header, footer, quotation creation, confirmation, and invoice creation.
- Offline/in-store rental flow.
- Pickup and return schedule management.
- Return inspection, damage reporting, missing accessory tracking, repair workflow, stock update.
- Deposit hold, penalty deduction, refund settlement, and full deposit history.

### Dashboard And Insights

- Active rentals.
- Rentals due today.
- Upcoming pickups.
- Upcoming returns.
- Overdue rentals.
- Rental revenue.
- Security deposits held.
- Late fee collection.
- Outstanding penalties.
- Optional KPI widgets and analytics.

### Bonus Features

- Barcode/QR scanning for pickup and return.
- Automatic customer reminders.
- Smart pickup route optimization.
- Product availability forecasting.
- Predictive maintenance suggestions.
- Customizable dashboard widgets.
- Mobile-first operations UI.

## 3. Proposed Product Slices

### MVP Slice

This is the minimum complete demo path:

1. Customer signs up or logs in.
2. Customer browses products and selects rental dates.
3. Customer adds item to cart and checks out.
4. System creates rental order, invoice, deposit hold, and stock reservation.
5. Admin views order on dashboard and confirms pickup.
6. Admin processes return.
7. System calculates late fee if applicable, settles deposit, and updates stock.

### Demo-Winning Slice

Add the features that make the project stand out:

1. Real-time admin dashboard updates through message events and Redis-backed counters.
2. QR code generated per rental item and scan simulation in pickup/return UI.
3. Configurable late fee rules with grace period and max cap.
4. Deposit history timeline.
5. Automated reminder events for upcoming returns and overdue rentals.
6. Analytics cards for revenue, late fees, utilization, and deposits held.

### Stretch Slice

Use if MVP and demo-winning slice are stable:

1. Route sequencing for pickups.
2. Availability forecasting using historical rentals.
3. Predictive maintenance scoring from damage/repair history.
4. Custom dashboard widget layout.
5. Kubernetes manifests for deployable service separation.

## 4. Team Division

The project is split into three conflict-safe workstreams. Each person owns separate directories, API surfaces, and database migrations.

| Person | Workstream | Owns | Must Not Edit |
| --- | --- | --- | --- |
| Person A | Backend Core + Database | `backend/src/modules/**`, `backend/prisma/**` or `backend/migrations/**`, backend tests | `frontend/src/features/**` except API type stubs agreed in contracts |
| Person B | Frontend Customer + Admin UI | `frontend/src/**`, UI tests, client API adapters | Backend service internals, database schema except reading contracts |
| Person C | Platform + Realtime + Integrations | `infra/**`, `docker-compose.yml`, `k8s/**`, `backend/src/events/**`, `backend/src/jobs/**`, Redis/message queue adapters | Feature module business logic and page components unless adding event hooks |

If names are known, replace Person A/B/C in [PROGRESS_REPORT.md](./PROGRESS_REPORT.md).

## 5. Repository Structure Standard

Create this structure and keep it stable:

```text
Rental-Management-System/
  backend/
    src/
      app.ts
      server.ts
      config/
      db/
      middleware/
      modules/
        auth/
        users/
        products/
        pricing/
        rentals/
        quotations/
        invoices/
        deposits/
        pickup-return/
        dashboard/
      events/
      jobs/
      shared/
    tests/
  frontend/
    src/
      app/
      api/
      components/
      features/
        auth/
        catalog/
        cart/
        checkout/
        orders/
        admin-dashboard/
        admin-products/
        admin-pricing/
        admin-rentals/
        pickup-return/
      routes/
      styles/
      types/
  infra/
    docker/
    postgres/
    redis/
    queue/
  k8s/
  docs/
```

## 6. Backend Architecture

Use a modular monolith first. It is faster for hackathon delivery but keeps clean service boundaries that can later become microservices.

### Runtime

- Node.js with Express.js.
- PostgreSQL as source of truth.
- Redis for caching, session/token denylist, dashboard counters, and lightweight pub/sub.
- Message queue for durable jobs/events. Recommended choices:
  - BullMQ on Redis for hackathon speed.
  - RabbitMQ if the team wants explicit queue topology.
- Docker Compose for local development.
- Kubernetes manifests for deployment-ready architecture.

### Core Backend Modules

- `auth`: register, login, refresh, logout, role-based authorization.
- `users`: profile, addresses, profile image metadata.
- `products`: products, variants, inventory units, accessories, product condition.
- `pricing`: price lists, rental periods, deposits, late fee rules.
- `rentals`: rental order lifecycle, cart conversion, status changes.
- `quotations`: admin quotation templates, quotations, confirmation.
- `invoices`: invoice records, PDF invoice generation endpoint.
- `deposits`: deposit hold, settlement, refund, penalty deduction history.
- `pickup-return`: pickup schedule, pickup confirmation, return inspection, damage/missing accessories, stock update.
- `dashboard`: aggregate operational metrics and dashboard widgets.
- `events`: domain event publisher/subscriber.
- `jobs`: reminders, overdue detection, late fee invoice generation, dashboard counter refresh.

## 7. Frontend Architecture

Use React with feature folders and shared primitives.

### Frontend Areas

- Public/auth screens: splash, login, signup.
- Customer portal: catalog, product details, cart, checkout, orders, profile, addresses, invoice download.
- Admin console: dashboard, product management, pricing/rental periods, quotation builder, rental operations, pickup/return board, deposits, reports.
- Shared UI: buttons, inputs, tables, modals, date range picker, status badges, metric cards, toasts.
- API client: all HTTP calls go through `frontend/src/api`.

### UI Style Direction

- Operational SaaS interface, not a marketing landing page.
- Dense but readable dashboards.
- Use tables, filters, status badges, tabs, drawers, and clear workflows.
- Mobile-first for pickup/return screens.
- Keep cards for repeated data items and dashboard widgets only.

## 8. Data Model

Recommended PostgreSQL entities:

- `users`: login identity, role, profile data.
- `addresses`: user addresses.
- `products`: product master data.
- `product_variants`: brand, manufacturer, color, size, SKU.
- `inventory_units`: track rentable physical units, condition, status, QR code.
- `accessories`: accessories expected with a product/unit.
- `price_lists`: default and custom time-bound price lists.
- `rental_periods`: hourly, daily, weekly, monthly periods.
- `pricing_rules`: product/variant/period price definitions.
- `deposit_rules`: fixed or percentage deposit rules.
- `late_fee_rules`: unit, amount, grace period, max cap.
- `carts` and `cart_items`: customer draft rentals.
- `rental_orders`: confirmed rental header.
- `rental_items`: rented units and date ranges.
- `quotations`: admin-generated quote header.
- `quotation_items`: quote line items.
- `invoices`: invoice metadata and totals.
- `payments`: rental payment/deposit payment records.
- `deposit_transactions`: hold, deduction, refund, settlement history.
- `pickup_tasks`: scheduled pickups.
- `return_tasks`: scheduled returns.
- `return_inspections`: condition, damage notes, missing accessories.
- `repair_tasks`: repair workflow when needed.
- `notifications`: reminder records and delivery status.
- `audit_logs`: admin/user actions.

## 9. API Contract Standard

All teams must follow this contract to avoid integration errors.

### URLs

- Version all APIs under `/api/v1`.
- Use plural REST nouns.
- Use action suffixes only for lifecycle transitions.

Examples:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/products`
- `POST /api/v1/cart/items`
- `POST /api/v1/rentals/checkout`
- `POST /api/v1/admin/rentals/:rentalId/confirm-pickup`
- `POST /api/v1/admin/rentals/:rentalId/confirm-return`
- `GET /api/v1/admin/dashboard/summary`

### Response Envelope

All successful responses:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

All error responses:

```json
{
  "success": false,
  "error": {
    "code": "RENTAL_OVERDUE",
    "message": "Human readable message",
    "details": {}
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### Status Values

Use these exact enum strings:

- User role: `CUSTOMER`, `ADMIN`.
- Inventory status: `AVAILABLE`, `RESERVED`, `RENTED`, `MAINTENANCE`, `RETIRED`.
- Rental status: `DRAFT`, `CONFIRMED`, `PICKUP_SCHEDULED`, `PICKED_UP`, `RETURN_DUE`, `OVERDUE`, `RETURNED`, `CLOSED`, `CANCELLED`.
- Payment status: `PENDING`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`.
- Deposit status: `NOT_COLLECTED`, `HELD`, `PARTIALLY_DEDUCTED`, `REFUNDED`, `FORFEITED`.
- Task status: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

### Naming

- JSON uses `camelCase`.
- Database columns use `snake_case`.
- React components use `PascalCase`.
- Functions and variables use `camelCase`.
- Environment variables use `UPPER_SNAKE_CASE`.
- Event names use `domain.event.v1`.

## 10. Domain Events

Publish events for side effects and dashboard updates. Event payloads must include `eventId`, `eventName`, `occurredAt`, `actorId`, and `data`.

Required events:

- `auth.user_registered.v1`
- `rental.created.v1`
- `rental.confirmed.v1`
- `rental.pickup_scheduled.v1`
- `rental.picked_up.v1`
- `rental.return_due.v1`
- `rental.overdue.v1`
- `rental.returned.v1`
- `deposit.collected.v1`
- `deposit.settled.v1`
- `late_fee.calculated.v1`
- `invoice.generated.v1`
- `inventory.reserved.v1`
- `inventory.released.v1`
- `notification.requested.v1`

Use events for:

- Dashboard counters.
- Reminder jobs.
- Invoice generation.
- Notification records.
- Audit logs.

Do not use events to hide core transactional writes. The main rental/order/deposit state must be committed in PostgreSQL first.

## 11. Docker And Kubernetes Plan

### Local Docker Compose

Services:

- `frontend`: React dev server.
- `backend`: Express API.
- `postgres`: PostgreSQL.
- `redis`: Redis for cache, pub/sub, and BullMQ.
- `worker`: Node worker consuming background jobs.
- Optional `adminer` or `pgadmin`: database inspection.

### Kubernetes

Manifests:

- Backend Deployment + Service.
- Frontend Deployment + Service.
- Worker Deployment.
- PostgreSQL StatefulSet or external database placeholder.
- Redis Deployment/StatefulSet.
- ConfigMap for non-secret config.
- Secret for credentials.
- Ingress for frontend and API.

## 12. Security And Reliability

- Password hashing with bcrypt or argon2.
- JWT access token and refresh token.
- Role-based middleware.
- Request validation with Zod or Joi.
- Centralized error handler.
- Rate limiting for auth endpoints.
- Audit logs for admin actions and deposit settlements.
- Use database transactions for checkout, pickup confirmation, return confirmation, and deposit settlement.
- Idempotency key support for checkout and admin lifecycle actions.

## 13. Demo Script

1. Admin logs in and opens dashboard.
2. Customer signs up, browses catalog, selects a product, chooses rental period, and checks out.
3. Admin dashboard updates active rentals and deposits held.
4. Admin opens pickup schedule and confirms pickup with QR scan simulation.
5. System marks inventory as rented.
6. Admin processes an on-time return and shows full deposit refund.
7. Admin processes a second late return and shows automatic late fee deduction.
8. Show invoice download and deposit transaction timeline.
9. Show analytics widgets and reminder event logs.

