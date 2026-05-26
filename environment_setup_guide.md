# environment_setup_guide.md
# Complete Environment Variables Setup Guide
# Enterprise Attendance & Production Web App

> **Who this is for:** You — the project owner setting up the app for the first time.
> **What this covers:** Every single environment variable, where it comes from, how to get it, and how to paste it correctly.
> **Time required:** ~45–90 minutes total (most of it is waiting for Google/MongoDB to provision things).

---

## Table of Contents

1. [Before You Begin — Prerequisites](#1-before-you-begin--prerequisites)
2. [MONGODB_URI — MongoDB Atlas](#2-mongodb_uri--mongodb-atlas)
3. [JWT_SECRET — Random Secret Key](#3-jwt_secret--random-secret-key)
4. [GOOGLE_SERVICE_ACCOUNT_KEY — Google Drive](#4-google_service_account_key--google-drive)
5. [GOOGLE_DRIVE_FOLDER_ID — Drive Folder](#5-google_drive_folder_id--drive-folder)
6. [ENCRYPTION_KEY — AES-256 Key](#6-encryption_key--aes-256-key)
7. [NEXT_PUBLIC_APP_URL — Your App URL](#7-next_public_app_url--your-app-url)
8. [Putting It All Together — Your Final .env.local](#8-putting-it-all-together--your-final-envlocal)
9. [Setting Variables on Vercel (Production)](#9-setting-variables-on-vercel-production)
10. [Verification Checklist](#10-verification-checklist)
11. [Troubleshooting Common Errors](#11-troubleshooting-common-errors)

---

## 1. Before You Begin — Prerequisites

Make sure you have the following **before starting any step**:

| Requirement | Why needed | Free? |
|-------------|-----------|-------|
| A Google account (Gmail) | For Google Cloud + Google Drive | ✅ Yes |
| A MongoDB Atlas account | For the database | ✅ Yes (free tier) |
| A Vercel account | For hosting | ✅ Yes (free tier) |
| Node.js 18+ installed locally | To run the app | ✅ Yes |
| Your project folder open in a terminal | To paste and test values | — |
| A text editor (VS Code recommended) | To edit `.env.local` | ✅ Yes |

**Sign up links (do this first if you haven't):**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
- Vercel: https://vercel.com/signup
- Google Cloud: https://console.cloud.google.com (sign in with your Gmail)

---

## 2. `MONGODB_URI` — MongoDB Atlas

**What it is:** The connection string your app uses to talk to your database.

**Example of what it looks like when done:**
```
MONGODB_URI=mongodb+srv://workforceAdmin:MyP@ssw0rd@cluster0.abc12.mongodb.net/workforce?retryWrites=true&w=majority
```

---

### Step 1 — Create a Free Atlas Account & Cluster

1. Go to **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with your email or Google account.
3. After signing in, you will see the Atlas dashboard. Click **"Build a Database"**.
4. Choose the **FREE** tier (M0 Sandbox). It says "Free forever".
5. Choose a cloud provider: select **AWS**.
6. Choose a region: pick the one **closest to your physical location** (e.g., Mumbai for India).
7. Leave the cluster name as `Cluster0` (or rename it to `workforce-cluster`).
8. Click **"Create Cluster"**. 
   - ⏳ Wait 1–3 minutes for it to provision. You will see a progress bar.

---

### Step 2 — Create a Database User

> This is **not** your Atlas login. This is a separate username/password just for the database connection.

1. In the left sidebar, click **"Database Access"** (under Security).
2. Click **"Add New Database User"**.
3. Under Authentication Method, keep **"Password"** selected.
4. Fill in:
   - **Username:** `workforceAdmin` (or any name you choose — write it down)
   - **Password:** Click **"Autogenerate Secure Password"** → click **"Copy"** and save it somewhere safe (you'll need it in Step 5).
5. Under "Database User Privileges", select **"Atlas Admin"** (simplest for now; you can restrict later).
6. Click **"Add User"**.

---

### Step 3 — Allow Network Access

> By default, Atlas blocks all IPs. You need to allow your app to connect.

1. In the left sidebar, click **"Network Access"** (under Security).
2. Click **"Add IP Address"**.
3. In the popup, click **"Allow Access from Anywhere"**.
   - This sets `0.0.0.0/0` which allows all IPs.
   - ⚠️ This is fine for development and Vercel hosting. For a production bank-level app, you would restrict to Vercel's IP ranges — but for this project, "Allow Anywhere" is the practical choice since Vercel uses dynamic IPs.
4. Click **"Confirm"**.

---

### Step 4 — Get the Connection String

1. In the left sidebar, click **"Database"** (under Deployments).
2. Click **"Connect"** next to your cluster.
3. In the popup, click **"Drivers"**.
4. Under "Select your driver and version", choose:
   - Driver: **Node.js**
   - Version: **5.5 or later**
5. You will see a connection string that looks like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```
6. Copy this string.

---

### Step 5 — Assemble Your MONGODB_URI

Replace the placeholders in the copied string:
- `<username>` → the username you chose in Step 2 (e.g., `workforceAdmin`)
- `<password>` → the password you copied in Step 2
- Add `/workforce` between `.mongodb.net/` and `?` to specify your database name.

**Final result:**
```
mongodb+srv://workforceAdmin:YourPasswordHere@cluster0.abc12.mongodb.net/workforce?retryWrites=true&w=majority
```

> ⚠️ **If your password contains special characters** (like `@`, `#`, `!`), you must URL-encode them.
> For example: `P@ss!word` becomes `P%40ss%21word`
> Use this tool to encode: https://www.urlencoder.org/

Paste this as your `MONGODB_URI` value.

---

## 3. `JWT_SECRET` — Random Secret Key

**What it is:** A long random string used to sign and verify login tokens. If this leaks, someone can forge login sessions. Keep it secret.

**Example of what it looks like:**
```
JWT_SECRET=a7f3c2d8e9b1f4a6c3d2e8f1b4a7c3d2e8f1b4a7c3d2e8f1b4a7c3d2e8f1b4
```

---

### Option A — Generate on Your Computer (Recommended)

Open your terminal and run **one** of these commands:

**On Mac or Linux:**
```bash
openssl rand -hex 32
```

**On Windows (PowerShell):**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**On Windows (if OpenSSL is installed):**
```cmd
openssl rand -hex 32
```

The output will be a 64-character string of random letters and numbers. Copy it.

---

### Option B — Use an Online Generator

Go to **https://generate-secret.vercel.app/32** — it generates a new secret every time you load the page. Copy the output.

---

### Rules for JWT_SECRET

- Must be **at least 32 characters** long. Longer is better.
- Must be **completely random**. Do not use a word or phrase.
- **Never share it** or commit it to GitHub.
- If you ever suspect it was exposed, generate a new one and redeploy — this will log out all users.

Paste this random string as your `JWT_SECRET` value.

---

## 4. `GOOGLE_SERVICE_ACCOUNT_KEY` — Google Drive

**What it is:** A credential file (JSON) that lets your app upload photos to Google Drive on behalf of a "robot" Google account (called a Service Account), without needing a user to log in.

**What it looks like when done:**
```
GOOGLE_SERVICE_ACCOUNT_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9... (very long string)
```

This is one of the most involved steps. Follow it carefully.

---

### Step 1 — Go to Google Cloud Console

1. Open **https://console.cloud.google.com**
2. Sign in with your Gmail account.
3. At the top of the page, you will see a project dropdown (it might say "Select a project" or show a previous project name). Click it.
4. In the popup, click **"New Project"** (top right of the popup).
5. Fill in:
   - **Project Name:** `workforce-attendance` (or any name)
   - **Location:** Leave as "No organization" unless your company has a Google Workspace
6. Click **"Create"**.
7. Wait a few seconds, then click the notification bell or the project dropdown again and select your new project.

---

### Step 2 — Enable the Google Drive API

1. In the left sidebar, click the **≡ (hamburger menu)** → hover over **"APIs & Services"** → click **"Library"**.
2. In the search box, type **"Google Drive API"**.
3. Click on **"Google Drive API"** in the results.
4. Click the blue **"Enable"** button.
5. Wait a few seconds for it to enable. You will be taken to the API overview page.

---

### Step 3 — Create a Service Account

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**.
2. Click **"+ Create Credentials"** at the top.
3. Select **"Service account"**.
4. Fill in:
   - **Service account name:** `workforce-drive-uploader`
   - **Service account ID:** Auto-fills as `workforce-drive-uploader` (leave it)
   - **Description:** `Service account for uploading attendance photos`
5. Click **"Create and Continue"**.
6. On the "Grant this service account access" step:
   - Click the "Select a role" dropdown.
   - Search for **"Editor"** and select **"Editor"**.
7. Click **"Continue"**.
8. On the "Grant users access" step: leave it blank, click **"Done"**.

---

### Step 4 — Download the Service Account JSON Key

1. You are now on the Credentials page. Under "Service Accounts", you will see `workforce-drive-uploader@your-project.iam.gserviceaccount.com`. Click on it.
2. Go to the **"Keys"** tab.
3. Click **"Add Key"** → **"Create new key"**.
4. Select **"JSON"** format.
5. Click **"Create"**.
6. A JSON file will automatically download to your computer. It will be named something like `your-project-abc123-xxxxxxxxxxxx.json`.
7. **Keep this file safe.** It contains a private key. Do not upload it to GitHub.

---

### Step 5 — Note the Service Account Email

Open the downloaded JSON file in a text editor. Find the `client_email` field. It will look like:
```
"client_email": "workforce-drive-uploader@your-project-id.iam.gserviceaccount.com"
```
**Copy this email address.** You will need it in the Google Drive folder step (Section 5).

---

### Step 6 — Base64-Encode the JSON Key

Your app cannot read the raw JSON file directly as an environment variable (it's multi-line). You must encode it as a single-line base64 string.

**On Mac or Linux (Terminal):**
```bash
base64 -i /path/to/your-downloaded-key.json | tr -d '\n'
```
Replace `/path/to/your-downloaded-key.json` with the actual file path (you can drag the file into the terminal to auto-fill the path).

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("C:\path\to\your-downloaded-key.json"))
```

**Alternative (any OS) — Using Node.js:**
```bash
node -e "console.log(require('fs').readFileSync('./your-key-file.json').toString('base64'))"
```
Run this from the folder where the JSON file is saved.

The output will be a very long single-line string starting with something like `eyJhbGciO...`.

Paste this entire string as your `GOOGLE_SERVICE_ACCOUNT_KEY` value.

> ✅ **Verification:** The base64 string should be several hundred characters long with no line breaks or spaces.

---

## 5. `GOOGLE_DRIVE_FOLDER_ID` — Drive Folder

**What it is:** The ID of the Google Drive folder where all attendance photos (selfies and machine photos) will be stored. Your app uploads to this folder.

**Example:**
```
GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

---

### Step 1 — Open Google Drive

1. Go to **https://drive.google.com** and sign in with the **same Gmail account** you used for Google Cloud.
2. In the left sidebar, click **"+ New"** → **"New Folder"**.
3. Name the folder: `attendance-photos`
4. Click **"Create"**.

---

### Step 2 — Get the Folder ID

1. In Google Drive, find the `attendance-photos` folder you just created.
2. Double-click to open it.
3. Look at the URL in your browser. It will look like:
   ```
   https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
   ```
4. The part after `/folders/` is your Folder ID:
   ```
   1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
   ```
5. Copy this ID.

---

### Step 3 — Share the Folder with Your Service Account

> This is the critical step that allows your app (via the service account) to upload files to this folder.

1. Right-click on the `attendance-photos` folder in Drive → click **"Share"**.
2. In the "Add people and groups" field, paste the **service account email** you copied in Section 4, Step 5.
   - It looks like: `workforce-drive-uploader@your-project-id.iam.gserviceaccount.com`
3. Make sure the permission is set to **"Editor"** (not Viewer).
4. **Uncheck** "Notify people" (the service account doesn't have an inbox).
5. Click **"Share"**.

---

### Step 4 — Create Sub-Folders (Optional but Recommended)

For organization, create two sub-folders inside `attendance-photos`:
- `selfies` (for IN/OUT punch selfies)
- `machines` (for factory machine photos)

> Note: The app currently uploads everything to the root folder ID. Sub-folder routing can be added later by passing different folder IDs per upload context. For now, one folder ID is sufficient.

Paste the folder ID as your `GOOGLE_DRIVE_FOLDER_ID` value.

---

## 6. `ENCRYPTION_KEY` — AES-256 Key

**What it is:** A 32-byte (256-bit) key used to encrypt sensitive data (Aadhaar card numbers and bank account numbers) before storing them in the database. Even if someone gets your database, they cannot read this data without this key.

**Example:**
```
ENCRYPTION_KEY=3a7f2c8d4e1b9f6a2c5d8e3f7b4a1c6d9e2f5b8a3c7d4e1f6b9a2c5d8e3f7b4
```

---

### Generate Your Encryption Key

**On Mac or Linux (Terminal):**
```bash
openssl rand -hex 32
```

**On Windows (PowerShell):**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**Using Node.js (any OS):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The output will be a **64-character hexadecimal string** (each byte = 2 hex characters, 32 bytes = 64 chars).

---

### Critical Rules for ENCRYPTION_KEY

| Rule | Detail |
|------|--------|
| **Must be exactly 64 hex characters** | Check length: `echo -n "yourkey" \| wc -c` should return 64 |
| **Never change it after data is stored** | If you change it, all encrypted data becomes permanently unreadable |
| **Back it up separately** | Store it in a password manager (Bitwarden, 1Password, etc.) |
| **Never commit to GitHub** | This is in `.env.local` which is gitignored — never paste it anywhere public |
| **One key per environment** | Use a different key for development vs production |

Paste the 64-character hex string as your `ENCRYPTION_KEY` value.

> ⚠️ **The placeholder in your .env file was all zeros (`000...000`). This is insecure. Replace it with a real random key before running the app.**

---

## 7. `NEXT_PUBLIC_APP_URL` — Your App URL

**What it is:** The public URL of your deployed application. Used for things like redirects, CORS headers, and any absolute URL the app needs to reference itself.

**The `NEXT_PUBLIC_` prefix** means this variable is exposed to the browser (frontend), unlike the others which are server-only. Do not put secrets in `NEXT_PUBLIC_` variables.

---

### During Development

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

This is already the correct value for local development. Leave it as-is while working locally.

---

### After Deploying to Vercel

Once you deploy (covered in Section 9), Vercel gives you a URL like:
```
https://workforce-attendance.vercel.app
```

Or if you connect a custom domain:
```
https://attendance.yourcompany.com
```

Update this value to your actual production URL **after your first Vercel deployment**. You can find your URL in the Vercel dashboard under your project → "Domains".

---

## 8. Putting It All Together — Your Final `.env.local`

Create a file named exactly `.env.local` in the **root of your project** (same folder as `package.json`). Paste the following and fill in each value:

```dotenv
# ============================================================
# DATABASE
# ============================================================
# MongoDB Atlas connection string
# Format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DBNAME?...
MONGODB_URI=mongodb+srv://workforceAdmin:YourActualPassword@cluster0.abc12.mongodb.net/workforce?retryWrites=true&w=majority

# ============================================================
# AUTHENTICATION
# ============================================================
# Random 64-character hex string for signing JWT tokens
# Generate: openssl rand -hex 32
JWT_SECRET=paste_your_64_char_random_hex_string_here

# ============================================================
# GOOGLE DRIVE (Photo Storage)
# ============================================================
# Base64-encoded content of your Google Service Account JSON key file
# Generate: base64 -i service-account-key.json | tr -d '\n'
GOOGLE_SERVICE_ACCOUNT_KEY=paste_your_very_long_base64_string_here

# The ID from the Google Drive folder URL
# URL looks like: https://drive.google.com/drive/folders/THIS_PART_IS_THE_ID
GOOGLE_DRIVE_FOLDER_ID=paste_your_folder_id_here

# ============================================================
# ENCRYPTION (PII — Aadhaar & Bank Account Numbers)
# ============================================================
# 32-byte AES-256 key as a 64-character hex string
# Generate: openssl rand -hex 32
# WARNING: Never change this after data has been stored in the DB
ENCRYPTION_KEY=paste_your_64_char_hex_key_here

# ============================================================
# APP URL
# ============================================================
# Use http://localhost:3000 for local development
# Use your actual Vercel URL for production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Verify the File is Gitignored

Open your `.gitignore` file (in the project root). Confirm it contains:
```
.env.local
.env*.local
```

If it doesn't, **add those two lines now**. Never commit `.env.local` to Git.

---

### Test Your Setup Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. If the app loads without errors in the terminal, your environment is set up correctly.

**Common startup errors and what they mean:**

| Error in terminal | Cause | Fix |
|-------------------|-------|-----|
| `MongoServerError: bad auth` | Wrong MongoDB username or password | Re-check MONGODB_URI credentials |
| `MongoNetworkError: connection refused` | Atlas IP not whitelisted | Go to Atlas → Network Access → Add `0.0.0.0/0` |
| `Error: Invalid key length` | ENCRYPTION_KEY is wrong length | Re-generate: must be exactly 64 hex chars |
| `Error: DECODER: bad base64` | Malformed GOOGLE_SERVICE_ACCOUNT_KEY | Re-encode the JSON key, ensure no line breaks |
| `Cannot find module` | Missing `npm install` | Run `npm install` in the project root |

---

## 9. Setting Variables on Vercel (Production)

When you deploy to Vercel, you cannot use `.env.local` — that file stays on your computer. You must add each variable directly to the Vercel dashboard.

---

### Step 1 — Deploy Your Project to Vercel

1. Push your project code to a **GitHub repository** (make sure `.env.local` is gitignored and not committed).
2. Go to **https://vercel.com** and sign in.
3. Click **"Add New Project"**.
4. Click **"Import Git Repository"** and connect your GitHub account if prompted.
5. Find your project repository and click **"Import"**.
6. On the "Configure Project" screen, **do not click Deploy yet** — you need to add environment variables first.

---

### Step 2 — Add Environment Variables in Vercel

Still on the "Configure Project" screen, scroll down to the **"Environment Variables"** section.

Add each variable one by one using the table below. Click **"Add"** after each one.

| Variable Name | Value to Paste | Environment |
|---------------|---------------|-------------|
| `MONGODB_URI` | Your full Atlas connection string | Production, Preview, Development |
| `JWT_SECRET` | Your 64-char random hex string | Production, Preview, Development |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Your long base64 string | Production, Preview, Development |
| `GOOGLE_DRIVE_FOLDER_ID` | Your Drive folder ID | Production, Preview, Development |
| `ENCRYPTION_KEY` | Your 64-char hex encryption key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production only |

> For `NEXT_PUBLIC_APP_URL` in production, use the actual Vercel URL you will get after deploying (e.g., `https://workforce-attendance.vercel.app`). You can update this after the first deploy.

---

### Step 3 — Deploy

Click **"Deploy"**. Vercel will build and deploy your app. This takes 2–4 minutes.

After deployment, you will get a URL like `https://workforce-attendance-xyz.vercel.app`. Copy it and:
1. Go to Vercel → your project → **Settings** → **Environment Variables**.
2. Find `NEXT_PUBLIC_APP_URL` and update its value to your actual Vercel URL.
3. Go to **Deployments** → click the three dots on the latest deployment → **"Redeploy"** to apply the change.

---

### Step 4 — Update MONGODB_URI for Production (if using a different cluster)

For production, you may want to use a paid Atlas cluster (M10 or higher) for better performance. If so:
1. Create a new cluster in Atlas.
2. Create a new database user specifically for production.
3. Whitelist `0.0.0.0/0` (or Vercel's IP ranges if you prefer stricter access).
4. Get the new connection string and update `MONGODB_URI` in Vercel.

---

## 10. Verification Checklist

Go through this checklist after completing every step:

### MongoDB Atlas
- [ ] Cluster is created and shows "Active" status (green dot)
- [ ] Database user created with a strong password
- [ ] Network Access shows `0.0.0.0/0` (or your IP)
- [ ] Connection string copied and placeholders replaced (`<username>`, `<password>`)
- [ ] `/workforce` database name added to the connection string
- [ ] `MONGODB_URI` pasted into `.env.local`

### JWT Secret
- [ ] Generated using `openssl rand -hex 32` or equivalent
- [ ] Output is 64 characters long
- [ ] `JWT_SECRET` pasted into `.env.local`

### Google Cloud & Drive
- [ ] New Google Cloud project created
- [ ] Google Drive API enabled (shows "Manage" button, not "Enable")
- [ ] Service account created: `workforce-drive-uploader@...`
- [ ] JSON key downloaded to your computer
- [ ] Service account email copied from the JSON file's `client_email` field
- [ ] JSON key base64-encoded (output is one long line, no line breaks)
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` pasted into `.env.local`

### Google Drive Folder
- [ ] `attendance-photos` folder created in Google Drive
- [ ] Folder opened and ID copied from the URL
- [ ] Folder shared with the service account email (Editor permission)
- [ ] `GOOGLE_DRIVE_FOLDER_ID` pasted into `.env.local`

### Encryption Key
- [ ] Generated using `openssl rand -hex 32` or equivalent
- [ ] Output is exactly 64 characters long
- [ ] Key saved in a password manager as backup
- [ ] `ENCRYPTION_KEY` pasted into `.env.local` (replacing the all-zeros placeholder)

### App URL
- [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local dev
- [ ] Updated to real Vercel URL after first deployment

### Final Checks
- [ ] `.env.local` file exists in the project root
- [ ] `.gitignore` contains `.env.local` — confirmed it will NOT be committed
- [ ] `npm run dev` starts without errors
- [ ] No `.env.local` content appears in `git status` or `git diff`

---

## 11. Troubleshooting Common Errors

### "MongoServerError: Authentication failed"

**Cause:** Wrong username or password in MONGODB_URI.

**Fix:**
1. Go to Atlas → Database Access.
2. Click the pencil icon next to your user.
3. Click "Edit Password" → Autogenerate a new one → Copy it.
4. Update your MONGODB_URI with the new password.
5. If the password has special characters, URL-encode them.

---

### "MongoNetworkTimeoutError" or "connection timed out"

**Cause:** Your IP is not whitelisted in Atlas.

**Fix:**
1. Go to Atlas → Network Access.
2. Click "Add IP Address" → "Allow Access from Anywhere" → Confirm.
3. Wait 1 minute for the change to propagate.

---

### "Error: error:0308010C:digital envelope routines::unsupported"

**Cause:** Wrong Node.js version (Node 17+ changed OpenSSL defaults).

**Fix:**
```bash
# Check your Node version:
node --version

# If it's v17 or higher, either downgrade to v18 LTS or add this to your package.json scripts:
"dev": "NODE_OPTIONS=--openssl-legacy-provider next dev"
```

---

### "SyntaxError: Unexpected token in JSON" on Google Drive upload

**Cause:** The `GOOGLE_SERVICE_ACCOUNT_KEY` base64 string has line breaks or spaces in it.

**Fix:** Re-run the base64 encode command and ensure you pipe through `tr -d '\n'` to strip line breaks:
```bash
base64 -i your-key.json | tr -d '\n'
```
Then copy the output fresh into `.env.local`.

---

### "Error: Invalid key length" on startup

**Cause:** `ENCRYPTION_KEY` is not exactly 64 hex characters (32 bytes).

**Fix:**
```bash
# Check the length of your current key:
echo -n "your_encryption_key_here" | wc -c
# Must output: 64

# If not 64, regenerate:
openssl rand -hex 32
```

---

### "403 Forbidden" when uploading to Google Drive

**Cause:** The Drive folder is not shared with the service account, or the service account doesn't have Editor permission.

**Fix:**
1. Open Google Drive → find `attendance-photos` → right-click → Share.
2. Check if the service account email is listed with "Editor" role.
3. If not, add it: paste `workforce-drive-uploader@your-project.iam.gserviceaccount.com` → set to Editor → Share.

---

### "TokenExpiredError" after 12 hours

**Cause:** By design — JWTs expire after 12 hours. This is a security feature.

**Expected behavior:** The app should detect the 401 response and redirect the user to the login page.

**If users are getting logged out unexpectedly early:** Check that your server clock is correct and that `JWT_SECRET` hasn't changed between deployments.

---

### Changes to `.env.local` not taking effect

**Cause:** Next.js caches environment variables at build time. You must restart the dev server after any change.

**Fix:**
```bash
# Stop the dev server (Ctrl+C), then:
npm run dev
```

For Vercel: any change to environment variables requires a **redeployment** to take effect. Go to Vercel → Deployments → Redeploy.

---

*End of environment_setup_guide.md*
*Estimated setup time: 45–90 minutes. Once complete, your app is ready for `npm run dev` locally and Vercel deployment.*
