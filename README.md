🚀 GprFlow - Piattaforma di Trading Cripto Full-Stack

Una **piattaforma di trading di criptovalute completa** costruita con **Spring Boot + React** che consente agli utenti di acquistare/vendere criptovalute, gestire portafogli, effettuare pagamenti e tracciare il loro portfolio in tempo reale.

## 🎯 Caratteristiche Principali

### 💰 Trading & Portfolio
- ✅ **Acquista/Vendi** criptovalute in tempo reale
- ✅ **Portafoglio Dinamico** - visualizza i tuoi asset, profit/loss, storico trading
- ✅ **Storico Ordini** - traccia tutti i tuoi ordini buy/sell
- ✅ **Grafici in Tempo Reale** - prezzi live da CoinGecko (24h, 7d, 30d, etc.)

### 💳 Wallet & Pagamenti
- ✅ **Gestione Portafoglio** - bilancio, depositi, prelievi, trasferimenti
- ✅ **Più Gateway di Pagamento** - Stripe e Razorpay integrati
- ✅ **Storico Transazioni** - registro completo di tutte le operazioni
- ✅ **Gestione Dati Bancari** - aggiungi e gestisci i tuoi account bancari

### 🔒 Sicurezza
- ✅ **Autenticazione JWT** - token-based, stateless
- ✅ **2FA (Two-Factor Authentication)** - doppia verifica con OTP
- ✅ **OAuth2 Google** - accesso social
- ✅ **Verifica Email/SMS** - account verification
- ✅ **Reset Password** - flusso sicuro con OTP

### 🤖 IA & Ricerca
- ✅ **Chatbot IA (Gemini)** - informazioni sulle criptovalute e analisi
- ✅ **Ricerca Avanzata** - cerca criptovalute per nome/simbolo
- ✅ **Watchlist** - salva le tue monete preferite
- ✅ **Top 50 Coins** - classifica delle migliori criptovalute

### 👥 Admin & Gestione
- ✅ **Dashboard Admin** - approvazione/rifiuto prelievi
- ✅ **Gestione Utenti** - profilo, verifiche, impostazioni account
- ✅ **Ruoli Basati** - USER e ADMIN

## 📋 Stack Tecnologico

### Backend
| Componente | Tecnologia |
|-----------|-----------|
| **Framework** | Spring Boot 3.2.4 |
| **Linguaggio** | Java 17+ |
| **ORM** | Spring Data JPA |
| **Sicurezza** | Spring Security + JWT |
| **Database** | MySQL |
| **Build Tool** | Maven |
| **Autenticazione** | JWT + OAuth2 (Google) |
| **Integrazioni** | Stripe, Razorpay, CoinGecko, Gemini AI, Gmail SMTP |

### Frontend
| Componente | Tecnologia |
|-----------|-----------|
| **Framework** | React 18.2 |
| **Build Tool** | Vite 5.0 |
| **Routing** | React Router v6 |
| **State Management** | Redux + Redux-Thunk |
| **Styling** | Tailwind CSS |
| **UI Components** | Radix UI |
| **HTTP Client** | Axios |
| **Grafici** | ApexCharts & Recharts |
| **Form Validation** | React Hook Form + Zod/Yup |

## 🚀 Quick Start

### Prerequisiti
- **Java 17+** e **Maven** (Backend)
- **Node.js 18+** e **npm** (Frontend)
- **MySQL 8.0+** (Database)

### Backend Setup

```bash
cd backend

# Installa dipendenze Maven
mvn clean install

# Esegui il server di sviluppo (con hot reload)
mvn spring-boot:run

# Esegui i test
mvn test

# Build per la produzione
mvn clean package
```

**Server in esecuzione su**: `http://localhost:5454`

### Frontend Setup

```bash
cd frontend

# Installa dipendenze npm
npm install

# Esegui il dev server (Vite con hot reload)
npm run dev

# Build per la produzione
npm run build

# Lint il codice
npm run lint

# Preview della build
npm run preview
```

**App in esecuzione su**: `http://localhost:5173` (Vite default)

## 🏗️ Architettura

### Backend - Layered Architecture

```
Controllers (REST API)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access - JPA)
    ↓
Database (MySQL)
```

**Controllers Principali:**
- `AuthController` - Autenticazione, signup, signin, 2FA
- `CoinController` - Dati criptovalute, grafici, ricerca
- `OrderController` - Acquisto/vendita ordini
- `WalletController` - Operazioni wallet, depositi, trasferimenti
- `AssetController` - Gestione holdings dell'utente
- `PaymentController` - Integrazione gateway pagamenti
- `WithdrawalController` - Richieste di prelievo

### Frontend - Component-Based Architecture

```
App (Routing principale)
    ├── Pages (Home, Portfolio, Wallet, Auth, etc.)
    │   └── Components (Riusabili)
    │
    ├── Redux Store
    │   ├── Auth Slice
    │   ├── Coin Slice
    │   ├── Wallet Slice
    │   ├── Order Slice
    │   └── ...
    │
    └── API Client (Axios)
        └── Base URL: http://localhost:5454
```

## 📁 Struttura Directory

