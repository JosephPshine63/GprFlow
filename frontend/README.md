# Frontend — GprFlow (React + Vite)

SPA della piattaforma di trading: **React 18**, **Vite 5**, **Redux** (pattern classico, non Redux Toolkit), **React Router v6**, **Tailwind CSS** + **Radix UI** (componenti shadcn/ui).

## Setup rapido

Prerequisiti: Node.js 18+ (l'immagine Docker usa Node 20) e npm.

```bash
cd frontend
npm install
cp .env.example .env   # poi controlla VITE_API_BASE_URL (vedi sotto)
npm run dev            # http://localhost:5173
```

```bash
npm run build     # build di produzione in dist/
npm run preview   # serve la build locale
npm run lint      # ESLint, --max-warnings 0
```

Non c'è una test suite: l'unico controllo automatico è `npm run lint`.

## Collegamento al backend

Il frontend parla **solo con il gateway** (Spring Cloud Gateway), che instrada verso auth-service, user-service, ledger-service, coin-service e chatbot-service. Non chiamare i singoli servizi direttamente: molti non pubblicano nessuna porta.

`src/Api/api.js` crea l'istanza Axios (`withCredentials: true`) e risolve il `baseURL` così:

1. `window.__RUNTIME_CONFIG__.API_BASE_URL` — scritto all'avvio del container da `docker-entrypoint.d/30-runtime-config.sh` a partire dalla variabile d'ambiente `API_BASE_URL`, così la stessa immagine può puntare a backend diversi senza rebuild.
2. `import.meta.env.VITE_API_BASE_URL` — fallback per `npm run dev` (file `.env`, gitignorato).

| Scenario | Valore |
|---|---|
| `npm run dev` con il gateway avviato da `docker compose` | `http://localhost:8087` (default di `.env.example`) |
| `npm run dev` con il gateway avviato con `mvn spring-boot:run` | `http://localhost:8080` |
| Container `frontend` in Compose / produzione | env `API_BASE_URL` (default `http://localhost:8087`; in produzione `https://api.<dominio>`) |

### Autenticazione

Il JWT è in un cookie `jwt` **HttpOnly** impostato da auth-service al login/signup/OAuth. Il codice JavaScript non lo legge mai e non c'è nessun header `Authorization` né `localStorage`: basta `withCredentials`. Lo stato utente si ricava da `GET /api/users/profile` (thunk `getUser`, chiamato all'avvio in `App.jsx`); se risponde 401 l'utente è considerato non autenticato. Il logout chiama `POST /auth/logout`, che cancella il cookie.

Poiché il cookie è `Secure; SameSite=Strict`, in produzione frontend e API devono stare su HTTPS e sullo stesso sito (es. `app.` e `api.` dello stesso dominio), e l'origine del frontend deve essere nelle liste CORS di gateway **e** auth-service (vedi README principale).

## Struttura

```
src/
├── App.jsx            # Auth gate + tabella delle rotte (vedi sotto)
├── main.jsx           # Entry point (Provider Redux + BrowserRouter)
├── Api/api.js         # Istanza Axios
├── Redux/             # Una cartella per dominio: ActionTypes.js, Action.js, Reducer.js
│   └── Store.js       # legacy_createStore + redux-thunk
├── pages/             # Componenti di pagina, una cartella ciascuna
│   ├── Auth/  Home/  StockDetails/  Portfilio/  Wallet/  Watchlist/
│   ├── Activity/  Profile/  Search/  Navbar/  SideBar/  Notfound/
├── Admin/Withdrawal/  # Pannello admin (approvazione prelievi)
├── components/
│   ├── ui/            # shadcn/ui: NON modificare a mano, rigenerare con la CLI shadcn
│   └── custome/       # CustomeToast, SpinnerBackdrop
├── Util/              # Funzioni pure (date, profitto, watchlist, mascheratura IBAN…)
└── lib/utils.js       # helper `cn()` per le classi Tailwind
```

Nota: i nomi `Portfilio/`, `custome/`, `readbaleTimestamp.js` e simili contengono refusi storici ma sono quelli usati negli import: non rinominarli in un commit che fa altro.

Alias di percorso: `@` → `src/` (configurato in `jsconfig.json` e `vite.config.js`).

## Redux

Store combinato in `src/Redux/Store.js` con 8 slice: `auth`, `coin`, `wallet`, `order`, `asset`, `watchlist`, `withdrawal`, `chatBot`. Ogni slice ha tre file: `ActionTypes.js`, `Action.js` (thunk che chiamano il backend via Axios) e `Reducer.js`. Per aggiungere un dominio: crea la cartella con quei tre file e registra il reducer in `Store.js`.

Endpoint usati dai thunk (tutti via gateway):

| Slice | Endpoint |
|---|---|
| `auth` | `/auth/signup`, `/auth/signin`, `/auth/two-factor/otp/{otp}`, `/auth/logout`, `/api/users/profile`, verifica email / 2FA / reset password sotto `/api/users/verification/**` e `/api/users/enable-two-factor/**` |
| `coin` | `/api/coins`, `/api/coins/top50`, `/api/coins/trading`, `/api/coins/search`, `/api/coins/{id}`, `/api/coins/{id}/chart`, `/api/coins/details/{id}` |
| `wallet` | `/api/wallet`, `/api/wallet/transactions`, `/api/wallet/deposit`, `/api/wallet/{walletId}/transfer`, `/api/payment/**` (Stripe) |
| `order` | `/api/orders`, `/api/orders/{id}`, `/api/orders/pay` |
| `asset` | `/api/assets`, `/api/assets/{id}`, `/api/assets/coin/{coinId}/user` |
| `watchlist` | `/api/watchlist/user`, `/api/watchlist/add/coin/{coinId}` |
| `withdrawal` | `/api/withdrawal`, `/api/withdrawal/{amount}`, `/api/admin/withdrawal`, `/api/admin/withdrawal/{id}/proceed/{accept}`, `/api/payment-details` |
| `chatBot` | `/chat/bot/coin` |

## Routing

`App.jsx` è il gate di autenticazione: in base a `auth.user` monta due insiemi di rotte diversi.

- **Non autenticato:** `/`, `/signup`, `/signin`, `/forgot-password`, `/login-with-google`, `/reset-password/:session`, `/password-update-successfully`, `/two-factor-auth/:session`.
- **Autenticato (`ROLE_USER`):** `/`, `/portfolio`, `/activity`, `/wallet`, `/wallet/:order_id` (ritorno da Stripe), `/withdrawal`, `/payment-details`, `/market/:id`, `/watchlist`, `/profile`, `/search`.
- **Solo `ROLE_ADMIN`:** `/admin/withdrawal`.

L'array `routes` in cima a `App.jsx` alimenta `shouldShowNavbar` (Navbar nascosta nelle pagine non elencate): aggiungendo una rotta autenticata va aggiornato anche quello.

## Docker

`Dockerfile` è multi-stage (`node:20-alpine` build → `nginx:alpine`). `nginx.conf` fa solo il fallback SPA (`try_files $uri /index.html`) e **non** fa proxy verso il backend: il browser chiama `API_BASE_URL` come URL assoluto, quindi in produzione servono due hostname pubblici (frontend e gateway). Il container è pubblicato su `5173` da `docker-compose.yml`.
