# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GprFlow is a full-stack cryptocurrency trading platform. The backend is a Spring Boot REST API; the frontend is a React/Vite SPA. They are developed independently under `backend/` and `frontend/`.

## Commands

### Backend (`cd backend`)

```bash
# Start dev server (hot reload via Spring Boot DevTools)
mvn spring-boot:run

# Run tests
mvn test

# Build production JAR
mvn clean package

# Build skipping tests
mvn clean package -DskipTests

# Start PostgreSQL via Docker (required before running backend)
docker-compose up -d
```

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

**Database:** PostgreSQL (not MySQL as stated in README). Connection configured in `application.properties` at `jdbc:postgresql://localhost:5432/gprflow`. Run `docker-compose up -d` from `backend/` to start the DB container.

**Security:** Stateless JWT. The `JwtTokenValidator` filter runs before `BasicAuthenticationFilter` and populates `SecurityContext` from the `Authorization: Bearer <token>` header. All `/api/**` routes require authentication. JWT expires after 24 hours. The secret key lives in `JwtConstant.SECRET_KEY` (hardcoded — do not expose in production).

**External integrations:** CoinGecko (market data), Gemini AI (chatbot), Stripe & Razorpay (payments), Gmail SMTP (OTP/email), Google OAuth2 (social login). All API keys are configured in `application.properties` and must be populated locally.

**Database migrations:** Liquibase is configured. The changelog master file is at `backend/src/main/resources/db/changelog/db.changelog-master.xml`. JPA `ddl-auto=update` is also enabled, so schema changes may come from either mechanism.

### Frontend

React 18 SPA with Redux for global state, React Router v6 for routing, Tailwind CSS + Radix UI for styling.

**State management:** Uses the classic Redux pattern (not Redux Toolkit). Each domain slice has three files in `src/Redux/<Domain>/`: `ActionTypes.js`, `Action.js` (thunks dispatching to the backend via Axios), and `Reducer.js`. The combined store is in `src/Redux/Store.js`.

Redux slices: `auth`, `coin`, `wallet`, `order`, `asset`, `watchlist`, `withdrawal`, `chatBot`.

**Routing:** `App.jsx` is the auth gate — unauthenticated users see auth-only routes; authenticated users see app routes. Route access is also role-gated (`ROLE_USER` vs `ROLE_ADMIN`). The admin-only route is `/admin/withdrawal`.

**API client:** A single Axios instance in `src/Api/api.js` with `baseURL=http://localhost:5454`. To switch to production, change the `API_BASE_URL` export in that file.

**`src/pages/`** — Page-level components, each in their own folder (e.g., `Home/`, `StockDetails/`, `Wallet/`, `Auth/`).

**`src/components/ui/`** — shadcn/ui components (Radix UI primitives with Tailwind styling). Do not hand-edit these; regenerate via the shadcn CLI if needed.

**`src/components/custome/`** — App-specific reusable components (`CustomeToast`, `SpinnerBackdrop`).

**`src/Util/`** — Pure utility functions (date formatting, profit calculation, watchlist lookup, etc.).

**Path alias:** `@` resolves to `src/` (configured in `jsconfig.json` and `vite.config.js`).

## Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/src/main/resources/application.properties` | DB URL, SMTP, API keys, server port |
| `backend/docker-compose.yml` | PostgreSQL container (`postgres:15`, port 5432) |
| `backend/src/main/java/dev/pioruocco/config/AppConfig.java` | Spring Security filter chain, CORS origins, password encoder |
| `backend/src/main/java/dev/pioruocco/config/JwtConstant.java` | JWT secret key and header name |
| `frontend/src/Api/api.js` | Axios base URL (toggle localhost vs deployed) |
| `frontend/vite.config.js` | Vite build config and `@` path alias |
| `frontend/tailwind.config.js` | Tailwind theme extensions |
