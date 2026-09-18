# GprFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-17%2B-blue)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://react.dev/)

A full-stack cryptocurrency trading platform. Users can buy/sell crypto, manage a wallet, track portfolio performance, and interact with an AI chatbot powered by Gemini. Admins can approve or reject withdrawal requests.

---

## Features

- Buy/sell cryptocurrencies against a wallet balance
- Real-time market data and price charts (CoinGecko API, multiple timeframes)
- Portfolio view with per-asset profit/loss and full trading history
- Wallet: deposit via Stripe, withdraw, transfer between users
- Watchlist for saved coins
- JWT authentication + optional 2FA (OTP via email) + Google OAuth2 social login
- Forgot/reset password flow (OTP via email)
- Gemini AI chatbot for crypto Q&A
- Admin panel for withdrawal approval/rejection

---

## Tech Stack

### Backend
| | |
|---|---|
| Language | Java 17+ |
| Framework | Spring Boot 3.2.4, Spring Cloud Gateway |
| Security | Spring Security, JWT (jjwt 0.11), OAuth2 (Google) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15 |
| Payments | Stripe |
| External APIs | CoinGecko, Gemini AI |
| Email | Gmail SMTP |
| Build | Maven |

### Frontend
| | |
|---|---|
| Language | JavaScript (JSX) |
| Framework | React 18.2 |
| Build | Vite 5 |
| State | Redux + Redux Thunk |
| Routing | React Router v6 |
| UI | Tailwind CSS, Radix UI (shadcn/ui) |
| Charts | ApexCharts, Recharts |
| Forms | React Hook Form + Zod / Yup |
| HTTP | Axios |

---

## Architecture

The backend is being split, one domain at a time, from a Spring Boot monolith into
independent services. Today the stack is five Spring Boot processes plus the frontend,
all fronted by a single API gateway:

| Service | Port | Owns |
|---|---|---|
| `gateway` | `8080` | Single entry point for the frontend. Routes by path prefix to the service below that owns it. |
| `monolith` | `5454` | Auth, User, PaymentDetails (saved payment methods), Verification (email OTP), Watchlist. Everything not yet extracted. |
| `coin-service` | `5455` | Coin/market-data domain (CoinGecko integration). |
| `chatbot-service` | `5456` | Gemini AI chatbot. Stateless, no database. |
| `ledger-service` | `5457` | Wallet, Order, Asset, Payment, Withdrawal. |

**Routing:** the gateway forwards `/api/coins/**` → coin-service, `/chat/**` → chatbot-service,
`/api/wallet/**`, `/api/orders/**`, `/api/payment/**`, `/api/withdrawal/**`,
`/api/admin/withdrawal/**`, `/api/assets/**` → ledger-service, and everything else through to
the monolith. For the paths above, the gateway validates the JWT itself once and forwards the
caller's identity to the downstream service as `X-User-Id` / `X-User-Role` / `X-User-Email` /
`X-User-Full-Name` headers instead of the raw token — `ledger-service` in particular has no
JWT-validation logic of its own and fully trusts those headers, so it must never be reached
except through the gateway (it doesn't publish a port in Docker Compose, so this is already
enforced there).

