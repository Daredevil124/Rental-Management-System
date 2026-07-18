# Rental Management System - Architecture

## System Diagram

```mermaid
flowchart TB
  subgraph Client["Users"]
    Customer["Customer Portal User"]
    Admin["Admin User"]
  end

  subgraph Frontend["React Frontend"]
    AuthUI["Auth Screens"]
    CustomerUI["Customer Portal\nCatalog, Cart, Checkout, Orders, Profile"]
    AdminUI["Admin Console\nDashboard, Products, Pricing, Rentals, Pickup/Return"]
    RealtimeClient["Realtime Client\nSSE/WebSocket"]
  end

  subgraph API["Node.js + Express API"]
    Gateway["API Router\n/api/v1"]
    Auth["Auth + RBAC"]
    Products["Products + Inventory"]
    Pricing["Pricing + Rental Rules"]
    Rentals["Rentals + Cart + Checkout"]
    Quotes["Quotations"]
    Invoices["Invoices"]
    Deposits["Deposits + Late Fees"]
    Ops["Pickup + Return"]
    Dashboard["Dashboard Metrics"]
    Events["Domain Event Publisher"]
  end

  subgraph Worker["Worker Service"]
    QueueConsumer["Queue Consumers"]
    OverdueJob["Overdue Detection"]
    ReminderJob["Return Reminders"]
    InvoiceJob["Invoice Generation"]
    CounterJob["Dashboard Counter Refresh"]
  end

  subgraph Data["Data Layer"]
    Postgres[("PostgreSQL\nSource of Truth")]
    Redis[("Redis\nCache, Pub/Sub, BullMQ")]
    FileStore[("Invoice/Profile Asset Store\nLocal Volume or Object Storage")]
  end

  subgraph Deploy["Deployment"]
    Docker["Docker Compose\nLocal Demo"]
    K8s["Kubernetes\nDeployable Manifests"]
  end

  Customer --> CustomerUI
  Admin --> AdminUI
  AuthUI --> Gateway
  CustomerUI --> Gateway
  AdminUI --> Gateway
  RealtimeClient --> Dashboard

  Gateway --> Auth
  Gateway --> Products
  Gateway --> Pricing
  Gateway --> Rentals
  Gateway --> Quotes
  Gateway --> Invoices
  Gateway --> Deposits
  Gateway --> Ops
  Gateway --> Dashboard

  Auth --> Postgres
  Products --> Postgres
  Pricing --> Postgres
  Rentals --> Postgres
  Quotes --> Postgres
  Invoices --> Postgres
  Deposits --> Postgres
  Ops --> Postgres
  Dashboard --> Postgres
  Dashboard --> Redis
  Invoices --> FileStore

  Rentals --> Events
  Deposits --> Events
  Ops --> Events
  Invoices --> Events
  Events --> Redis
  Redis --> QueueConsumer
  QueueConsumer --> OverdueJob
  QueueConsumer --> ReminderJob
  QueueConsumer --> InvoiceJob
  QueueConsumer --> CounterJob
  QueueConsumer --> Postgres
  QueueConsumer --> Redis
  Redis --> RealtimeClient

  Docker -. packages .-> Frontend
  Docker -. packages .-> API
  Docker -. packages .-> Worker
  Docker -. runs .-> Postgres
  Docker -. runs .-> Redis
  K8s -. deploys .-> Frontend
  K8s -. deploys .-> API
  K8s -. deploys .-> Worker
```

## Rental Lifecycle

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> CONFIRMED: checkout or quotation confirm
  CONFIRMED --> PICKUP_SCHEDULED: pickup task created
  PICKUP_SCHEDULED --> PICKED_UP: admin confirms pickup
  PICKED_UP --> RETURN_DUE: due date reached
  RETURN_DUE --> OVERDUE: grace period exceeded
  RETURN_DUE --> RETURNED: on-time return
  OVERDUE --> RETURNED: late return
  RETURNED --> CLOSED: deposit settled
  CONFIRMED --> CANCELLED: cancellation
  CLOSED --> [*]
  CANCELLED --> [*]
```

## Checkout Sequence

```mermaid
sequenceDiagram
  participant C as Customer UI
  participant API as Express API
  participant DB as PostgreSQL
  participant R as Redis/Queue
  participant W as Worker
  participant A as Admin Dashboard

  C->>API: POST /api/v1/rentals/checkout
  API->>DB: Validate cart, dates, pricing, inventory
  API->>DB: Create rental_order, rental_items, invoice, deposit hold
  API->>DB: Mark inventory RESERVED
  API->>R: Publish rental.created.v1
  API->>R: Publish deposit.collected.v1
  API-->>C: Rental confirmation + invoice link
  R->>W: Queue invoice/reminder/dashboard jobs
  W->>DB: Store notification and invoice metadata
  W->>R: Refresh dashboard counters
  R-->>A: Push dashboard update
```

## Return And Deposit Settlement Sequence

```mermaid
sequenceDiagram
  participant Admin as Admin UI
  participant API as Express API
  participant DB as PostgreSQL
  participant R as Redis/Queue
  participant W as Worker

  Admin->>API: POST /api/v1/admin/rentals/:id/confirm-return
  API->>DB: Load rental, due date, deposit, late fee rule
  API->>DB: Save return inspection
  API->>DB: Calculate late fee and damage deductions
  API->>DB: Create deposit transaction
  API->>DB: Mark inventory AVAILABLE or MAINTENANCE
  API->>DB: Mark rental RETURNED/CLOSED
  API->>R: Publish rental.returned.v1
  API->>R: Publish late_fee.calculated.v1 if late
  API->>R: Publish deposit.settled.v1
  API-->>Admin: Settlement summary
  R->>W: Update dashboard, audit log, notification
```

## Deployment View

```mermaid
flowchart LR
  subgraph Local["Local Development"]
    DC["docker compose up"]
    FE1["frontend container"]
    BE1["backend container"]
    WK1["worker container"]
    PG1["postgres container"]
    RD1["redis container"]
  end

  subgraph Cluster["Kubernetes"]
    Ingress["Ingress"]
    FESvc["frontend-service"]
    BESvc["backend-service"]
    WorkerDep["worker-deployment"]
    PG["postgres-statefulset or managed DB"]
    RD["redis-service"]
    Secret["Secret"]
    Config["ConfigMap"]
  end

  DC --> FE1
  DC --> BE1
  DC --> WK1
  DC --> PG1
  DC --> RD1

  Ingress --> FESvc
  Ingress --> BESvc
  BESvc --> PG
  BESvc --> RD
  WorkerDep --> PG
  WorkerDep --> RD
  Secret --> BESvc
  Config --> BESvc
  Secret --> WorkerDep
  Config --> WorkerDep
```

## Architectural Decisions

- Start as a modular monolith to maximize hackathon velocity.
- Keep queue, worker, and event boundaries explicit so it can be explained as scalable architecture.
- Use PostgreSQL as the only source of truth for business state.
- Use Redis for derived/realtime state, not irreplaceable rental data.
- Use BullMQ on Redis for background jobs unless the team strongly prefers RabbitMQ.
- Use SSE for dashboard realtime updates because it is simpler than WebSockets for one-way admin updates.
- Mock payment processing for the hackathon unless real payment integration is a judging requirement.
- Generate invoices server-side and expose a stable download URL.

