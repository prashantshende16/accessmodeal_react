# RBAC Frontend (React + Vite)

Role-Based Access Control frontend application with two distinct areas:
- `/admin/...`: Admin panel for dashboard, user management, and permission matrix configuration.
- `/app/...`: User portal exposing only pages granted by administrators.

## Features
- Dynamic menu and route protection based on granular user permissions (View, Add, Edit, Delete).
- Role-based routing: Admin accounts are redirected to `/admin`, standard users to `/app`.
- Seamless API proxying to FastAPI backend (`/api` -> `http://127.0.0.1:8000`).

## Setup & Run

```bash
npm install
npm run dev
```

Application will run at `http://localhost:5173`.
