# Test City — Announcements Portal

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![NestJS](https://img.shields.io/badge/NestJS-11-e0234e)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)

---

> **Podrobná dokumentácia** — architektonické rozhodnutia, databázová schéma, WebSocket udalosti a ďalšie detaily nájdete v [README-full.md](README-full.md).

## Postup spustenia projektu

### Predpoklady

- **Node.js** ≥ 18
- **npm** ≥ 9

> **Poznámka:** Projekt používa cloud PostgreSQL databázu na [Neon](https://neon.tech). Súbory `.env` nie sú súčasťou repozitára.

### 1. Klonovanie repozitára

```bash
git clone https://github.com/marko-604/Zadanie_Simplicity_Fullstack.git
cd Zadanie_Simplicity_Fullstack
```

### 2. Spustenie backendu

```bash
cd backend
npm install
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
npm run dev
```

Aplikácia bude dostupná na **http://localhost:5173**.

### Rýchly štart (TL;DR)

```bash
# Terminál 1 — Backend
cd backend && npm install && npx prisma migrate dev && npx prisma db seed && npm run start:dev

# Terminál 2 — Frontend
cd frontend && npm install && npm run dev
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
| class-validator | Validácia DTO |

## Popis API endpointov

Všetky endpointy sú dostupné na `http://localhost:3000`.

| Method | Endpoint | Description |
|--------|------------------------------|--------------------------------------|
| GET | `/announcements` | List all announcements (with search & category filter) |
| GET | `/announcements/:id` | Get a single announcement |
| POST | `/announcements` | Create a new announcement |
| PATCH | `/announcements/:id` | Update an announcement |
| DELETE | `/announcements/:id` | Delete an announcement |
| GET | `/categories` | List all categories |

---

## Návod na testovanie API (Postman)

### 1. Import do Postmanu

1. Otvorte [Postman](https://www.postman.com/downloads/)
2. Vytvorte novú kolekciu s názvom napr: **Test City API**
3. Pridajte požiadavky podľa nižšie uvedených príkladov

### 2. Príklady požiadaviek

#### Získanie všetkých oznámení

- **Method:** GET
- **URL:** `http://localhost:3000/announcements`

#### Získanie oznámení s filtrom

- **Method:** GET
- **URL:** `http://localhost:3000/announcements?search=cesta&category=1`

#### Získanie jedného oznámenia

- **Method:** GET
- **URL:** `http://localhost:3000/announcements/1`

#### Vytvorenie nového oznámenia

- **Method:** POST
- **URL:** `http://localhost:3000/announcements`
- **Headers:** `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "title": "Testovací oznámenie",
  "content": "Toto je testovací obsah vytvorený cez Postman.",
  "publicationDate": "06/15/2025 10:00",
  "categoryIds": [1, 2]
}
```

#### Úprava oznámenia

- **Method:** PATCH
- **URL:** `http://localhost:3000/announcements/1`
- **Headers:** `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "title": "Upravený názov"
}
```

#### Vymazanie oznámenia

- **Method:** DELETE
- **URL:** `http://localhost:3000/announcements/1`

#### Získanie kategórií

- **Method:** GET
- **URL:** `http://localhost:3000/categories`

