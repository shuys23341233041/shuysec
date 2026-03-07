# sHuysSec – Dashboard + Tool Click.py

Next.js dashboard integrated with **Tool Click.py**: manage devices, accounts, backup/restore. The tool runs on Windows (LDPlayer) and connects to this server.

## Run locally

```bash
cd Template/OC
npm install
npm run dev
```

Open http://127.0.0.1:3000. You must **sign in** at `/login` before using the dashboard.

## Sign in

- Sign in at **/login** to access the dashboard.
- Set **AUTH_SECRET** (and optionally other env vars) when deploying to production.

## Deploy to Vercel (test)

1. Push the repo to GitHub (or another Git host).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. **Root Directory**: set **`Template/OC`** (required if the repo root is the parent folder).
4. Deploy. Vercel will build and give you a URL like `https://xxx.vercel.app`.

**Quick updates:** After connecting GitHub to Vercel, each `git push` to the deployed branch triggers a new build. Edit code in `Template/OC` → commit + push → wait 1–2 minutes. See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** for details.

## Configure Tool Click.py after deploy

Once you have your Vercel URL (e.g. `https://your-app.vercel.app`):

1. Open **Tool/Click.py** in the OneClick project.
2. Find the line:
   ```python
   SERVER_URL = "https://..."
   ```
3. Set it to your Vercel URL:
   ```python
   SERVER_URL = "https://your-app.vercel.app"
   ```
   (no trailing slash).
4. On the web: **Devices** → **Add Device** → copy the **device_key**.
5. Create **key.txt** in the same folder as Click.py and paste the device_key (single line, no extra spaces).
6. Run `python Click.py` on a machine with LDPlayer. The tool will authenticate, sync accounts to cookie.txt, send heartbeat and stats, and receive restore commands from the web.

## Features

| Page | Description |
|------|-------------|
| **Dashboard** | Stats for devices, accounts, uptime (from API). |
| **Devices** | List devices, add devices (get key for Click.py). |
| **Mass Configure** | Assign accounts from Unassigned to multiple devices (fixed count or fill to target). |
| **Unassigned** | Unassigned accounts; add new (paste/file). |
| **Backups** | Backup list; send restore command to a device (Tool downloads backup and runs LDPlayer Restore). |

## API for Click.py (implemented)

- `POST /api/device/auth` – Authenticate with device_key, returns device_name + accounts.
- `POST /api/device/heartbeat` – Send heartbeat.
- `POST /api/device/stats` – Send CPU, RAM, uptime, screenshot.
- `GET /api/device/accounts` – Get accounts assigned to the device.
- `GET /api/device/pending_restore` – Check pending restore command.
- `POST /api/device/restore_done` – Notify restore complete.

Note: Vercel uses an in-memory store (demo). Data may be lost when the instance restarts. For production, use a database (e.g. Vercel Postgres, KV).
