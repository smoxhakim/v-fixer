# Project Documentation: v-fixer

## Overview
This document summarizes the development progress and architecture of the **v-fixer** project. The project is a full-stack e-commerce ecosystem built with a Next.js (React) frontend and a Django backend.

## Architecture

### Frontend (Next.js App Router)
The frontend is built using Next.js 14+ with the App Router paradigm, styled with Tailwind CSS, and utilizes a comprehensive set of accessible UI components.

- **Routing & Pages (`/app`)**:
  - `home`: Landing page with hero section, featured promotions, and category carousels.
  - `admin/*`: Secured area containing `/admin/login` and `/admin/dashboard` for store management.
  - `product/[slug]`: Dynamic product details page.
  - `category/[slug]`: Dynamic category listing and product filtering.
  - `cart`: Shopping cart overview.
  - `checkout`: Multi-step checkout process.
  - `order/success`: Order confirmation page.
  
- **UI Components (`/components`)**:
  - `ui/`: Contains a robust library of reusable generic components (built with Radix UI / shadcn-ui patterns) including buttons, dialogs, forms, cards, tables, and toast notifications.
  - `layout/`: Global layout wrappers, headers, and footers.
  - `product/`: Specialized components for rendering product cards, grids, and details.
  - `home/`: specialized components for the landing page (carousels, badges).

- **State Management & Context (`/context`)**:
  - `cart-context.tsx`: Global state provider for managing user cart items, quantities, and totals.

- **Utilities & API (`/lib`, `/hooks`)**:
  - `api.ts`: Helper functions to interface with the Django backend REST API.
  - `use-toast.ts`, `use-mobile.ts`: Custom React hooks for responsive design and user feedback.

### Backend (Django)
The backend is a monolithic Django REST application providing headless content to the Next.js frontend.

- **Apps**:
  - `catalog`: Manages product inventory, categories, and attributes. Includes models, serializers, and generic API views.
  - `orders`: Manages user orders, cart conversion, and payment tracking.
- **Database**:
  - SQLite (`db.sqlite3`) for development iterations, structured with Django ORM migrations.

## Development Milestones Reached
1. **Initial Full-Stack Scaffolding**: Setup of the Next.js environment and Django environment as disjoint but intercommunicating services.
2. **Component Library Integration**: Fully populated UI component library to ensure consistent design language across the application frontend.
3. **Mock Data Layer**: Created static data (`/data/categories.ts`, `/data/products.ts`) to enable frontend development parallel to backend schema definitions.
4. **Shopping Cart Functionality**: Implemented React Context-based cart state that persists across page navigations.
5. **Admin Portal Shell**: Established the routing and layout for the admin side, including login and dashboard foundations.
6. **Backend Foundation**: Defined initial Django models and REST serializers for "catalog" and "orders".

## Getting Started
- **Frontend**: Run `npm run dev` or `yarn dev` from the project root.
- **Backend**: Navigate to `/backend`, activate your virtual environment, and run `python manage.py runserver`.
