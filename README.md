# Lotline — Car Dealership Inventory System

A full-stack inventory system for a car dealership, built test-first as the Incubyte TDD kata.
Sales staff browse, search and sell vehicles from the lot; admins add, edit, restock and remove them.

- **Backend:** Node.js + Express 5 REST API, PostgreSQL via Prisma, JWT authentication
- **Frontend:** React 19 single-page app with Vite and Tailwind CSS v4
- **Tests:** 139 tests (67 backend, 72 frontend), ~93% coverage on both sides — see the [test report](#test-report)

![Inventory screen on desktop](docs/screenshots/inventory-desktop.jpg)

---

## Contents

1. [Features](#features)
2. [Screenshots](#screenshots)
3. [Tech stack](#tech-stack)
4. [Run it locally](#run-it-locally)
5. [API reference](#api-reference)
6. [Project structure](#project-structure)
7. [How it was built: TDD and Git workflow](#how-it-was-built-tdd-and-git-workflow)
8. [Test report](#test-report)
9. [My AI Usage](#my-ai-usage)

---

## Features

**Everyone (signed in)**
- Register and sign in; the session survives a page reload
- Inventory table of every vehicle: make, model, category, price and units on the lot
- Stock drawn as "parking bays", one bay per car, with *Low* / *Last one* / *Sold out* markers
- Count cards (All models · In stock · 1–2 left · Sold out) that filter the table
- Search by make, model, category and price range (debounced, sent to `/api/vehicles/search`)
- **Purchase** button on every row — sells one unit, disabled when quantity is zero

**Admins only**
- Add a vehicle and edit its details (two-column form)
- Restock a vehicle by the number of units that arrived
- Remove a vehicle, with a confirmation that names it

**Behind the scenes**
- Passwords hashed with bcrypt; public registration can only create normal users
- Purchase uses a single atomic `UPDATE … WHERE quantity > 0`, so two buyers can never take the last car
- Responsive: on phones the sidebar folds into a menu, filters collapse to one row and table rows become two lines

## Screenshots

| Inventory (desktop) | Inventory (phone) |
| --- | --- |
| ![Inventory desktop](docs/screenshots/inventory-desktop.jpg) | ![Inventory phone](docs/screenshots/inventory-mobile.jpg) |

| Edit vehicle (admin) | Sign in |
| --- | --- |
| ![Edit vehicle](docs/screenshots/edit-vehicle.jpg) | ![Sign in](docs/screenshots/sign-in.jpg) |

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| API | Express 5 (JavaScript, ES modules) | Small and explicit; async errors handled natively |
| Database | PostgreSQL 16 in Docker, Prisma 6 ORM | Real database (not in-memory); typed queries and migrations |
| Auth | JSON Web Tokens + bcryptjs | Stateless token auth as required by the kata |
| Backend tests | Jest + Supertest | Integration tests hit a real test database |
| Frontend | React 19, React Router 7, Vite | Fast dev server, `/api` proxied to the backend |
| Styling | Tailwind CSS v4 with design tokens | Tokens from one design system, defined once in `index.css` |
| Frontend tests | Vitest + React Testing Library | Tests behaviour the way a user sees it |

## Run it locally

### Prerequisites

- Node.js 20 or newer (developed on Node 26)
- Docker Desktop (for PostgreSQL)

### 1. Clone and start the database

```bash
git clone https://github.com/RookieCoder12/incubyte-TddKata.git
cd incubyte-TddKata
docker compose up -d
```

This starts PostgreSQL on **port 5433** with two databases: `dealership` (development) and
`dealership_test` (used only by the test suite).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # defaults work with docker-compose as-is
npx prisma migrate dev        # create the tables in the dev database
npm run db:test:migrate       # create the tables in the test database
npm run db:seed               # create the admin account
npm run dev                   # API on http://localhost:4000
```

The seed creates an admin you can sign in with:

| Email | Password | Role |
| --- | --- | --- |
| `admin@dealership.com` | `admin123` | ADMIN |

Change them with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` before seeding. Any account created
through the Register page is a normal sales user.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                   # app on http://localhost:5173
```

Open http://localhost:5173, sign in as the admin and add a few vehicles.

### 4. Run the tests

```bash
cd backend  && npm test             # or: npm run test:coverage
cd frontend && npm test             # or: npm run test:coverage
```

The backend tests need the Docker database running; they clear the test database between tests and
never touch the development data.

### Environment variables (`backend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://dealership:dealership@localhost:5433/dealership` | Dev database |
| `JWT_SECRET` | `change-me` | Signs the tokens — change it outside local development |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `PORT` | `4000` | API port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@dealership.com` / `admin123` | Account created by `npm run db:seed` |

## API reference

All vehicle routes need an `Authorization: Bearer <token>` header. Errors return
`{ "message": "…" }`, or `{ "errors": { "field": "…" } }` for validation failures.

| Method | Path | Access | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | 201 `{ token, user }` | 400 invalid, 409 email taken |
| POST | `/api/auth/login` | Public | 200 `{ token, user }` | 400 missing fields, 401 wrong credentials |
| GET | `/api/vehicles` | User | 200 list of vehicles | 401 |
| GET | `/api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=` | User | 200 matching vehicles | 400 bad price range, 401 |
| POST | `/api/vehicles` | User | 201 created vehicle | 400, 401 |
| PUT | `/api/vehicles/:id` | User | 200 updated vehicle (partial updates allowed) | 400, 401, 404 |
| DELETE | `/api/vehicles/:id` | **Admin** | 204 | 401, 403, 404 |
| POST | `/api/vehicles/:id/purchase` | User | 200 vehicle with quantity − 1 | 400 out of stock, 401, 404 |
| POST | `/api/vehicles/:id/restock` | **Admin** | 200 vehicle with quantity + n (body `{ "quantity": n }`) | 400, 401, 403, 404 |
| GET | `/api/health` | Public | 200 `{ status: "ok" }` | — |

Search filters are optional and combine: text filters match partially and ignore case (`make=toy`
finds Toyota); price filters are inclusive.

## Project structure

```
incubyte-TddKata/
├── docker-compose.yml           PostgreSQL (dev + test databases)
├── backend/
│   ├── prisma/                  schema.prisma, migrations, seed.js (admin user)
│   ├── src/
│   │   ├── app.js               builds the Express app (no listen → testable)
│   │   ├── server.js            starts the app on PORT
│   │   ├── config/database.js   one shared Prisma client
│   │   ├── middleware/          authenticate (JWT) and requireAdmin
│   │   └── modules/
│   │       ├── auth/            auth.routes / auth.service / auth.validation
│   │       ├── vehicles/        CRUD + search
│   │       └── inventory/       purchase + restock
│   └── tests/
│       ├── unit/                validators and middleware, no database
│       ├── integration/         HTTP tests with Supertest against the test DB
│       └── helpers/             resetDatabase(), createUserWithToken()
├── frontend/
│   └── src/
│       ├── api/                 fetch client + one function per endpoint
│       ├── context/             AuthContext (session in state + localStorage)
│       ├── components/          AppShell, VehicleTable, FilterBar, LotBays, dialogs…
│       ├── pages/               Login, Register, Inventory, VehicleForm
│       ├── utils/               formatting, stock helpers, form validation
│       └── test/                test setup, fixtures, renderWithProviders
└── docs/                        screenshots and the full test report
```

Every backend module follows the same three-file pattern: **routes** handle HTTP (validate → call the
service → map errors to status codes), **services** hold the business rules and talk to Prisma, and
**validation** files are plain functions returning `{ isValid, errors }`.

## How it was built: TDD and Git workflow

**Red → Green → Refactor.** Every behaviour started as a failing test. The history shows 27 `test: … (red)`
commits, each followed by a `feat: … (green)` commit that makes it pass, plus `refactor:` commits where
duplication appeared (for example, one shared `FIELD_VALIDATORS` map for create and update validation).

**Branches.** Work was split into a branch per feature and a branch per task, merged with `--no-ff` so the
structure stays visible in the history:

```
main
├── backend-base
│   ├── backend/setup-base      ← setup/app-health, setup/database-config
│   ├── backend/auth-base       ← auth/register, auth/login, auth/middleware
│   ├── backend/vehicles-base   ← vehicles/create-and-list, vehicles/search, vehicles/update-and-delete
│   └── backend/inventory-base  ← inventory/purchase, inventory/restock
└── frontend-base
    ├── frontend/auth-base      ← api-client, auth-context, login-form, register-form, protected-routes
    ├── frontend/vehicles-base  ← app-shell, inventory-table, search-filters, purchase, phone-layout
    └── frontend/admin-base     ← vehicle-form, restock, delete, form-summary
```

Browse the narrative with `git log --graph --oneline main`.

## Test report

| Suite | Tests | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- | --- |
| Backend (Jest + Supertest, 9 suites) | **67 passed** | 92.6% | 92.0% | 100% | 92.4% |
| Frontend (Vitest + RTL, 14 files) | **72 passed** | 93.4% | 95.7% | 87.3% | 93.9% |

The full per-file coverage tables are in [docs/test-report.md](docs/test-report.md). The lines left
uncovered on the backend are the generic `500 Internal Server Error` fallbacks in the route handlers.

What the tests cover, in short:
- **Auth:** validation rules, duplicate emails, password hashing, wrong/unknown credentials, JWT and admin middleware
- **Vehicles:** create, list, partial update, admin-only delete, every search filter alone and combined
- **Inventory:** purchase decrements by one, out-of-stock is rejected, two simultaneous purchases of the last unit sell only one, admin-only restock
- **Frontend:** API client errors, session persistence, route guards, forms (client and server errors), filtering, Purchase disabled at zero, admin restock/edit/delete flows

## My AI Usage

### Tools I used

- **Claude Code** (Anthropic's CLI agent, running the Claude Opus model) — the main assistant for planning, writing tests and code, debugging and Git.
- **taste-skill** (a design skill for Claude Code, installed locally under `.claude/skills/` and kept out of the repo) — used for the frontend's visual design and to check the screens in a real browser.

### How I used them

- **Planning.** I gave Claude the kata brief and asked for an implementation plan. We agreed on the stack
  (Express + Prisma + PostgreSQL, React + Vite + Tailwind) and the order of work before any code was written.
- **Setting the rules.** I gave Claude a sample inventory module as the reference for code style
  (routes / service / validation files, hand-written validators, Prisma called from the service) and defined
  the branch naming scheme. It followed both throughout.
- **Tests first.** For each behaviour Claude drafted the failing tests, I checked the red run, then it wrote
  the implementation and we confirmed green before committing. It also suggested cases I might have missed,
  such as the concurrent purchase test and returning the same 401 message for an unknown email and a wrong password.
- **Debugging.** Claude diagnosed issues such as form fields being disabled during the first load (which made
  tests type into disabled inputs) and Git collapsing the blank lines before the co-author trailer.
- **Design.** With taste-skill, Claude chose a visual style from researched options (the "framed sheet" app
  style), wrote design notes, built the screens to it, then ran the skill's inspector at desktop, tablet and
  phone widths. The screenshots showed the phone layout was cramped, which led to the collapsed filters and
  two-line rows.
- **Safety net.** Before pushing, Claude scanned the whole history for tokens and `.env` files. An automatic
  guard also stopped a commit that would have included a temporary file containing a real token; the file
  was deleted before committing.
- **Git and docs.** Claude wrote the commit messages (each says what the AI did and carries a
  `Co-Authored-By` trailer), handled the branch merges, and drafted this README.

### Reflection

AI made the strict TDD loop much faster: drafting a set of failing tests, then the smallest code to pass them,
took minutes instead of an hour per feature, which made it realistic to keep the red-green rhythm for every
behaviour instead of only the important ones. The biggest lesson was that the output is only as good as the
constraints I gave it: once I supplied my own code style and branching rules, the generated code became
something I can explain line by line. I still had to review every step — checking that the red tests failed
for the right reason, and catching problems like the cramped phone layout — so I treated the AI as a fast pair
programmer, not an autopilot. Every commit where AI helped is marked with a `Co-Authored-By` trailer, and the
raw chat log is in [PROMPTS.md](PROMPTS.md).
