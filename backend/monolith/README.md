# 🚀 Backend - GprFlow (Spring Boot)

Il backend della piattaforma di trading è una **API REST completa** costruita con **Spring Boot 3.2.4** che gestisce autenticazione, criptovalute, ordini, wallet, pagamenti e molto altro.

## 📋 Indice
- [Setup Rapido](#setup-rapido)
- [Architettura](#architettura)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Configurazione](#configurazione)
- [Sicurezza](#sicurezza)
- [Integrazioni Esterne](#integrazioni-esterne)

## 🚀 Setup Rapido

### Prerequisiti
- **Java 17+** (compilato con Java 19)
- **Maven 3.6+**
- **PostgreSQL 15+** con database `gprflow`
- **Docker e Docker Compose**

### Installazione

```bash
# 1. Clona il repository (dalla cartella principale)
cd backend

# 2. Installa dipendenze
mvn clean install

# 3. Avvia il database PostgreSQL tramite Docker Compose
docker-compose up -d

# 4. Configura il database in application.properties
# Modifica: spring.datasource.url, username, password se necessario

# 5. Esegui il server di sviluppo
mvn spring-boot:run

# 6. Server avviato su http://localhost:5454
```

### Comandi Comuni

```bash
# Build senza test
mvn clean package -DskipTests

# Run con profilo specifico
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Esegui i test
mvn test

# Run test singolo
mvn test -Dtest=NomeTestClass

# Genera JAR
mvn package

# Pulisci i file compilati
mvn clean
```

## 🏗️ Architettura

### Layered Architecture Pattern

```
┌─────────────────────────────────────┐
│      REST Controllers               │  (Riceve richieste HTTP)
└─────────────────────────────────────┘
              ↓ ↓ ↓
┌─────────────────────────────────────┐
│      Service Layer                  │  (Business Logic)
│   (Implementazioni dei servizi)     │
└─────────────────────────────────────┘
              ↓ ↓ ↓
┌─────────────────────────────────────┐
│      Repository Layer               │  (Data Access - JPA)
└─────────────────────────────────────┘
              ↓ ↓ ↓
┌─────────────────────────────────────┐
│      PostgreSQL Database            │  (Persistenza Dati)
└─────────────────────────────────────┘
```

### Struttura Directory

```
src/main/java/dev/pioruocco/
├── controller/              # REST API Controllers
│   ├── AuthController       # Login, signup, 2FA
│   ├── CoinController       # Dati criptovalute
│   ├── OrderController      # Buy/Sell orders
│   ├── WalletController     # Operazioni wallet
│   ├── AssetController      # Holdings utente
│   ├── PaymentController    # Pagamenti
│   ├── WithdrawalController # Prelievi
│   ├── WatchlistController  # Watchlist
│   ├── ChatBotController    # IA Chatbot
│   ├── UserController       # Profilo utente
│   └── HomeController       # Welcome
│
├── service/                 # Business Logic Layer
│   ├── impl/                # Implementazioni servizi
│   │   ├── UserServiceImpl
│   │   ├── CoinServiceImpl
│   │   ├── OrderServiceImpl
│   │   ├── WalletServiceImpl
│   │   ├── AssetServiceImpl
│   │   ├── PaymentServiceImpl
│   │   ├── WithdrawalServiceImpl
│   │   ├── WatchlistServiceImpl
│   │   ├── VerificationServiceImpl
│   │   ├── TwoFactorOtpServiceImpl
│   │   ├── ForgotPasswordServiceImpl
│   │   ├── ChatBotServiceImpl
│   │   ├── EmailService
│   │   └── WalletTransactionServiceImpl
│   │
│   └── [Interface definitions]
│
├── repository/              # Data Access Layer (JPA)
│   ├── UserRepository
│   ├── CoinRepository
│   ├── OrderRepository
│   ├── WalletRepository
│   ├── AssetRepository
│   ├── PaymentOrderRepository
│   ├── WithdrawalRepository
│   ├── WatchlistRepository
│   ├── VerificationRepository
│   ├── TwoFactorOtpRepository
│   └── [altri repositories]
│
├── domain/                  # JPA Entities
│   ├── User
│   ├── Coin
│   ├── Asset
│   ├── Order
│   ├── OrderItem
│   ├── Wallet
│   ├── WalletTransaction
│   ├── PaymentOrder
│   ├── PaymentDetails
│   ├── Withdrawal
│   ├── Watchlist
│   ├── TradingHistory
│   ├── VerificationCode
│   ├── TwoFactorOTP
│   ├── ForgotPasswordToken
│   ├── Notification
│   └── Demo
│
├── request/                 # Request DTOs
│   ├── LoginRequest
│   ├── SignUpRequest
│   ├── OrderRequest
│   ├── PaymentRequest
│   └── [altri]
│
├── response/                # Response DTOs
│   ├── AuthResponse
│   ├── ApiResponse
│   ├── PaymentResponse
│   └── [altri]
│
├── config/                  # Configurazione Spring
│   ├── AppConfig            # Security, JWT, OAuth2
│   ├── JwtProvider          # Token generation
│   ├── JwtTokenValidator    # Token validation
│   └── JwtConstant          # JWT secret
│
├── exception/               # Custom Exceptions
│   ├── UserException
│   ├── OrderException
│   ├── WalletException
│   ├── GlobelExeptions      # Global exception handler
│   └── ErrorDetails         # Error response DTO
│
├── utils/                   # Utility Functions
│   ├── CustomeUserServiceImpl  # Spring Security
│   ├── DataInitializationComponent  # Init data
│   └── [utility classes]
│
└── GprFlowApplication.java  # Main App
```

## 📡 API Endpoints

### 🔐 Autenticazione (AuthController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| POST | `/auth/signup` | Registra nuovo utente |
| POST | `/auth/signin` | Login utente |
| POST | `/auth/two-factor/otp/{otp}` | Verifica 2FA OTP |
| POST | `/auth/users/reset-password/send-otp` | Invia OTP per reset password |
| PUT | `/api/users/reset-password/{token}` | Reset password con token |
| POST | `/auth/forgot-password` | Richiesta password dimenticata |

**Risposta di Login:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER"
  }
}
```

### 💰 Criptovalute (CoinController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| GET | `/coins` | Lista tutte le criptovalute |
| GET | `/coins/{coinId}` | Dettagli singola moneta |
| GET | `/coins/{coinId}/chart` | Dati grafico moneta |
| GET | `/coins/search?q={query}` | Ricerca criptovalute |
| GET | `/coins/top50` | Top 50 monete per capitalizzazione |
| GET | `/coins/trading` | Monete in trading |

**Risposta Coin:**
```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "image": "https://...",
  "currentPrice": 45000,
  "marketCap": 900000000000,
  "marketCapRank": 1,
  "priceChange24h": 2.5,
  "priceChangePercent24h": 2.5,
  "circulatingSupply": 21000000,
  "totalSupply": 21000000,
  "high24h": 46000,
  "low24h": 44000
}
```

### 📦 Ordini (OrderController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| POST | `/api/orders/pay` | Crea nuovo ordine (buy/sell) |
| GET | `/api/orders/{orderId}` | Dettagli ordine |
| GET | `/api/orders` | Storico ordini utente |

**Request Ordine:**
```json
{
  "coinId": "bitcoin",
  "quantity": 0.5,
  "orderType": "BUY"
}
```

**Response Ordine:**
```json
{
  "orderId": 123,
  "userId": 1,
  "coinId": "bitcoin",
  "quantity": 0.5,
  "price": 45000,
  "totalPrice": 22500,
  "orderStatus": "FILLED",
  "orderType": "BUY",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 💳 Portafoglio (WalletController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| GET | `/api/wallet` | Bilancio wallet |
| GET | `/api/wallet/transactions` | Storico transazioni |
| PUT | `/api/wallet/deposit/amount/{amount}` | Deposita fondi |
| PUT | `/api/wallet/{walletId}/transfer` | Trasferisci tra wallet |
| PUT | `/api/wallet/order/{orderId}/pay` | Pagamento ordine |

**Response Wallet:**
```json
{
  "walletId": 1,
  "userId": 1,
  "balance": 50000.00,
  "createdAt": "2024-01-01T08:00:00Z"
}
```

### 🎯 Asset (AssetController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| GET | `/api/assets` | Lista asset utente |
| GET | `/api/assets/{assetId}` | Dettagli asset singolo |
| GET | `/api/assets/coin/{coinId}/user` | Asset per moneta |

**Response Asset:**
```json
{
  "assetId": 1,
  "userId": 1,
  "coinId": "bitcoin",
  "quantity": 0.5,
  "buyPrice": 45000,
  "totalInvested": 22500,
  "currentValue": 23500,
  "profitLoss": 1000,
  "profitLossPercent": 4.44
}
```

### 💸 Pagamenti (PaymentController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| POST | `/api/payment/{paymentMethod}/amount/{amount}` | Processa pagamento |

**PaymentMethod:** `STRIPE`, `RAZORPAY`

### 🏦 Prelievi (WithdrawalController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| POST | `/api/withdrawal/{amount}` | Richiedi prelievo |
| GET | `/api/withdrawal` | Storico prelievi utente |
| GET | `/api/admin/withdrawal` | Admin: tutti i prelievi |
| PUT | `/api/admin/withdrawal/{withdrawalId}` | Admin: approva/rifiuta |

### 🔖 Watchlist (WatchlistController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| GET | `/api/watchlist/user` | Watchlist dell'utente |
| POST | `/api/watchlist/create` | Aggiungi alla watchlist |
| GET | `/api/watchlist/{watchlistId}` | Dettagli watchlist |

### 🤖 Chatbot (ChatBotController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| GET | `/chat/coin/{coinName}` | Info moneta dal chatbot |
| POST | `/chat/bot` | Chat con IA |
| POST | `/chat/bot/coin` | Chat specifica moneta |

### 👤 Utente (UserController)

| Metodo | Endpoint | Descrizione |
|--------|----------|-----------|
| GET | `/api/users/profile` | Profilo utente |
| GET | `/api/users/{userId}` | Dettagli utente |
| GET | `/api/users/email/{email}` | Cerca per email |
| POST | `/api/users/verification/{type}/send-otp` | Invia OTP verifica |

## 📊 Database

### Entities Principali

```sql
-- Utenti
User (id, email, fullName, password, role, 2faEnabled, verified)

-- Criptovalute
Coin (id, symbol, name, image, currentPrice, marketCap, priceChange24h)

-- Ordini
Order (id, userId, coinId, quantity, price, orderType, orderStatus)
OrderItem (id, orderId, quantity, price)

-- Portafoglio
Wallet (id, userId, balance)
WalletTransaction (id, walletId, type, amount, timestamp)

-- Asset (Holding)
Asset (id, userId, coinId, quantity, buyPrice)

-- Pagamenti
PaymentOrder (id, userId, amount, paymentMethod, status)
PaymentDetails (id, userId, accountNumber, ifsc, bankName)

-- Prelievi
Withdrawal (id, userId, amount, status, timestamp)

-- Watchlist
Watchlist (id, userId)
Watchlist_Coins (watchlist_id, coin_id)

-- Verificazione
VerificationCode (id, email, otp, type, expiryAt)
TwoFactorOTP (id, userId, otp, expiryAt)

-- Password Reset
ForgotPasswordToken (id, email, token, expiryAt)
```

## ⚙️ Configurazione

### application.properties

```properties
# Server
server.port=5454
server.servlet.context-path=/

# Database PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/gprflow
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT
app.jwt.secret=your_jwt_secret_key_at_least_32_chars
app.jwt.expiration=86400000

# Email SMTP (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# OAuth2 Google
spring.security.oauth2.client.registration.google.client-id=your_client_id
spring.security.oauth2.client.registration.google.client-secret=your_secret

# API Keys
app.coin-gecko.api-key=your_coingecko_key
app.gemini.api-key=your_gemini_key

# Payment Gateways
app.stripe.api-key=your_stripe_key
app.razorpay.api-key=your_razorpay_key

# CORS
app.allowed-origins=http://localhost:3000,http://localhost:5173,http://localhost:4200
```

## 🔒 Sicurezza

### JWT Authentication

1. **Token Generation** (Login)
   - User invia email + password
   - Backend valida credenziali
   - JWT token generato con claims: email, authorities, expiration (24h)

2. **Token Usage**
   - Frontend salva token in localStorage
   - Invia in header: `Authorization: Bearer {token}`
   - Backend valida con JwtTokenValidator

3. **Token Validation**
   - JwtTokenValidator intercetta richieste
   - Estrae email dal token
   - Popola SecurityContext

### CORS Configuration

```java
// AppConfig.java
allowedOrigins = {
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4200",
  "https://*.vercel.app"
}
```

### Password Hashing

- BCryptPasswordEncoder usato per hash password
- Spring Security configura automaticamente

### 2FA (Two-Factor Authentication)

1. User abilita 2FA nel profilo
2. Durante login, riceve OTP via email
3. Deve verificare OTP prima di ricevere JWT

### Exception Handling

```java
// Global Exception Handler: GlobelExeptions
- UserException → 404
- OrderException → 400/404
- WalletException → 400
- Generic Exception → 500
```

## 🔌 Integrazioni Esterne

### CoinGecko API (Pubblico)

```java
// Fetch dati criptovalute
GET https://api.coingecko.com/api/v3/coins/{id}
GET https://api.coingecko.com/api/v3/coins/markets
GET https://api.coingecko.com/api/v3/coins/{id}/market_chart
```

### Gemini AI API

```java
// Chatbot per crypto info
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### Stripe Payment

```java
// Processa pagamenti
// Integrazione tramite PaymentService
```

### Razorpay Payment

```java
// Gateway pagamenti per India
// Integrazione tramite PaymentService
```

### Gmail SMTP

```java
// Invio email OTP
spring.mail.host=smtp.gmail.com
EmailService.sendEmail(to, subject, body)
```

## 🧪 Testing

```bash
# Esegui tutti i test
mvn test

# Test singolo file
mvn test -Dtest=UserServiceTest

# Test con coverage
mvn clean test jacoco:report

# Run in modalità debug
mvn test -Ddebug
```

## 📚 Endpoints di Utilità

### Health Check
```bash
GET http://localhost:5454/
# Ritorna: Welcome message
```

### Actuator (se abilitato)
```bash
GET http://localhost:5454/actuator
GET http://localhost:5454/actuator/health
```

## 🚨 Common Issues

| Problema | Soluzione |
|----------|-----------|
| **Connection refused (PostgreSQL)** | Verifica PostgreSQL running (docker-compose up -d), credenziali in application.properties |
| **Porta 5454 occupata** | Cambia porta in `server.port=5455` |
| **JWT secret too short** | Usa stringa con almeno 32 caratteri |
| **CORS error** | Aggiungi origin in `app.allowed-origins` |
| **Email non inviata** | Verifica credenziali Gmail e "App password" |
| **OutOfMemory** | Aumenta heap: `export MAVEN_OPTS="-Xmx1024m"` |

## 📈 Performance Tips

- **Database Indexing**: Crea indici su `userId`, `coinId`, `email`
- **Query Optimization**: Usa `@Query` personalizzate invece di query generate
- **Caching**: Implementa Redis per rate limiting e cache dati
- **Connection Pool**: Configura HikariCP in application.properties
- **DevTools**: Abilita per hot reload durante sviluppo

## 🔗 Risorse Utili

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [JWT Guide](https://jwt.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🎯 Next Steps

1. Configura `application.properties` con le tue credenziali
2. Avvia il container database: `docker-compose up -d`
3. Esegui `mvn spring-boot:run`
4. Testa endpoints con Postman/Insomnia
5. Integra con il frontend

---

**Versione**: Spring Boot 3.2.4 | **Java**: 17+ | **Ultimo Aggiornamento**: 2024

