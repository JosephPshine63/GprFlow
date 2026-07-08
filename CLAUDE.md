# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GprFlow is a full-stack cryptocurrency trading platform. The backend is being incrementally split from a Spring Boot monolith into microservices (in progress); the frontend is a React/Vite SPA under `frontend/`. Backend Maven modules live under `backend/`, each an independent Spring Boot project (no reactor/aggregator `pom.xml`) with its own Dockerfile:

- `backend/monolith/` — the original Spring Boot REST API. Still owns most domains (Auth, User, Wallet, Order, Payment, Withdrawal, Watchlist, Asset); domains are being extracted out one at a time (see `dev.pioruocco` package under it for what currently lives here).

## Commands

### Backend monolith (`cd backend/monolith`)

```bash
# Start dev server (hot reload via Spring Boot DevTools)
mvn spring-boot:run

# Run tests
mvn test

# Run a single test class or method
mvn test -Dtest=ClassName
mvn test -Dtest=ClassName#methodName

# Build production JAR
mvn clean package

# Build skipping tests
mvn clean package -DskipTests
```

Local dev (`mvn spring-boot:run`) needs only PostgreSQL running: `docker compose up -d db` from the repo root. App env vars fall back to sane localhost defaults; copy `backend/monolith/.env.example` to `backend/monolith/.env` and `source` it only if you need non-default values (real API keys, etc.).

Backend runs on `http://localhost:5454`.

### Frontend (`cd frontend`)

```bash
# Install dependencies
npm install

# Start dev server (Vite HMR)
npm run dev

# Lint
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

Frontend runs on `http://localhost:5173`.

### Full stack (from repo root)

```bash
# Build and start db + app + frontend containers
docker compose up --build

# Start only the DB (for local mvn/npm dev, no rebuild)
docker compose up -d db
```

Copy `.env.example` to `.env` at the repo root first if you need non-default values; all variables have working localhost defaults so `docker compose up --build` works with zero configuration.

## Architecture

### Backend

Standard Spring Boot layered architecture: `controller → service → repository → database`.

Main package: `dev.pioruocco`

- **`controller/`** — REST endpoints. Each controller delegates entirely to a service interface.
- **`service/`** — Business logic. Each domain has a `XxxService` interface and an `XxxServiceImplementation` (or `XxxServiceImpl`) class.
- **`repository/`** — Spring Data JPA repositories extending `JpaRepository`.
- **`model/`** — JPA entities (`User`, `Wallet`, `Asset`, `Order`, `OrderItem`, `Coin`, `Watchlist`, `Withdrawal`, `PaymentOrder`, `PaymentDetails`, `WalletTransaction`, `TwoFactorOTP`, `ForgotPasswordToken`, `VerificationCode`).
- **`domain/`** — Enums: `USER_ROLE`, `OrderType`, `OrderStatus`, `WalletTransactionType`, `WithdrawalStatus`, `PaymentMethod`, `PaymentOrderStatus`, `VerificationType`, `UserStatus`.
- **`config/`** — Spring Security (`AppConfig.java`), JWT generation (`JwtProvider.java`), JWT filter (`JwtTokenValidator.java`), and constants (`JwtConstant.java`).
- **`exception/`** — `GlobelExeptions` (global `@ControllerAdvice`), plus domain-specific exception classes.
- **`request/` / `response/`** — DTOs for API request/response bodies.

**Database:** PostgreSQL (not MySQL as stated in README). Connection is `${DB_URL:jdbc:postgresql://localhost:5432/gprflow}` in `application.properties` — overridable via env var, defaults to localhost for bare `mvn spring-boot:run`. Run `docker compose up -d db` from the repo root to start just the DB container, or `docker compose up --build` for the full stack.

**Security:** Stateless JWT. The `JwtTokenValidator` filter runs before `BasicAuthenticationFilter` and populates `SecurityContext` from the `Authorization: Bearer <token>` header. All `/api/**` routes require authentication. JWT expiration is `${JWT_EXPIRATION_MS:86400000}` (24h default). The secret lives in `JwtConstant` via `${JWT_SECRET:...}` — has a working default for local dev, but **must** be overridden via env var for any non-local deployment.

**External integrations:** CoinGecko (market data), Gemini AI (chatbot), Stripe & Razorpay (payments), Gmail SMTP (OTP/email), Google OAuth2 (social login). All API keys are `${VAR:default}`-driven in `application.properties`; see `backend/monolith/.env.example` for the full list. Real values go in `backend/monolith/.env` (gitignored) for local dev, or the root `.env` for Docker Compose.

