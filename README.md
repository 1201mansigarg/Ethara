# WorkDesk — Team Task Manager

Full-stack app for managing projects and tasks with **Admin** and **Member** roles. MongoDB stores users, projects, and tasks; the React frontend talks to a Node/Express REST API.

## Folder structure

```
ethp/
├── backend/     # Express + MongoDB API
├── frontend/    # React (Vite) UI
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (default: `mongodb://127.0.0.1:27017`)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` if needed. Then seed demo data (optional):

```bash
npm run seed
npm run dev
```

API: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` to the backend)

## Demo accounts (after seed)

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@workdesk.io   | admin123   |
| Member | james@workdesk.io   | member123  |
| Member | priya@workdesk.io   | member123  |

## Flow

1. Open the app → choose **Admin** or **Member**
2. Sign up or log in for that role (accounts are role-specific)
3. **Admin**: create projects, add members, create/assign tasks, view dashboard & overdue
4. **Member**: view assigned tasks, update status, see projects and dashboard

## API overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public (requires `role`) |
| GET | `/api/auth/me` | Auth |
| GET/POST | `/api/projects` | Admin creates; both list |
| GET/PUT/DELETE | `/api/projects/:id` | Owner / member |
| POST/DELETE | `/api/projects/:id/members` | Admin |
| GET/POST | `/api/tasks` | Admin creates; member sees assigned |
| PUT/DELETE | `/api/tasks/:id` | Admin full; member status only |
| GET | `/api/dashboard` | Auth (scoped by role) |

## Deploy to Railway

See **[DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md)** for step-by-step setup (MongoDB + backend + frontend as 3 services).

## Tech

- **Backend:** Express, Mongoose, JWT, bcrypt, express-validator
- **Frontend:** React 18, React Router, Vite
- **Database:** MongoDB