**Database:** one PostgreSQL 15 instance shared by all services, split by schema —
`public` (monolith), `coin` (coin-service), `ledger` (ledger-service). `chatbot-service` has no
database. Schema creation currently relies on Hibernate's `ddl-auto=update` under the `dev`
profile (see [Production readiness checklist](#production-readiness-checklist)).

---

## Prerequisites

- **Docker + Docker Compose** — the only requirement to run the full stack (recommended path).
- For service-by-service local development with hot reload instead: **Java 17+ and Maven 3.6+**
  per backend service, and **Node.js 18+ and npm** for the frontend.

---

## Local development

### Quick start (Docker Compose — runs everything)

```bash
git clone <repo-url>
cd GprFlow
cp .env.example .env   # defaults work out of the box for local dev
docker compose up --build
```

This builds and starts Postgres, all five backend services, and the frontend. Open
`http://localhost:5173` — the frontend talks to the gateway at `http://localhost:8080`, which
routes to whichever service owns the request.

### Service-by-service (hot reload)

Useful when working on a single service without rebuilding everything:

```bash
# 1. Start just the database
docker compose up -d db

# 2. Run the service(s) you're working on, each in its own terminal
cd backend/monolith && mvn spring-boot:run          # http://localhost:5454
cd backend/coin-service && mvn spring-boot:run       # http://localhost:5455
cd backend/chatbot-service && mvn spring-boot:run    # http://localhost:5456
cd backend/ledger-service && mvn spring-boot:run     # http://localhost:5457
cd backend/gateway && mvn spring-boot:run            # http://localhost:8080

# 3. Run the frontend
cd frontend && npm install && npm run dev            # http://localhost:5173
```

`ledger-service` and `coin-service` need the `dev` Spring profile active locally (it switches
`ddl-auto` from `validate` to `update` so Hibernate creates their schema), e.g.:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

By default `frontend/.env.example` (`VITE_API_BASE_URL`) points the frontend straight at the
monolith (`5454`), bypassing the gateway. That's fine for monolith-only routes; point it at the
gateway (`8080`) instead if you're testing wallet/order/payment/withdrawal/asset/coin/chat
routes without running the full Compose stack.

Backend secrets for local `mvn spring-boot:run` go in `backend/monolith/.env.example` →
`backend/monolith/.env` (gitignored); the other services take their env vars directly, with
working localhost defaults.

---

## Project Structure

```
GprFlow/
├── docker-compose.yml                       # Orchestrates db + all backend services + frontend
├── db/init/01-schemas.sql                   # Creates the coin/ledger Postgres schemas (fresh volume only)
│
├── backend/
│   ├── monolith/          # Auth, User, PaymentDetails, Verification, Watchlist
│   ├── coin-service/      # Coin / market-data domain
│   ├── chatbot-service/   # Gemini AI chatbot
│   ├── ledger-service/    # Wallet, Order, Asset, Payment, Withdrawal
│   └── gateway/           # Spring Cloud Gateway — single entry point, JWT validation
│       └── (each service is an independent Maven project with its own Dockerfile,
│            following controller/ → service/ → repository/ → model/ under dev.pioruocco)
│
└── frontend/                        # React + Vite SPA
    └── src/
        ├── Api/api.js               # Axios instance (base URL from runtime config / env)
        ├── Redux/                   # Store + per-domain slices (Auth, Coin, Wallet, …)
        ├── pages/                   # Route-level components
        ├── components/
        │   ├── ui/                  # shadcn/ui primitives (Radix + Tailwind)
        │   └── custome/             # App-specific reusable components
        ├── Util/                    # Pure utility functions
        └── App.jsx                  # Router + auth gate
```

---

## Configuration Reference

Every service is configured via environment variables (`${VAR:default}` in each
`application.properties`/`application.yml`), not by hand-editing config files. Start from the
example files and fill in real values:

| File | Used by |
|---|---|
| `.env.example` (repo root) | `docker compose up` — DB credentials, `JWT_SECRET`, `FRONTEND_URL`, `API_BASE_URL`, SMTP, Stripe/CoinGecko/Gemini keys, Google OAuth2 |
| `backend/monolith/.env.example` | Bare `mvn spring-boot:run` for the monolith |
| `frontend/.env.example` | `VITE_API_BASE_URL` for `npm run dev` |

Copy each to its `.env` counterpart (gitignored) and edit; never commit the real `.env` files.

---

## Production deployment (self-hosted on Ubuntu, behind a Cloudflare Tunnel)

This walks through putting the stack on a home Ubuntu server and exposing it on a domain
managed by Cloudflare, using **Cloudflare Tunnel** instead of router port-forwarding — no open
inbound ports are needed, and it keeps working even if your ISP gives you a dynamic IP or puts
you behind CGNAT (both common on residential connections).

### 1. Prerequisites

- Ubuntu server with Docker Engine + the Docker Compose plugin installed.
- The domain already added to a Cloudflare account (DNS managed by Cloudflare).
- A free Cloudflare Zero Trust account (needed to create a Tunnel).

### 2. Configure the app for your domain

```bash
git clone <repo-url>
cd GprFlow
cp .env.example .env
```

Edit `.env` and set **real, strong values** — the defaults in `.env.example` are placeholders
meant for local dev only, not production:

```bash
JWT_SECRET=$(openssl rand -base64 48)   # generate and paste this in, don't reuse the sample value
FRONTEND_URL=https://app.yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

Also fill in your real SMTP, Stripe, CoinGecko, Gemini, and Google OAuth2 credentials.

You'll typically want **two public hostnames** — one for the frontend, one for the API — because
the frontend calls `API_BASE_URL` as an absolute URL and the bundled nginx doesn't do
path-based routing to the gateway:

- `app.yourdomain.com` → the `frontend` container (nginx, internal port 80)
- `api.yourdomain.com` → the `gateway` container (internal port 8080)

### 3. Mandatory: allow your domain in CORS before starting

CORS-allowed origins are **hardcoded** in `backend/gateway/src/main/resources/application.yml`
(under `spring.cloud.gateway.globalcors.cors-configurations.'[/**]'.allowedOrigins`), not read
from an environment variable. Add your frontend origin (e.g. `"https://app.yourdomain.com"`) to
that list, or the browser will reject every request with a CORS error the moment you point the
frontend at your real domain.

`auth-service` is the one exception to "the gateway is the only service that terminates CORS": it
validates its own JWTs independently (see the trust-model note in `CLAUDE.md`) and enforces its
**own** CORS list in `backend/auth-service/src/main/java/dev/pioruocco/config/AppConfig.java`
(`corsConfigurationSource()`), separate from the gateway's. Requests to `/auth/**` and
`/login/oauth2/**` pass through the gateway but are still CORS-checked again at auth-service
itself, so your frontend origin needs adding to **both** lists — missing this one specifically
breaks signin/signup/OAuth from the browser while everything else works, which makes it an easy
thing to half-fix and move on from.

This is a one-time step per domain, not something you need to repeat on every deploy — but it
must happen before the first production build.

### 4. Set up the Cloudflare Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create gprflow
cloudflared tunnel route dns gprflow app.yourdomain.com
cloudflared tunnel route dns gprflow api.yourdomain.com
```

The last two commands auto-create the proxied DNS records for both hostnames — no manual
dashboard editing needed.

`docker-compose.yml` already has a `cloudflared` service wired up, pointed at
`http://frontend:80` and `http://gateway:8080` via the tunnel's own ingress config (configured on
the tunnel itself, in the Cloudflare dashboard under the tunnel's **Public Hostname** tab, not in
the Compose file). All you need to do locally is put the tunnel's token in `.env`:

```bash
TUNNEL_TOKEN=your-tunnel-token   # Zero Trust dashboard: Networks > Tunnels > gprflow > Configure
```

If you'd rather not run `cloudflared` in Docker, install it directly on the host as a systemd
service instead and point its ingress config at `http://localhost:5173` and
`http://localhost:8087` (the gateway's host-published port — see `docker-compose.yml`; it's not
8080, moved to avoid colliding with other services on the host) — then drop the `cloudflared`
service from `docker-compose.yml`.

### 5. Update third-party redirect URLs

Google OAuth2 (Google Cloud Console) and any Stripe webhook or redirect URLs need to be
updated to point at your new public domain — they were previously configured for `localhost`.

### 6. Build and start

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
```

### 7. Backups

Nothing backs up the database automatically. A simple daily cron job:

```bash
docker compose exec -T db pg_dump -U postgres gprflow > /path/outside/repo/gprflow-$(date +%F).sql
```

### 8. Updating

```bash
git pull
docker compose up -d --build
```

---

## Production readiness checklist

Beyond the CORS step above (which is mandatory to get working at all), the following were found
during a review of the codebase and are worth addressing before treating this as a real
production deployment with real user data. None of these are fixed automatically by the steps
above — they're listed here to track, not already resolved:

- **Hardcoded JWT fallback secret in `docker-compose.yml`.** The `JWT_SECRET` environment
  defaults (e.g. `${JWT_SECRET:-wpembytr...}`) fall back to the same fixed string, visible to
  anyone reading the public repo. Setting a real `JWT_SECRET` in `.env` (step 2 above) covers
  this, but it's easy to forget since the app runs fine either way.
- **CORS origins are a hardcoded YAML list, not environment-driven.** Every future domain change
  means editing `application.yml` and rebuilding the gateway, as done manually in step 3. Worth
  migrating to a `${CORS_ALLOWED_ORIGINS:...}` environment variable.
- **Postgres publishes `5441:5432` to the host** in `docker-compose.yml`, for direct debug access
  (psql, DBeaver) — every service actually reaches it over the internal Compose network by the
  `db` hostname, so this isn't required for the app to function. A Cloudflare-Tunnel-only
  deployment never proxies it publicly, but if the host has any other public interface, block it
  with `ufw deny 5441` unless you're actively using the direct-access debug path.
- **Schema is created by Hibernate `ddl-auto=update`, not migrations.** A Liquibase changelog
  exists (`backend/monolith/src/main/resources/db/changelog/db.changelog-master.xml`) but
  `liquibase-core` isn't even a Maven dependency, so it's inert. Fine for a hobby project, but
  risky for schema changes against real data long-term — wiring up Liquibase properly is worth
  doing before this holds anything you can't afford to lose.
- **No automated backups** for the `postgres-data` volume — see the cron job in step 7; it isn't
  set up by default.
- **Inconsistent JWT trust model across services.** auth-service and coin-service each validate
  JWTs independently with their own copy of the filter/secret; ledger-service and user-service
  have no JWT validation of their own at all and fully trust the gateway's `X-User-*` headers;
  chatbot-service has no auth. This isn't urgent for personal use, but it means `ledger-service`,
  `user-service`, `coin-service`, and `chatbot-service` must never be reachable except through the
  gateway — true today because they publish no host ports in Compose, but worth re-checking any
  time the
  Compose file changes.
- **No health checks beyond `db`.** Other services use `depends_on` without
  `condition: service_healthy`, so a cold `docker compose up` can show transient connection
  errors for a few seconds until every Spring service finishes starting. Not a functional
  problem — everything comes up on its own — just noise to expect on first boot or restart.

---

## Testing

```bash
# Any backend service
cd backend/<service>   # monolith, coin-service, chatbot-service, ledger-service, or gateway
mvn test

# Frontend lint
cd frontend
npm run lint
```

`ledger-service` additionally has Testcontainers-backed integration tests covering the wallet
trading flow, wallet concurrency, and withdrawal flow (`src/test/java/dev/pioruocco/**/*IntegrationTest.java`).
Other backend modules currently only have the default Spring Boot context-load test. There is no
frontend test suite (only `npm run lint`).

---

## Contributing

1. Fork the repository and create a feature branch off `main`.
2. Keep changes to different backend services (or the frontend) in separate commits when possible.
3. All `/api/**` endpoints require JWT — test with a valid token.
4. Run `mvn test` for any service you touched, and `npm run lint` for frontend changes, before opening a pull request.

---

## License

[MIT](./LICENSE) — Copyright (c) 2026 Giuseppe Pio Ruocco

---

## Author

**Giuseppe Pio Ruocco** — [GitHub](https://github.com/pioruocco) · dev.pioruocco@gmail.com
