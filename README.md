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
- Wallet: deposit via Stripe or Razorpay, withdraw, transfer between users
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
| Framework | Spring Boot 3.2.4 |
| Security | Spring Security, JWT (jjwt 0.11), OAuth2 (Google) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15 |
| Payments | Stripe, Razorpay |
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

## Prerequisites

- **Java 17+** and **Maven 3.6+**
- **Node.js 18+** and **npm**
- **Docker + Docker Compose** (for the PostgreSQL container) or a local PostgreSQL 15 instance

---

## Installation

### 1. Clone

```bash
git clone <repo-url>
cd GprFlow
```

### 2. Start the database

```bash
cd backend
docker-compose up -d
```

This starts a PostgreSQL 15 container on port 5432 with database `gprflow`, user `postgres`, password `postgres`.

### 3. Configure the backend

Edit `backend/src/main/resources/application.properties` and fill in the placeholder values:

```properties
spring.mail.username=<gmail address>
spring.mail.password=<gmail app password>
stripe.api.key=<stripe secret key>
razorpay.api.key=<razorpay key id>
razorpay.api.secret=<razorpay key secret>
coingecko.api.key=<coingecko api key>
gemini.api.key=<google gemini api key>
spring.security.oauth2.client.registration.google.client-id=<google client id>
spring.security.oauth2.client.registration.google.client-secret=<google client secret>
```

The database connection is pre-configured to match the Docker Compose defaults. Change it here if you use a different PostgreSQL instance:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gprflow
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## Usage

Run backend and frontend in separate terminals.

**Terminal 1 — backend:**

```bash
cd backend
mvn spring-boot:run
# Listening on http://localhost:5454
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
# Listening on http://localhost:5173
```

Open `http://localhost:5173` in a browser.

To point the frontend at the deployed backend instead of localhost, change `API_BASE_URL` in `frontend/src/Api/api.js`:

```js
export const API_BASE_URL = 'https://e-commerce-server-production-0873.up.railway.app'
```

---

## Project Structure

```
GprFlow/
├── backend/                         # Spring Boot application
│   ├── docker-compose.yml           # PostgreSQL container
│   ├── pom.xml
│   └── src/main/java/dev/pioruocco/
│       ├── config/                  # Security, JWT, CORS
│       ├── controller/              # REST endpoints
│       ├── service/                 # Business logic (interface + impl pairs)
│       ├── repository/              # Spring Data JPA repositories
│       ├── model/                   # JPA entities
│       ├── domain/                  # Enums (OrderType, UserRole, etc.)
│       ├── request/                 # Request DTOs
│       ├── response/                # Response DTOs
│       └── exception/               # Global exception handler + domain exceptions
│
└── frontend/                        # React + Vite SPA
    └── src/
        ├── Api/api.js               # Axios instance (base URL config)
        ├── Redux/                   # Store + per-domain slices (Auth, Coin, Wallet, …)
        ├── pages/                   # Route-level components
        ├── components/
        │   ├── ui/                  # shadcn/ui primitives (Radix + Tailwind)
        │   └── custome/             # App-specific reusable components
        ├── Admin/                   # Admin-only views
        ├── Util/                    # Pure utility functions
        └── App.jsx                  # Router + auth gate
```

---

## Configuration Reference

| Variable / Property | Location | Description |
|---|---|---|
| `server.port` | `application.properties` | Backend port (default: 5454) |
| `spring.datasource.*` | `application.properties` | PostgreSQL connection |
| `stripe.api.key` | `application.properties` | Stripe secret key |
| `razorpay.api.*` | `application.properties` | Razorpay key + secret |
| `coingecko.api.key` | `application.properties` | CoinGecko API key |
| `gemini.api.key` | `application.properties` | Google Gemini AI key |
| `spring.mail.*` | `application.properties` | Gmail SMTP credentials |
| `spring.security.oauth2.*` | `application.properties` | Google OAuth2 client |
| `API_BASE_URL` | `frontend/src/Api/api.js` | Backend URL for frontend |

> **Note:** `JwtConstant.SECRET_KEY` is hardcoded in `backend/src/main/java/dev/pioruocco/config/JwtConstant.java`. Replace it with an environment variable before deploying to production.

---

## Testing

```bash
# Backend unit + integration tests
cd backend
mvn test

# Frontend lint
cd frontend
npm run lint
```

No frontend test suite is currently configured.

---

## Contributing

1. Fork the repository and create a feature branch off `main`.
2. Keep backend and frontend changes in separate commits when possible.
3. All `/api/**` endpoints require JWT — test with a valid token.
4. Run `mvn test` and `npm run lint` before opening a pull request.

---

## License

[MIT](./LICENSE) — Copyright (c) 2026 Giuseppe Pio Ruocco

---

## Author

**Giuseppe Pio Ruocco** — [GitHub](https://github.com/pioruocco) · dev.pioruocco@gmail.com
