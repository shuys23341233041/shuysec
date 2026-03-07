# Deploy Template (sHuysSec) lên Vercel & cập nhật nhanh

Chỉ deploy **folder Template/OC** (app Next.js). Tool Click.py chạy trên máy riêng, chỉ cần trỏ `SERVER_URL` tới URL Vercel.

---

## TL;DR — Làm nhanh

| Việc | Cách làm |
|------|----------|
| **Deploy lần đầu** | Đẩy repo (cả OneClick) lên GitHub → Vercel: Add Project → Import repo → **Root Directory chọn `Template/OC`** → Deploy. |
| **Cập nhật code nhanh** | Sửa code trong `Template/OC` → `git add .` → `git commit -m "..."` → `git push origin main` → Vercel tự build (1–2 phút). Hoặc dùng **Vercel CLI**: `cd Template/OC` → `vercel --prod` (không cần push). |

---

## Step 1: Prepare code

- Ensure the project runs locally:
  ```bash
  cd Template/OC
  npm install
  npm run dev
  ```
  Open http://127.0.0.1:3000 and try Devices, Unassigned, Mass Configure.

---

## Step 2: Push code to GitHub

1. Create a new repo on [github.com](https://github.com) (e.g. `OneClick-sHuysSec`).
2. In the **OneClick** folder (parent of Template/OC), run:
   ```bash
   cd /path/to/OneClick
   git init
   git add .
   git commit -m "Initial: sHuysSec + Tool Click.py"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   **Thay YOUR_USERNAME** = tên GitHub của bạn, **YOUR_REPO** = tên repo. Ví dụ: user `lenguyenkhachuy`, repo `OneClick-sHuysSec` thì gõ: `https://github.com/lenguyenkhachuy/OneClick-sHuysSec.git`. Không để nguyên chữ YOUR_USERNAME hay dấu ngoặc nhọn trong URL — shell sẽ báo lỗi.

---

## Step 3: Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** → sign in (preferably with GitHub).
2. Click **Add New** → **Project**.
3. **Import** the repo you just pushed.
4. **Root Directory**:  
   Click **Edit** next to root and select **`Template/OC`** (deploy only the Next.js app).  
5. **Framework Preset**: leave as **Next.js** (auto-detected).
6. **Build and Output Settings**: default is fine.
7. Click **Deploy**.
8. Wait for the build (1–2 minutes). You will get a URL like:
   ```text
   https://your-project.vercel.app
   ```

9. **Environment variables (recommended):** In the Vercel project → **Settings** → **Environment Variables**, add:
   - **AUTH_SECRET**: any secret string (used to sign session cookies). Use a strong value in production.

---

## Step 4: Test on Vercel

1. Open the Vercel URL → you will be redirected to **/login** if not signed in.
2. Sign in with your account.
3. Try:
   - **Devices** → Add Device → copy **device_key**.
   - **Unassigned** → Add some accounts (paste or file).
   - **Mass Configure** → Select devices, distribute accounts.
   - **Backups** → Add a backup manually (name + link if needed).
4. Data is stored in memory: it may be lost on reload or after some time (normal for testing).

---

## Step 5: Connect Tool Click.py to Vercel

1. Open **Tool/Click.py** in the OneClick project.
2. Find the line:
   ```python
   SERVER_URL = "https://..."
   ```
3. Set it to your **Vercel URL**, e.g.:
   ```python
   SERVER_URL = "https://your-project.vercel.app"
   ```
   (no trailing slash).
4. On the web: **Devices** → **Add Device** → copy **device_key**.
5. Create **key.txt** in the same folder as **Click.py** and paste the **device_key** (one line, no extra spaces).
6. On a machine with LDPlayer, run:
   ```bash
   python Click.py
   ```
   The tool will:
   - Send auth to Vercel.
   - Receive the list of accounts assigned to the device → write **cookie.txt**.
   - Send heartbeat and stats (CPU, RAM, uptime).
   - Check for restore commands (if any) from the web.

---

## Notes

- **Data**: In-memory store, no database. Data may be lost when Vercel restarts the instance (fine for testing).
- **Custom domain**: In Vercel project → Settings → Domains you can add your own domain.
- **Logs**: Vercel → project → Deployments → select a deployment → **Functions** / **Logs** to debug build or API errors.

If the build fails, use the error message (or screenshot) to fix the issue.

---

## Quick Template updates (after first deploy)

Once the repo is connected to Vercel, each push to GitHub **triggers a new build and deploy**. Tool Click.py only needs to point to the same Vercel URL to use the latest version.

### Option 1: Push to GitHub (recommended)

1. Edit code in **Template/OC** (or any file in the repo).
2. In the repo root (e.g. `OneClick`), run:
   ```bash
   git add .
   git commit -m "Update: short description"
   git push origin main
   ```
3. Go to [vercel.com](https://vercel.com) → project → **Deployments**. A new deployment will run; wait 1–2 minutes.
4. When status is **Ready**, production is updated. The Tool does not need any change (same URL).

**Note:** If your repo is under `OneClick` and Vercel Root Directory is `Template/OC`, pushing is enough; Vercel rebuilds when the repo changes (including files outside `Template/OC`).

### Option 2: Vercel CLI — deploy from your machine (no push)

Use when you want to test a production build immediately without pushing to GitHub.

1. Install Vercel CLI (once):
   ```bash
   npm i -g vercel
   ```
2. Log in (once):
   ```bash
   vercel login
   ```
3. From **Template/OC** (in the repo linked to Vercel), run:
   ```bash
   cd Template/OC
   vercel --prod
   ```
   The first time you will be asked to link the project; choose the Vercel project. After that, `vercel --prod` is enough.
4. After a few minutes, the new version is live. The Tool still uses the same URL.

**Note:** Deploying via CLI does not create a deployment on GitHub; use `git push` to keep the repo in sync.

### Workflow cập nhật code lẹ (hàng ngày)

1. **Viết code** trong Cursor/IDE tại folder `Template/OC` (hoặc bất kỳ file nào trong repo OneClick).
2. **Commit + push:**
   ```bash
   cd /path/to/OneClick   # thay bằng đường dẫn tới repo OneClick của bạn
   git add .
   git commit -m "Update: mô tả ngắn"
   git push origin main
   ```
3. Vào [vercel.com](https://vercel.com) → project → **Deployments**: deployment mới tự chạy, đợi **Ready** (1–2 phút).
4. Xong — production đã dùng code mới. Tool Click.py không cần đổi gì (vẫn trỏ cùng URL Vercel).

**Chỉ deploy Template:** Trên Vercel, **Root Directory** phải là **`Template/OC`**. Như vậy Vercel chỉ build app Next.js trong folder đó, không build Tool hay folder khác.
