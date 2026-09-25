# 📁 Repository Structure Guide

This document explains your News Pulse repo structure for deployment configuration.

---

## 🗂️ Your Repository Structure

```
linkedin/                          ← GitHub repo root
├── .git/
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── backend/                       ← Backend Root Directory
│   ├── package.json              ⬅️ Backend dependencies HERE
│   ├── server.js                 ⬅️ Express app entry point
│   ├── db.js
│   ├── jobManager.js
│   ├── render.yaml
│   ├── .env                      (local only, not in Git)
│   └── .env.example
├── frontend/                      ← Frontend Root Directory
│   ├── package.json              ⬅️ Frontend dependencies HERE
│   ├── pages/
│   │   ├── index.js
│   │   └── _app.js
│   ├── public/
│   ├── styles/
│   ├── .next/                    (build output)
│   ├── vercel.json
│   ├── .env.local                (local only, not in Git)
│   └── .env.local.example
└── scraper/                       ← Python scraper
    ├── scraper.py
    ├── requirements.txt
    ├── .env                       (local only, not in Git)
    └── .env.example
```

---

## ⚙️ Render Configuration

### Backend Service Settings

| Setting | Value | Why |
|---------|-------|-----|
| **Root Directory** | `backend` | ⚠️ **package.json is in backend/ folder** |
| **Build Command** | `npm install` | Installs from backend/package.json |
| **Start Command** | `npm start` | Runs backend/server.js |

### What Render Does

1. Clones your repo: `linkedin/`
2. Changes to Root Directory: `cd backend/`
3. Runs build command: `npm install` (finds `backend/package.json`)
4. Runs start command: `npm start` (runs script from `backend/package.json`)

### If Root Directory is Wrong

❌ **Set to blank or `src`**:
```
/opt/render/project/
└── (Render looks for package.json here — NOT FOUND!)
```

✅ **Set to `backend`**:
```
/opt/render/project/backend/
├── package.json          ⬅️ FOUND!
├── server.js
└── (all backend files)
```

---

## 🎯 Vercel Configuration

### Frontend Service Settings

| Setting | Value | Why |
|---------|-------|-----|
| **Root Directory** | `frontend` | ⚠️ **package.json is in frontend/ folder** |
| **Build Command** | `npm run build` | Builds from frontend/package.json |
| **Output Directory** | `.next` | Next.js build output |

### What Vercel Does

1. Clones your repo: `linkedin/`
2. Changes to Root Directory: `cd frontend/`
3. Runs build: `npm run build` (finds `frontend/package.json`)
4. Deploys: `frontend/.next/` static files

---

## 🔍 How to Verify Locally

### Check package.json locations

**PowerShell**:
```powershell
Get-ChildItem -Recurse -Filter "package.json" -Exclude node_modules | Select-Object FullName
```

**Expected Output**:
```
FullName
--------
C:\Users\azizp\Downloads\linkedin\backend\package.json
C:\Users\azizp\Downloads\linkedin\frontend\package.json
```

### Test Render's perspective

Simulate what Render does:
```powershell
# Go to backend folder
cd C:\Users\azizp\Downloads\linkedin\backend

# Verify package.json exists
Test-Path package.json
# Should return: True

# Try the build command
npm install
# Should succeed

# Try the start command
npm start
# Should start server
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Root Directory = blank
```
Render looks at: /opt/render/project/package.json
Reality:         /opt/render/project/backend/package.json
Result:          ❌ "Cannot find package.json"
```

### ❌ Mistake 2: Root Directory = `src`
```
Render looks at: /opt/render/project/src/package.json
Reality:         /opt/render/project/backend/package.json
Result:          ❌ "Cannot find package.json"
```

### ✅ Correct: Root Directory = `backend`
```
Render looks at: /opt/render/project/backend/package.json
Reality:         /opt/render/project/backend/package.json
Result:          ✅ Found! Build succeeds
```

---

## 📋 Deployment Checklist

Before deploying, verify:

### Backend (Render)
- [ ] `backend/package.json` exists in GitHub
- [ ] `backend/server.js` exists in GitHub
- [ ] Render Root Directory = `backend`
- [ ] Build Command = `npm install`
- [ ] Start Command = `npm start`

### Frontend (Vercel)
- [ ] `frontend/package.json` exists in GitHub
- [ ] `frontend/pages/` folder exists
- [ ] Vercel Root Directory = `frontend`
- [ ] Build Command = `npm run build`
- [ ] Framework = Next.js (auto-detected)

---

## 🔧 How to Fix on Render

If you're getting "Cannot find package.json" errors:

1. **Go to Render Dashboard**
2. **Click your service** (news-pulse-backend)
3. **Settings** (left sidebar)
4. **Scroll to "Root Directory"**
5. **Set to**: `backend`
6. **Save Changes**
7. **Render auto-redeploys** (~2-3 minutes)

---

## 💡 Understanding Monorepos

Your project is a **monorepo** (multiple apps in one repo):

```
linkedin/
├── backend/      ← Separate Node.js app
├── frontend/     ← Separate Next.js app
└── scraper/      ← Separate Python app
```

Each needs its own deployment:
- **Backend**: Render Web Service (Root Dir: `backend`)
- **Frontend**: Vercel Project (Root Dir: `frontend`)
- **Scraper**: Not deployed (runs on-demand or scheduled)

---

## ✅ Quick Verification Commands

Run these locally to confirm everything is correct:

```powershell
# Verify backend structure
cd backend
Test-Path package.json    # Should be True
Test-Path server.js       # Should be True

# Verify frontend structure
cd ..\frontend
Test-Path package.json    # Should be True
Test-Path pages\index.js  # Should be True

# Verify both are committed
git ls-files backend/package.json    # Should show path
git ls-files frontend/package.json   # Should show path
```

---

## 🎉 Summary

For **News Pulse** deployment:

| Service | Platform | Root Directory | Why |
|---------|----------|----------------|-----|
| Backend API | Render | `backend` | package.json is in `backend/` |
| Frontend | Vercel | `frontend` | package.json is in `frontend/` |
| Database | Render | N/A | PostgreSQL service (no code) |

**The Root Directory setting tells Render/Vercel WHERE to find package.json in your monorepo!**

---

**Still stuck?** Check that:
1. Files are committed to Git: `git ls-files backend/package.json`
2. Files are pushed to GitHub: Check on github.com
3. Root Directory is spelled correctly: `backend` (lowercase, no trailing slash)
