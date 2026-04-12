# Project Documentation: v-fixer

## Overview

This document summarizes the development progress and architecture of the **v-fixer** project. The project is a full-stack e-commerce ecosystem built with a Next.js (React) frontend and a Django backend.

## Repository layout

- **`frontend/`** — Next.js app (App Router, Tailwind, UI components).
- **`backend/`** — Django REST API (`catalog`, `orders`).

## Architecture

### Frontend (Next.js App Router)

The frontend is built using Next.js 14+ with the App Router paradigm, styled with Tailwind CSS, and utilizes a comprehensive set of accessible UI components.

- **Routing & Pages (`frontend/app/`)**:
  - `home`: Landing page with hero section, featured promotions, and category carousels.
  - `admin/*`: Secured area containing `/admin/login` and `/admin/dashboard` for store management.
  - `product/[slug]`: Dynamic product details page.
  - `category/[slug]`: Dynamic category listing and product filtering.
  - `cart`: Shopping cart overview.
  - `checkout`: Multi-step checkout process.
  - `order/success`: Order confirmation page.

- **UI Components (`frontend/components/`)**:
  - `ui/`: Reusable generic components (Radix / shadcn-style).
  - `layout/`: Headers, footers, layout shells.
  - `product/`: Product cards, grids, details.
  - `home/`: Landing sections (carousels, badges).

- **State & data (`frontend/context/`, `frontend/data/`)**:
  - `cart-context.tsx`: Global cart state.

- **Utilities (`frontend/lib/`, `frontend/hooks/`)**:
  - `api.ts`: Django REST client.
  - Hooks for responsive UI and toasts.

### Backend (Django)

The backend is a Django REST application consumed by the Next.js frontend.

- **Apps**: `catalog` (products, categories), `orders`.
- **Database**: SQLite (`backend/db.sqlite3`) for local development.

## Development milestones

1. Full-stack scaffolding (Next.js + Django as separate services).
2. UI component library integrated across the app.
3. Mock/static data under `frontend/data/` for parallel frontend/backend work.
4. Cart via React context.
5. Admin shell (login, dashboard).
6. Django models, serializers, and REST endpoints for catalog and orders.

## Getting started

Run **two terminals**: Next.js (port 3000 by default) and Django on **port 8001** by default (so port 8000 stays free for other tools).

- **Frontend**: From the repository root, run `npm install` inside `frontend/` once, then either `npm run dev` or `cd frontend && npm run dev`.

- **Backend** (`cd backend`):
  1. Create a virtual environment (only once per machine): `python3 -m venv venv`
  2. Activate it: `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows).
  3. Install dependencies: `pip install -r requirements.txt`
  4. Apply migrations: `python manage.py migrate`
  5. Start the API: `python manage.py runserver 8001` → `http://127.0.0.1:8001`

If `venv/bin/python` was copied from another computer and Django fails to import, remove `backend/venv` and repeat step 1.

The frontend uses `http://localhost:8001/api` by default (`frontend/lib/api.ts`). Override with `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (for example `NEXT_PUBLIC_API_URL=http://localhost:9000/api`).

- **Admin UI (Next):** `/admin/dashboard` (overview), `/admin/dashboard/products`, `/admin/dashboard/categories`, `/admin/dashboard/orders`. Optional JWT from `/admin/login` enables mutating APIs and order list until dedicated auth ships.
- **Backend API notes for admins:** optional local file `docs/MESSAGE_FOR_BACKEND_TEAM.md` (the `docs/` folder is gitignored).
