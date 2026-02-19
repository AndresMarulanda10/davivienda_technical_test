# Davivienda — Simplified E-commerce with Checkout

**Author:** Andres Marulanda
**Stack:** NestJS · Astro 4 · PostgreSQL · Redis · Docker
**Repository:** [AndresMarulanda10/davivienda_technical_test](https://github.com/AndresMarulanda10/davivienda_technical_test)

---

## Running the project

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 4.x
- Docker Compose v2 (bundled with Docker Desktop)

### Steps

```bash
git clone https://github.com/AndresMarulanda10/davivienda_technical_test.git
cd davivienda_technical_test

cp .env.example .env

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (Astro) | http://localhost:3000 |
| Backend API (NestJS) | http://localhost:4000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Database migrations run automatically on backend startup.

---

## Local development (without Docker)

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- PostgreSQL and Redis running locally, or via `docker compose up postgres redis`

```bash
pnpm install

docker compose up postgres redis -d

pnpm dev:backend

pnpm dev:frontend
```

---

## Project structure

```
davivienda_technical_test/
├── backend/                     # NestJS REST API — Clean Architecture + CQRS
├── frontend/                    # Astro 4 SSR — Islands Architecture with React + HeroUI
├── packages/
│   └── shared-types/            # TypeScript types shared between backend and frontend
├── docker-compose.yml
├── docker-compose.override.yml  # Local development overrides
└── .env.example
```
