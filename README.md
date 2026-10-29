# ErrorWatch Frontend (React + Vite)

Universal Application Error Monitoring Platform Console.

## Features
- **Overview Dashboard**: Aggregate metrics for active projects, unresolved issues, total events, and live uptime health.
- **Project Onboarding Wizard**: Step-by-step framework selection (React, FastAPI, Node.js, Python), DSN credential generation, and one-click test verification.
- **Interactive Issue Diagnostics**: Full stack trace inspection with frame formatting, breadcrumbs timeline, sanitized request headers, and device tags.
- **Workflow State Management**: Toggle issue status between `Unresolved`, `In Progress`, `Resolved`, and `Ignored`.
- **Independent Uptime Checks**: Live heartbeat monitors with on-demand probes, latency tracking, and incident history.
- **Alert Rule Configuration**: Configure rules and review notification dispatch history.

## Setup & Run

```bash
cd frontend
npm install
npm run dev
```

Console will run at `http://localhost:5173`.
Proxy is configured to forward `/api` to `http://127.0.0.1:8000`.

### Default Login
- **Email**: `admin@example.com`
- **Password**: `admin123`
*(Auto-fill button available on the login screen)*
