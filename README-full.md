# Test City — Announcements Portal

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![NestJS](https://img.shields.io/badge/NestJS-11-e0234e)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)

---

## Postup spustenia projektu

### Predpoklady

- **Node.js** ≥ 18
- **npm** ≥ 9

> **Poznámka:** Projekt používa cloud PostgreSQL databázu na [Neon](https://neon.tech). Súbory `.env` nie sú súčasťou repozitára — je potrebné ich vytvoriť podľa `.env.example`.

### 1. Klonovanie repozitára

```bash
git clone https://github.com/marko-604/Zadanie_Simplicity_Fullstack.git
cd Zadanie_Simplicity_Fullstack
```

### 2. Spustenie backendu

```bash
cd backend
npm install
```

Vytvorte súbor `.env` podľa šablóny a doplňte prihlasovacie údaje k databáze:

```bash
cp .env.example .env
```

Obsah `.env`:

```dotenv
DATABASE_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require"
```

Vygenerujte Prisma klienta, spustite migrácie a naplňte databázu:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Backend API bude dostupné na **http://localhost:3000**.

### 3. Spustenie frontendu

Otvorte **nový terminál** v koreňovom adresári projektu:

```bash
cd frontend
npm install
```

Vytvorte súbor `.env` (alebo skopírujte šablónu):

```bash
cp .env.example .env
```

Obsah `.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Spustite dev server:

```bash
npm run dev
```

Aplikácia bude dostupná na **http://localhost:5173**.

### Rýchly štart (TL;DR)

```bash
# Terminál 1 — Backend
cd backend && npm install && cp .env.example .env && npx prisma generate && npx prisma migrate dev && npx prisma db seed && npm run start:dev

# Terminál 2 — Frontend
cd frontend && npm install && cp .env.example .env && npm run dev
```


## Tech Stack

### Frontend (`/frontend`)

| Technológia | Účel |
|---|---|
| React 19 + Vite 7 | UI framework a dev server |
| TypeScript 5.9 | Typová bezpečnosť |
| Tailwind CSS 4 | Utility-first štylovanie |
| React Router 7 | Client-side routing |
| @tanstack/react-query | Cachovanie dát, mutations, automatická invalidácia |
| @tanstack/react-table 8 | Dátová tabuľka |
| react-select 5 | Multi-select pre kategórie |
| socket.io-client 4 | WebSocket klient |

### Backend (`/backend`)

| Technológia | Účel |
|---|---|
| NestJS 11 | REST API framework |
| Prisma 7 | ORM / database toolkit |
| PostgreSQL (Neon) | Cloud databáza |
| Socket.IO 4 | WebSocket server |
| Swagger (OpenAPI) | Interaktívna API dokumentácia |
| class-validator | Validácia DTO |

---

## Štruktúra projektu

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Databázová schéma (3 modely)
│   │   └── seed.ts                # Seed dáta (9 kategórií + 10 oznámení)
│   ├── src/
│   │   ├── announcements/         # CRUD modul + WebSocket gateway
│   │   │   └── dto/               # CreateAnnouncementDto, UpdateAnnouncementDto, ...
│   │   ├── categories/            # Modul kategórií
│   │   ├── health/                # Health check endpoint
│   │   ├── prisma/                # Globálny Prisma service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma.config.ts           # Prisma v7 konfigurácia
│   └── .env                       # DATABASE_URL, DIRECT_URL
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # Typovaná fetch API vrstva
│   │   ├── components/            # Layout, Spinner, Toast, ErrorBanner, EmptyState
│   │   ├── hooks/                 # useAnnouncementQueries, useAnnouncementSocket
│   │   ├── pages/                 # List, Form, NotFound stránky
│   │   ├── types.ts               # Zdieľané TypeScript rozhrania
│   │   ├── App.tsx                # Router + QueryClientProvider
│   │   └── index.css              # Tailwind + vlastné animácie
│   └── .env                       # VITE_API_URL
│
└── README.md
```

---

## Databázová schéma

Tri tabuľky s many-to-many vzťahom:

```
┌──────────────────────┐       ┌──────────────────────────┐       ┌──────────────────┐
│    announcements     │       │ announcement_categories  │       │    categories    │
├──────────────────────┤       ├──────────────────────────┤       ├──────────────────┤
│ id (PK)              │──┐    │ announcement_id (PK, FK) │    ┌──│ id (PK)          │
│ title                │  └───>│ category_id    (PK, FK)  │<───┘  │ name (unique)    │
│ content              │       └──────────────────────────┘       └──────────────────┘
│ publication_date     │
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

Obe FK majú nastavený **ON DELETE CASCADE**.

---

## Popis API endpointov

Všetky endpointy sú dostupné na `http://localhost:3000`.

| Method | Endpoint | Description |
|--------|------------------------------|--------------------------------------|
| GET | `/health` | Health check (status, uptime) |
| GET | `/announcements` | List all announcements (with search & category filter) |
| GET | `/announcements/:id` | Get a single announcement |
| POST | `/announcements` | Create a new announcement |
| PATCH | `/announcements/:id` | Update an announcement |
| DELETE | `/announcements/:id` | Delete an announcement |
| GET | `/categories` | List all categories |

> **Swagger UI** — interaktívna dokumentácia je dostupná na **http://localhost:3000/api**

---

### Oznámenia (Announcements)

#### `GET /announcements` — Zoznam všetkých oznámení

Voliteľné query parametre:

| Parameter | Typ | Popis |
|-----------|---------|-------------------------------|
| `search` | string | Vyhľadávanie v názve a obsahu |
| `category` | number | Filtrovanie podľa ID kategórie |

#### `GET /announcements`

**Príklad:** `GET http://localhost:3000/announcements`

**Príklad odpovede:**

```json
[
  {
    "id": 1,
    "title": "Title 1",
    "content": "This is the content of the first announcement about city news and updates.",
    "publicationDate": "2023-08-11T02:38:00.000Z",
    "createdAt": "2026-02-18T08:22:53.699Z",
    "updatedAt": "2026-02-18T08:22:53.699Z",
    "categories": [
      {
        "id": 1,
        "name": "City"
      }
    ]
  }
]
```

---

#### `GET /announcements/:id` — Jedno oznámenie podľa ID

**Príklad:** `GET http://localhost:3000/announcements/1`

Odpoveď je rovnaká štruktúra ako jeden objekt z poľa vyššie.

---

#### `POST /announcements` — Vytvorenie nového oznámenia

**Request body (JSON):**

```json
{
  "title": "Uzávierka cesty",
  "content": "Od 1.2.2025 bude uzavretá hlavná cesta kvôli opravám.",
  "publicationDate": "02/01/2025 08:00",
  "categoryIds": [1, 3]
}
```

| Pole | Typ | Povinné | Validácia |
|---|---|---|---|
| `title` | string | áno | Nesmie byť prázdny |
| `content` | string | áno | Nesmie byť prázdny |
| `publicationDate` | string | áno | Formát: `MM/DD/YYYY HH:mm` |
| `categoryIds` | number[] | áno | Minimálne 1 existujúce ID kategórie |

**Odpoveď:** `201 Created` — vytvorený objekt oznámenia.

---

#### `PATCH /announcements/:id` — Úprava oznámenia

**Príklad:** `PATCH http://localhost:3000/announcements/1`

**Request body (JSON):** Všetky polia sú voliteľné (partial update):

```json
{
  "title": "Aktualizovaný názov",
  "categoryIds": [2, 5]
}
```

**Odpoveď:** `200 OK` — aktualizovaný objekt oznámenia.

---

#### `DELETE /announcements/:id` — Vymazanie oznámenia

**Príklad:** `DELETE http://localhost:3000/announcements/1`

**Odpoveď:** `200 OK` — vymazaný objekt oznámenia.

---

### Kategórie (Categories)

#### `GET /categories` — Zoznam všetkých kategórií

**Príklad odpovede:**

```json
[
  { "id": 1, "name": "Doprava" },
  { "id": 2, "name": "Kultúra" },
  { "id": 3, "name": "Šport" }
]
```

---

### 3. Očakávané chybové odpovede

| Situácia | HTTP kód | Odpoveď |
|---|---|---|
| Neplatné request body | `400 Bad Request` | `{ "message": ["Title is required", ...], "error": "Bad Request" }` |
| Oznámenie nenájdené | `404 Not Found` | `{ "message": "Announcement with ID X not found", "error": "Not Found" }` |
| Neplatné ID (nie číslo) | `400 Bad Request` | `{ "message": "Validation failed (numeric string is expected)" }` |

---

## Licencia

Tento projekt je určený na účely pracovného pohovoru / hodnotenia.
