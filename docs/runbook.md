# Linces-CKF — DevOps Runbook

## Table of Contents
1. [Local Development Setup](#1-local-development-setup)
2. [Environment Variables](#2-environment-variables)
3. [Docker](#3-docker)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Cloud Deployment](#5-cloud-deployment)
6. [Secrets Management](#6-secrets-management)
7. [Monitoring & Logging](#7-monitoring--logging)
8. [Backup & Disaster Recovery](#8-backup--disaster-recovery)
9. [Branching Strategy](#9-branching-strategy)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Local Development Setup

### Prerequisites
| Tool | Version |
|------|---------|
| Node.js | 20.x LTS |
| npm | 10.x+ |
| Docker Desktop | 24.x+ |
| Git | 2.x+ |

### First-time setup

```bash
# 1. Clone the repo
git clone https://github.com/<org>/linces-ckf.git
cd linces-ckf

# 2. Create local env files from examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit the env files with your local values
#    (DB_PASSWORD, JWT_SECRET at minimum)

# 4. Start all services with Docker Compose
docker compose up --build

# Services will be available at:
#   Frontend: http://localhost:5173
#   Backend:  http://localhost:3000
#   Postgres: localhost:5432
```

### Run without Docker (faster iteration)

```bash
# Terminal 1 — Postgres only via Docker
docker compose up db

# Terminal 2 — NestJS backend
cd backend
npm install
npm run start:dev

# Terminal 3 — React frontend
cd frontend
npm install
npm run dev
```

---

## 2. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | `development` / `test` / `production` | Yes |
| `PORT` | HTTP port (default `3000`) | No |
| `DB_HOST` | Postgres host | Yes |
| `DB_PORT` | Postgres port (default `5432`) | No |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | Secret for signing JWTs | Yes |
| `JWT_EXPIRATION` | Token TTL (e.g. `3600s`) | No |
| `CORS_ORIGIN` | Allowed frontend origin | Yes |
| `MAIL_*` | SMTP credentials for email | No |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend base URL | Yes |

> **Note:** Variables must be prefixed `VITE_` to be accessible in the browser bundle.

---

## 3. Docker

### Images

| Service | Dockerfile | Base image |
|---------|-----------|-----------|
| backend | `backend/Dockerfile` | `node:20-alpine` |
| frontend | `frontend/Dockerfile` | `node:20-alpine` → `nginx:1.25-alpine` |
| db | Docker Hub official | `postgres:16-alpine` |

### Common commands

```bash
# Start development environment
docker compose up

# Rebuild after dependency changes
docker compose up --build

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove containers + volumes (destructive — wipes DB data)
docker compose down -v

# Connect to running Postgres
docker compose exec db psql -U postgres -d linces_dev
```

---

## 4. CI/CD Pipeline

### Workflows

| File | Trigger | Purpose |
|------|---------|---------|
| `.github/workflows/ci.yml` | Every PR to `main`, every push to `main` | Lint, build, test, Docker smoke build |
| `.github/workflows/cd.yml` | Push to `main` (after CI passes) | Build & push images to GHCR, deploy to cloud |

### CI jobs

```
PR opened / push to main
       │
       ├─ Backend CI ──────► lint → build → unit tests → e2e tests → upload coverage
       ├─ Frontend CI ─────► lint → build → unit tests → upload coverage
       └─ Docker Build ────► (runs after Backend + Frontend) build backend image, build frontend image
```

### CD jobs (main only)

```
Push to main (after CI passes)
       │
       └─ Build & Push ───► build images with SHA tag → push to GHCR
              │
              └─ Deploy ──► trigger cloud deploy (Render / Heroku / AWS ECS)
```

### Required GitHub Secrets

Set these under **Settings → Secrets and variables → Actions**:

| Secret | Used by | Description |
|--------|---------|-------------|
| `VITE_API_URL` | CD | Production API URL injected at build time |
| `RENDER_DEPLOY_HOOK_URL` | CD (Render) | Render deploy hook URL |
| `HEROKU_API_KEY` | CD (Heroku) | Heroku API key |
| `HEROKU_APP_NAME` | CD (Heroku) | Heroku app name |
| `HEROKU_EMAIL` | CD (Heroku) | Heroku account email |
| `AWS_ACCESS_KEY_ID` | CD (AWS) | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | CD (AWS) | AWS IAM secret key |
| `AWS_REGION` | CD (AWS) | AWS region |
| `ECS_CLUSTER` | CD (AWS) | ECS cluster name |
| `ECS_SERVICE` | CD (AWS) | ECS service name |

### Required GitHub Variables (not secrets)

| Variable | Value | Description |
|----------|-------|-------------|
| `DEPLOY_TARGET` | `render` / `heroku` / `aws-ecs` | Which deploy option to activate |

---

## 5. Cloud Deployment

### Option A: Render (Recommended for class project)

1. Create a Render account at render.com
2. Create a **PostgreSQL** database service
3. Create a **Web Service** for the backend, select "Docker", point to `./backend`
4. Create a **Static Site** for the frontend, select "Docker", point to `./frontend`
5. Set all environment variables from Section 2 in the Render dashboard
6. Copy the deploy hook URL → add as `RENDER_DEPLOY_HOOK_URL` GitHub secret
7. Set `DEPLOY_TARGET = render` in GitHub variables

### Option B: Heroku

```bash
# Install Heroku CLI, then:
heroku login
heroku create linces-ckf-api
heroku create linces-ckf-web
heroku addons:create heroku-postgresql:mini --app linces-ckf-api

# Push config vars
heroku config:set NODE_ENV=production JWT_SECRET=<secret> --app linces-ckf-api
```

Set `DEPLOY_TARGET = heroku` in GitHub variables and add the Heroku secrets listed above.

---

## 6. Secrets Management

- **Never commit** `.env` files. The `.gitignore` blocks them.
- Use `.env.example` to document required variables without values.
- In CI, inject secrets via GitHub Actions secrets (never print them in logs).
- In production, use the cloud platform's secret/environment variable manager (Render dashboard, Heroku config vars, AWS Secrets Manager, etc.).
- Rotate `JWT_SECRET` and database passwords quarterly.
- Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 7. Monitoring & Logging

### Application Logs

NestJS uses a built-in logger. All logs go to stdout so the container runtime (Docker / cloud platform) captures them automatically.

```bash
# Stream backend logs in production
docker compose -f docker-compose.prod.yml logs -f backend
```

For a persistent log aggregation solution, integrate one of:
- **Papertrail** (free tier, works with Heroku/Render log drain)
- **Logtail** / **Betterstack**
- **AWS CloudWatch Logs** (if deploying to AWS)

### Health Checks

| Endpoint | Expected response |
|----------|------------------|
| `GET /health` (backend, to be implemented by Role 1) | `200 OK` |
| `GET /health` (nginx frontend) | `200 ok` |

The `docker-compose.yml` and `docker-compose.prod.yml` include Postgres health checks out of the box.

---

## 8. Backup & Disaster Recovery

### Automated Postgres backup (Render / Heroku)

Both Render and Heroku provide daily automated backups for managed Postgres. Verify under your database service dashboard.

### Manual backup

```bash
# Dump the database
docker compose exec db pg_dump -U postgres linces_dev > backup_$(date +%Y%m%d).sql

# Restore from dump
cat backup_20260313.sql | docker compose exec -T db psql -U postgres linces_dev
```

### Recovery steps

1. Provision a new Postgres instance with the same credentials
2. Restore the latest backup SQL dump
3. Redeploy backend and frontend (CD pipeline or manual `docker compose -f docker-compose.prod.yml up -d`)
4. Verify health check endpoints return `200`

---

## 9. Branching Strategy

```
main ──────────────────────────────────────────► (protected, CI required)
  │
  ├── feature/role1-auth-endpoints
  ├── feature/role2-product-catalog
  ├── feature/role3-integration-tests
  ├── feature/role4-ci-cd-pipeline
  ├── feature/role5-qa-test-suite
  └── feature/role6-security-hardening
```

**Rules:**
- No direct commits to `main`
- All changes via Pull Request
- 1 approval required before merge
- CI must pass before merging
- Delete feature branch after merge

---

## 10. Troubleshooting

### `docker compose up` fails — port already in use

```bash
# Find and kill the conflicting process
lsof -i :5432   # or :3000, :5173
kill -9 <PID>
```

### Backend can't connect to Postgres

- Confirm `DB_HOST=db` (the Docker service name, not `localhost`) when running inside Docker
- Confirm `DB_HOST=localhost` when running outside Docker
- Check Postgres health: `docker compose ps`

### CI fails on tests but passes locally

- Ensure test environment variables match the CI job's `env:` block in `ci.yml`
- Check that the test database (`linces_test`) is being used, not the dev database

### `VITE_API_URL` not available in browser

- Vite only exposes variables prefixed with `VITE_`. Double-check the variable name.
- Rebuild the frontend container after changing env vars.