```
trading-broker/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/
│   │   └── dev/pioruocco/     # Package principale
│   │       ├── controller/    # REST Controllers
│   │       ├── service/       # Business Logic
│   │       ├── repository/    # Data Access
│   │       ├── domain/        # JPA Entities
│   │       ├── request/       # Request DTOs
│   │       ├── response/      # Response DTOs
│   │       ├── config/        # Spring Config & Security
│   │       ├── exception/     # Custom Exceptions
│   │       └── utils/         # Utility Functions
│   ├── pom.xml                # Maven Dependencies
│   └── README.md              # Backend Documentation
│
├── frontend/                  # React + Vite Application
│   ├── src/
│   │   ├── pages/            # Page Components (routed)
│   │   ├── components/       # Reusable Components
│   │   ├── Api/              # Axios API Client
│   │   ├── Redux/            # State Management
│   │   ├── Admin/            # Admin Components
│   │   ├── Util/             # Utility Functions
│   │   ├── lib/              # Helper Libraries
│   │   ├── assets/           # Static Assets
│   │   ├── App.jsx           # Main App Component
│   │   └── main.jsx          # Entry Point
│   ├── package.json           # Dependencies
│   ├── vite.config.js        # Vite Configuration
│   ├── tailwind.config.js    # Tailwind CSS Config
│   └── README.md              # Frontend Documentation
│
└── README.md                  # This file
```

## 🔌 Integrazioni Esterne

| Servizio | Utilizzo | 
|----------|---------|
| **CoinGecko API** | Dati criptovalute in tempo reale (pubblico) |
| **Gemini AI** | Chatbot per informazioni su criptovalute |
| **Stripe** | Gateway di pagamento (paesi supportati) |
| **Razorpay** | Gateway di pagamento (India) |
| **Gmail SMTP** | Invio email (OTP, notifiche) |
| **Google OAuth2** | Social login |
| **MySQL** | Database principale |

## 📊 Flusso Dati Esempio: Acquisto di Criptovaluta

```
1. Utente naviga a /market/:coinId
2. Frontend fetcha dati coin da API (prices, charts)
3. Utente compila modulo e clicca "COMPRA"
4. Redux invia azione di creazione ordine
5. Frontend chiama POST /api/orders/pay
6. Backend valida, deduce dal wallet, crea Order/Asset
7. Frontend aggiorna stato Redux
8. Portfolio riflette il nuovo asset
9. Activity mostra la transazione
```

## 🔐 Sicurezza

- **JWT Token** - Autenticazione stateless con scadenza 24h
- **BCrypt** - Hash password
- **Spring Security** - Authorization & CORS configurata
- **2FA OTP** - Verifica doppia con token
- **Email Verification** - Validazione email utenti
- **OAuth2** - Google social login

## 📚 Documentazione Dettagliata

- **[Backend README](./backend/README.md)** - Architettura backend, API endpoints, configurazione
- **[Frontend README](./frontend/README.md)** - Architettura frontend, componenti, Redux store

## 🌍 Ambiente di Produzione

**Backend:**
- URL: `https://e-commerce-server-production-0873.up.railway.app`
- Database: MySQL cloud

**Frontend:**
- URL: `https://zosh-treading.vercel.app`
- Host: Vercel

## 🛠️ Comandi Utili

### Backend
```bash
cd backend

# Build con produzione
mvn clean package -DskipTests

# Run con profilo dev
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Run tests
mvn test

# Genera JAR
mvn package
```

### Frontend
```bash
cd frontend

# Install dipendenze
npm install

# Dev con Vite hot reload
npm run dev

# Build ottimizzato
npm run build

# Lint con ESLint
npm run lint

# Preview build locale
npm run preview
```

## 📝 File Configurazione Importanti

**Backend:**
- `pom.xml` - Dipendenze Maven
- `application.properties` - Configurazione (DB, API keys, email)
- `src/main/java/dev/pioruocco/config/AppConfig.java` - Security & JWT config

**Frontend:**
- `package.json` - Dipendenze npm e script
- `vite.config.js` - Configurazione build
- `tailwind.config.js` - Temi TailwindCSS
- `jsconfig.json` - Path alias (`@` → `src/`)
- `.eslintrc.cjs` - Regole linting

## 🚦 Deploy Locale

### Opzione 1: Windows PowerShell (Parallelo)

```powershell
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Opzione 2: Script Bash (Linux/Mac)

```bash
# Esegui in background
(cd backend && mvn spring-boot:run) &
(cd frontend && npm run dev) &
```

## 📞 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| **Porta 5454 già in uso** | `lsof -i :5454` poi kill il processo oppure cambia porta in `application.properties` |
| **MySQL connection failed** | Verifica credenziali in `application.properties` e che MySQL sia running |
| **CORS errors** | Verifica CORS config in `AppConfig.java` per la tua origin |
| **Node modules problemi** | `rm -rf node_modules package-lock.json` e `npm install` |
| **Vite port occupied** | `npm run dev -- --port 5174` per usare porta diversa |

## 🎓 Concetti Chiave Implementati

### Backend
- ✅ Layered Architecture (Controller → Service → Repository)
- ✅ JWT Token-based Authentication
- ✅ Spring Security con OAuth2
- ✅ JPA/Hibernate ORM
- ✅ Entity Relationships (One-to-Many, Many-to-Many)
- ✅ Custom Exception Handling
- ✅ DTO Pattern
- ✅ Service Layer Abstraction

### Frontend
- ✅ Redux State Management
- ✅ Redux Thunk per Async Actions
- ✅ React Router Nested Routes
- ✅ Protected Routes
- ✅ Form Validation (React Hook Form + Zod)
- ✅ API Interceptors (Axios)
- ✅ Component Composition
- ✅ TailwindCSS Utility-first

## 📈 Performance Optimization

- **Frontend**: Vite cold start rapido, HMR veloce, tree-shaking automatico
- **Backend**: Spring Boot DevTools per hot reload, lazy loading JPA
- **Database**: Indici su campi principali (userId, coinId, etc.)
- **Caching**: Redis integration possibile per rate limiting

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit i tuoi cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è open source. Vedere LICENSE per dettagli.

## 👨‍💻 Autore

**Dev Pioruocco** - [GitHub](https://github.com/pioruocco)

---

**Nota**: Per domande specifiche su Backend/Frontend, consulta i README dedicati nelle rispettive cartelle." 
