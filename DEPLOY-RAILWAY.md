# Deploy WorkDesk to Railway

You need **3 Railway services** (or 2 if you use MongoDB Atlas instead of Railway Mongo):

1. **MongoDB** (database)
2. **Backend** (API)
3. **Frontend** (React UI)

Push this repo to GitHub first, then connect it in [Railway](https://railway.app).

---

## Step 1 — MongoDB

1. In your Railway project, click **+ New** → **Database** → **MongoDB**.
2. After it deploys, open the MongoDB service → **Variables**.
3. Copy `MONGO_URL` (private URL — use this for the backend).

---

## Step 2 — Backend API

1. **+ New** → **GitHub Repo** → select this repository.
2. Open the new service → **Settings**:
   - **Root Directory:** `backend`
   - **Watch Paths:** `backend/**` (optional)
3. **Variables** (Settings → Variables or Variables tab):

| Variable | Value |
|----------|--------|
| `MONGO_URL` | `${{MongoDB.MONGO_URL}}` — reference from your MongoDB service (click **Add Reference**) |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
| `CLIENT_URL` | Leave empty for now; set after frontend deploys (Step 3) |

4. **Deploy** → wait until healthy.
5. Open **Settings** → **Networking** → **Generate Domain**.
6. Copy the public URL, e.g. `https://workdesk-api-production.up.railway.app`

### Seed demo data (optional)

In the backend service → **Settings** → run a one-off command or use Railway CLI:

```bash
railway link
railway run --service <backend-service-name> npm run seed
```

Demo logins (after seed): `admin@workdesk.io` / `admin123`, `james@workdesk.io` / `member123`

---

## Step 3 — Frontend

1. **+ New** → **GitHub Repo** → same repository (second service).
2. **Settings**:
   - **Root Directory:** `frontend`
3. **Variables** — set **before** the first build finishes (Vite bakes this in at build time):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND-DOMAIN.up.railway.app/api` |

Replace with your real backend URL from Step 2.

4. **Deploy** → **Generate Domain** for the frontend.

---

## Step 4 — Link CORS

1. Go back to the **backend** service → **Variables**.
2. Set:

```
CLIENT_URL=https://YOUR-FRONTEND-DOMAIN.up.railway.app
```

3. Redeploy the backend (or it may auto-redeploy).

---

## Checklist

- [ ] MongoDB service running
- [ ] Backend `MONGO_URL` + `JWT_SECRET` set
- [ ] Backend public domain generated
- [ ] Frontend `VITE_API_URL` = backend URL + `/api`
- [ ] Frontend public domain generated
- [ ] Backend `CLIENT_URL` = frontend URL (no trailing slash)
- [ ] Open frontend URL → choose Admin/Member → login works

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API calls fail / CORS | `CLIENT_URL` must exactly match the frontend URL (https, no trailing `/`) |
| Frontend shows network error | Rebuild frontend after setting `VITE_API_URL`; redeploy if you changed backend URL |
| `MONGODB_URI` / connection error | Use Railway reference `${{MongoDB.MONGO_URL}}` on the backend service |
| 404 on page refresh | `serve -s` in frontend `start` script handles SPA routing (already configured) |

---

## Using MongoDB Atlas instead of Railway Mongo

Skip the Railway MongoDB service. On the backend set:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/team_task_manager
```

Allow Railway’s IP in Atlas **Network Access** (or `0.0.0.0/0` for testing).