**Database migrations:** A Liquibase changelog master file exists at `backend/monolith/src/main/resources/db/changelog/db.changelog-master.xml`, but `liquibase-core` is not currently a `pom.xml` dependency, so it's not actually on the classpath or wired up. JPA `ddl-auto` is `validate` by default (`application.properties`) and `update` under the `dev` profile (`application-dev.properties`, also the profile Docker Compose activates for the `app` service) — schema creation currently relies entirely on Hibernate's `dev`-profile `ddl-auto=update`, not Liquibase.

**Test coverage:** Currently minimal — `backend/monolith/src/test` only contains the default Spring Boot context-load test. There is no frontend test suite (only `npm run lint`).

### Frontend

React 18 SPA with Redux for global state, React Router v6 for routing, Tailwind CSS + Radix UI for styling.

**State management:** Uses the classic Redux pattern (not Redux Toolkit). Each domain slice has three files in `src/Redux/<Domain>/`: `ActionTypes.js`, `Action.js` (thunks dispatching to the backend via Axios), and `Reducer.js`. The combined store is in `src/Redux/Store.js`.

Redux slices: `auth`, `coin`, `wallet`, `order`, `asset`, `watchlist`, `withdrawal`, `chatBot`.

**Routing:** `App.jsx` is the auth gate — unauthenticated users see auth-only routes; authenticated users see app routes. Route access is also role-gated (`ROLE_USER` vs `ROLE_ADMIN`). The admin-only route is `/admin/withdrawal`.

**API client:** A single Axios instance in `src/Api/api.js`. `baseURL` resolves `window.__RUNTIME_CONFIG__?.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL` — the runtime-config value is injected by the Docker container's entrypoint script (`frontend/docker-entrypoint.d/30-runtime-config.sh`, writes `public/runtime-config.js` from the `API_BASE_URL` env var) so one built image can target different backends without a rebuild; the Vite env var (`frontend/.env`, from `.env.example`) is the local-dev fallback.

**`src/pages/`** — Page-level components, each in their own folder (e.g., `Home/`, `StockDetails/`, `Wallet/`, `Auth/`).

**`src/components/ui/`** — shadcn/ui components (Radix UI primitives with Tailwind styling). Do not hand-edit these; regenerate via the shadcn CLI if needed.

**`src/components/custome/`** — App-specific reusable components (`CustomeToast`, `SpinnerBackdrop`).

**`src/Util/`** — Pure utility functions (date formatting, profit calculation, watchlist lookup, etc.).

**Path alias:** `@` resolves to `src/` (configured in `jsconfig.json` and `vite.config.js`).

## Claude Code Workflow

When asked to generate a prompt to hand back in plan mode, or to produce content meant to go into a `.md` file that is itself a prompt (not project documentation), write the file(s) to `/home/giuseppe-pio-ruocco/Scrivania/md/gprflow/` instead of the repo or scratchpad.

### Git commits and pushes

Never add any reference to Claude/AI authorship anywhere that ends up committed or pushed — no `Co-Authored-By: Claude`, no "Generated with Claude Code" trailers, no mentions in commit messages, PR titles/descriptions, code comments, or committed docs. This overrides the default Claude Code commit template.

## Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/monolith/src/main/resources/application.properties` | DB URL, SMTP, API keys, server port — all `${VAR:default}` |
| `backend/monolith/.env.example` / `backend/monolith/.env` | Backend secrets for local `mvn spring-boot:run` (`.env` gitignored) |
| `backend/monolith/Dockerfile` | Multi-stage build (`maven:3.9-eclipse-temurin-17` → `eclipse-temurin:17-jre`) |
| `docker-compose.yml` (repo root) | Orchestrates `db` + `app` + `frontend` containers |
| `.env.example` / `.env` (repo root) | Secrets/config for `docker compose up` (`.env` gitignored) |
| `backend/monolith/src/main/java/dev/pioruocco/config/AppConfig.java` | Spring Security filter chain, CORS origins, password encoder |
| `backend/monolith/src/main/java/dev/pioruocco/config/JwtConstant.java` | JWT secret key, expiration, and header name |
| `frontend/src/Api/api.js` | Axios instance, resolves `baseURL` from runtime config or Vite env |
| `frontend/Dockerfile` | Multi-stage build (`node:20-alpine` → `nginx:alpine`) |
| `frontend/nginx.conf` | SPA fallback routing (`try_files $uri /index.html`) |
| `frontend/docker-entrypoint.d/30-runtime-config.sh` | Writes `runtime-config.js` from `API_BASE_URL` at container start |
| `frontend/.env.example` / `frontend/.env` | `VITE_API_BASE_URL` for local `npm run dev` (`.env` gitignored) |
| `frontend/vite.config.js` | Vite build config and `@` path alias |
| `frontend/tailwind.config.js` | Tailwind theme extensions |
