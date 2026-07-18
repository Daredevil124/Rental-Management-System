# Rental Management System - Demo Runbook

This document details how to run, test, and demonstrate the Rental Management System using the Docker development stack and Kubernetes manifests.

---

## 1. Local Development Startup (Docker Compose)

The environment includes Postgres, Redis, the Express Backend API, a background worker, and the React Frontend.

### Prerequisites
- Docker and Docker Compose installed.
- Port `3000` (Frontend), `5000` (Backend API), `5432` (Postgres), and `6379` (Redis) must be free on your host.

### Step-by-Step Launch
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Build and start the containers in the foreground to monitor logs:
   ```bash
   docker compose up --build
   ```
3. Verify that the services started successfully:
   - **Postgres**: Initializes and mounts the database schema & seeds via [seed.sql](file:///Users/drumilbhati/Documents/Github/Rental-Management-System/infra/postgres/seed.sql).
   - **Redis**: Connects and establishes the Pub/Sub channels.
   - **Backend API**: Accessible at [http://localhost:5000](http://localhost:5000).
   - **Background Worker**: Starts listening to the BullMQ `background-jobs` queue.
   - **Frontend UI**: Accessible at [http://localhost:3000](http://localhost:3000).

---

## 2. Verifying Platform & Event Infrastructure

Use `curl` or a REST client to execute these validation steps.

### A. API Health Check
Ensure the backend and logging middleware (Request ID generation) are active.
```bash
curl -i http://localhost:5000/api/v1/health
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "..."
  },
  "meta": {
    "requestId": "..."
  }
}
```

### B. System Metrics Endpoint
Verify the system observability metrics (memory usage, cpu metrics, process metrics).
```bash
curl -i http://localhost:5000/api/v1/metrics
```

### C. Live Dashboard Event Stream (SSE)
Subscribe to the Server-Sent Events (SSE) channel to watch realtime updates:
```bash
curl -N http://localhost:5000/api/v1/admin/dashboard/events
```
*Note: Keep this terminal open. It will print a heartbeat event block when connection completes.*

### D. Simulate Event-Driven Workflows
When Person A implements routes, calling checkout or returns will push event payloads.
For demo validation, you can fetch an invoice download which automatically spawns files inside the worker:
```bash
curl -i http://localhost:5000/api/v1/rentals/demo-rental-100/invoice
```
*This command generates a beautiful, printable HTML file dynamically at `backend/storage/invoices/invoice-demo-rental-100.html` and streams it back.*

---

## 3. Seed Users & Data

The database has been seeded with standard test profiles.
- **Admin Login**:
  - Email: `admin@rental.com`
  - Password hash is preloaded (Standard bcrypt hash for password `password`).
- **Customer Login**:
  - Email: `jane.doe@example.com`
- **Seeded Inventory**:
  - `DeWalt Rotary Hammer Drill` (SKU: `DEW-HAMMER-YEL`, Serial: `SN-HAMMER-001`, Status: `AVAILABLE`)
  - `Yamaha Portable Generator` (SKU: `YAM-GEN-2000`, Serial: `SN-GEN-002`, Status: `MAINTENANCE`)
  - `Outdoor Extension Cord 50ft` (SKU: `EXT-CORD-50FT`, Serial: `SN-CORD-001`, Status: `AVAILABLE`)

---

## 4. Kubernetes Deployment

To run this stack in a Kubernetes cluster (Minikube or Cloud Kubernetes engine):

1. **Apply Configuration & Secrets**:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   ```
2. **Launch PostgreSQL (StatefulSet) and Redis**:
   ```bash
   kubectl apply -f k8s/postgres.yaml
   kubectl apply -f k8s/redis.yaml
   ```
3. **Deploy Backend API, Background Worker, and Frontend**:
   ```bash
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/worker.yaml
   kubectl apply -f k8s/frontend.yaml
   ```
4. **Expose Services via Ingress Routing**:
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```
