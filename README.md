# GprFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-17%2B-blue)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://react.dev/)

A full-stack cryptocurrency trading platform. Users can buy/sell crypto, manage a wallet, track portfolio performance, and interact with an AI chatbot powered by Gemini. Admins can approve or reject withdrawal requests.

**Live demo:** [gprflow.trade](https://gprflow.trade) — payments run in Stripe test mode, so no real money is involved.

---

## Features

- Buy/sell cryptocurrencies against a wallet balance
- Real-time market data and price charts (CoinGecko API, multiple timeframes)
- Portfolio view with per-asset profit/loss and full trading history
- Wallet: deposit via Stripe, withdraw, transfer between users
- Watchlist for saved coins
- JWT authentication + optional 2FA (OTP via email)
- Forgot/reset password flow (OTP via email)
- Gemini AI chatbot for crypto Q&A
- Per-IP rate limiting and Cloudflare Turnstile on signup, signin and password reset
- Admin panel for withdrawal approval/rejection

---

## Tech Stack

### Backend
| | |
|---|---|
| Language | Java 17+ |
| Framework | Spring Boot 3.2.4, Spring Cloud Gateway |
| Security | Spring Security, JWT (jjwt 0.11) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15 |
| Payments | Stripe |
| External APIs | CoinGecko, Gemini AI, Resend |
| Email | Resend (REST API) |
| Bot protection | Cloudflare Turnstile |
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
independent services. Today the stack is seven Spring Boot processes plus the frontend, all
fronted by a single API gateway:

| Service | Port | Owns |
|---|---|---|
| `gateway` | `8080` (host `8087` in Compose) | Single entry point for the frontend. Routes by path prefix to the service that owns it, and applies rate limiting, a request body cap and Turnstile verification. |
| `monolith` | `5454` | What's left of the original API: a public health-check endpoint (`HomeController`). No DB. |
| `coin-service` | `5455` | Coin/market-data domain (CoinGecko integration). |
| `chatbot-service` | `5456` | Gemini AI chatbot. Stateless, no database. |
| `ledger-service` | `5457` | Wallet, Order, Asset, Payment, Withdrawal. |
| `auth-service` | `5458` | Signup/signin, email OTP (2FA, verification, password reset). Owns the `User` entity and issues the JWTs. |
| `user-service` | `5459` | User profile, Watchlist, PaymentDetails (saved payment methods). |

**Routing:** the gateway forwards `/api/coins/**` → coin-service, `/chat/**` → chatbot-service,
`/api/wallet/**`, `/api/orders/**`, `/api/payment/**`, `/api/withdrawal/**`,
`/api/admin/withdrawal/**`, `/api/assets/**` → ledger-service, `/auth/**`,
`/api/users/profile`, `/api/users/enable-two-factor/**`, `/api/users/verification/**` →
auth-service, `/api/users/{id}`, `/api/users/email/{email}`, `/api/watchlist/**`,
`/api/payment-details` → user-service, and everything else through to the monolith. Route order
in `application.yml` matters: auth-service's `/api/users/profile` must come before user-service's
`/api/users/{id}`, or the latter swallows it.

**Authentication:** auth-service sets the JWT in an `HttpOnly; Secure; SameSite=Strict` `jwt`
cookie; the frontend sends it with `withCredentials` and never reads it from JavaScript. For the
protected path prefixes the gateway validates the JWT once and forwards the caller's identity as
`X-User-Id` / `X-User-Role` / `X-User-Email` / `X-User-Full-Name` headers instead of the raw
token. `ledger-service` and `user-service` have no JWT-validation logic of their own and fully
trust those headers, so they must never be reached except through the gateway (they don't
publish a port in Docker Compose, so this is already enforced there). `auth-service` and
`coin-service` validate JWTs themselves with the same secret as the gateway.

**Abuse protection:** the gateway also runs, before routing, a per-client-IP rate limit (auth
paths 20/min, chatbot 15/min, everything else 300/min; `RATE_LIMIT_*` variables), a 1 MB body cap
(`MAX_BODY_BYTES`) and a Cloudflare Turnstile check on `POST /auth/signup`, `/auth/signin` and
`/auth/users/reset-password/send-otp`. The frontend sends the widget token in the
`X-Turnstile-Token` header. The client IP comes from `CF-Connecting-IP` only when the request
arrives from a private or loopback peer (i.e. through the tunnel). The default Turnstile keys are
Cloudflare's always-pass test keys, so the flow works but nothing is blocked until real keys are
set (see [Configuration Reference](#configuration-reference)). The check fails closed: if the
gateway can't reach Cloudflare, those three endpoints reject every request, and
`TURNSTILE_ENABLED=false` switches it off.

**Email verification:** the `verified` flag on a user is informational only. It is shown on the
profile page but no service enforces it, so an unverified user can trade, top up and withdraw.

**Database:** one PostgreSQL 15 instance shared by all services, split by schema —
`coin` (coin-service), `ledger` (ledger-service), `auth` (auth-service), `users` (user-service).
`monolith` and `chatbot-service` have no database. Schema creation currently relies on Hibernate's `ddl-auto=update` under the `dev`
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

This builds and starts Postgres, the gateway, all six backend services, the frontend, and the
`cloudflared` tunnel container (which needs `TUNNEL_TOKEN`; comment it out in
`docker-compose.yml` for a purely local run). Open
`http://localhost:5173` — the frontend talks to the gateway at `http://localhost:8087`, which
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
cd backend/auth-service && mvn spring-boot:run       # http://localhost:5458
cd backend/user-service && mvn spring-boot:run       # http://localhost:5459
cd backend/gateway && mvn spring-boot:run            # http://localhost:8080

# 3. Run the frontend
cd frontend && npm install && npm run dev            # http://localhost:5173
```

`ledger-service`, `coin-service`, `auth-service`, and `user-service` need the `dev` Spring
profile active locally (it switches `ddl-auto` from `validate` to `update` so Hibernate creates
their schema), e.g.:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Two things differ from the defaults when running outside Compose:

- Compose publishes Postgres on host port **`5441`**, but each service's `DB_URL` default points
  at `localhost:5432`. Set `DB_URL=jdbc:postgresql://localhost:5441/gprflow?currentSchema=<schema>`
  (`coin`, `ledger`, `auth`, `users`).
- `auth-service` calls `user-service` synchronously on signup/signin, and its
  `USER_SERVICE_URL` default is the Compose DNS name; set it to `http://localhost:5459`.
  The gateway's service URLs (`COIN_SERVICE_URL`, `AUTH_SERVICE_URL`, …) default to Compose DNS
  names too, so override them as well if you run the gateway with `mvn`.

`frontend/.env.example` (`VITE_API_BASE_URL`) points the frontend at the gateway on
`http://localhost:8087`, i.e. the Compose-published gateway. If you run the gateway with `mvn`
instead, use `http://localhost:8080`.

Local secrets go in each service's `.env` (copy from its `.env.example`; `auth-service` and
`user-service` have one, gitignored). The other services take env vars directly, with working
localhost defaults.

---

## Project Structure

```
GprFlow/
├── docker-compose.yml                       # Orchestrates db + backend services + frontend + cloudflared
├── .github/workflows/deploy.yml             # Push-to-main production deploy (Tailscale + SSH)
├── db/init/01-schemas.sql                   # Creates the coin/ledger/auth/users Postgres schemas (fresh volume only)
│
├── backend/
│   ├── monolith/          # Health-check endpoint only
│   ├── coin-service/      # Coin / market-data domain
│   ├── chatbot-service/   # Gemini AI chatbot
│   ├── ledger-service/    # Wallet, Order, Asset, Payment, Withdrawal
│   ├── auth-service/      # Auth, email OTP, JWT issuing
│   ├── user-service/      # User profile, Watchlist, PaymentDetails
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
| `.env.example` (repo root) | `docker compose up` — DB credentials, `JWT_SECRET`, `FRONTEND_URL`, `API_BASE_URL`, `STRIPE_TEST_MODE`, Turnstile keys (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_ENABLED`), Resend, Stripe/CoinGecko/Gemini keys, seed admin account, `TUNNEL_TOKEN` |
| `backend/auth-service/.env.example`, `backend/user-service/.env.example` | Bare `mvn spring-boot:run` for those services |
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

Also fill in your real Resend, Stripe, CoinGecko, and Gemini credentials, and set
`ADMIN_PASSWORD` (the seed admin account is created on first boot). To actually enforce the
captcha, create a Turnstile widget in the Cloudflare dashboard (hostname = your frontend domain)
and set `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`; keep `STRIPE_TEST_MODE=false` outside
demos with `sk_test_` keys.

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
(`corsConfigurationSource()`), separate from the gateway's. Requests to `/auth/**` pass through the
gateway but are still CORS-checked again at auth-service itself, so your frontend origin needs adding to **both** lists — missing this one specifically
breaks signin/signup from the browser while everything else works, which makes it an easy
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

Any Stripe webhook or redirect URLs need to be
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

The repo ships `.github/workflows/ci.yml`. On pull requests and pushes to `main` it runs the
frontend checks (`npm run lint:emoji`, `npm run build`) and `mvn test` for each backend service.
On a push to `main`, and only if those pass, the `deploy` job joins a Tailscale network (OAuth
client in `TS_OAUTH_CLIENT_ID` / `TS_OAUTH_CLIENT_SECRET`), SSHes into the server with
`DEPLOY_SSH_KEY`, and runs `git pull --ff-only && docker compose up --build -d` in
`~/Applications/GprFlow`. It then curls the gateway on `localhost:8087`; if the build or that
health check fails it resets the checkout to the previous commit and rebuilds (schema changes
made by `ddl-auto=update` are not rolled back). There is no staging step, so a push to `main` is
a production deploy.

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
- **Turnstile ships with test keys.** Until real keys are set the captcha blocks nothing; only
  the rate limit protects signup and signin. Since the check fails closed, keep
  `TURNSTILE_ENABLED=false` in mind as the way out if the server can't reach
  `challenges.cloudflare.com`.
- **Email verification is not enforced.** See the note under Architecture.
- **No health checks beyond `db`.** Other services use `depends_on` without
  `condition: service_healthy`, so a cold `docker compose up` can show transient connection
  errors for a few seconds until every Spring service finishes starting. Not a functional
  problem — everything comes up on its own — just noise to expect on first boot or restart.

---

## Testing

```bash
# Any backend service
cd backend/<service>   # monolith, coin-service, chatbot-service, ledger-service, auth-service, user-service, or gateway
mvn test

# Frontend lint
cd frontend
npm run lint
```

`ledger-service` additionally has Testcontainers-backed integration tests covering the wallet
trading flow, wallet concurrency, and withdrawal flow (`src/test/java/dev/pioruocco/**/*IntegrationTest.java`).
`gateway` has unit tests for its filters (rate limiting, body cap, Turnstile). The remaining
modules have little or nothing beyond the default Spring Boot context-load test. There is no
frontend test suite; CI runs `npm run lint:emoji` and `npm run build`.

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

**Giuseppe Pio Ruocco** — [GitHub](https://github.com/JosephPshine63) · [LinkedIn](https://www.linkedin.com/in/giuseppe-pio-ruocco-7b4367267/) · [Portfolio](https://josephpshine63.github.io/portfolio/) · dev.pioruocco@gmail.com
