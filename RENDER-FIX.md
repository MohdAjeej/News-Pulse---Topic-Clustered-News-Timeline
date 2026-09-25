# 🔧 Render "Cannot Find package.json" - Quick Fix

## ❌ Error You're Seeing

```
ENOENT: no such file or directory, open '/opt/render/project/src/package.json'
```

or

```
npm error Missing script: "dev"
npm error A complete log of this run can be found in: ...
```

---

## ✅ The Fix (2 minutes)

### Step 1: Go to Render Dashboard
1. Open [dashboard.render.com](https://dashboard.render.com)
2. Click on your **news-pulse-backend** service

### Step 2: Update Root Directory
1. Click **"Settings"** (left sidebar)
2. Scroll to **"Root Directory"** field
3. **Set it to**: `backend`
4. Click **"Save Changes"**

### Step 3: Wait for Redeploy
- Render will automatically redeploy (~2-3 minutes)
- Watch the logs for success

---

## 🎯 Why This Happens

Your repo structure is:
```
linkedin/               ← GitHub repo root
├── backend/
│   └── package.json   ← Backend dependencies HERE
├── frontend/
│   └── package.json   ← Frontend dependencies HERE
└── scraper/
```

When **Root Directory is blank or set to `src`**:
- Render looks at: `/opt/render/project/package.json` ❌
- But it's actually at: `/opt/render/project/backend/package.json` ✅

When **Root Directory is set to `backend`**:
- Render changes to: `cd /opt/render/project/backend/`
- Then runs: `npm install` ✅
- Finds: `package.json` in current directory ✅

---

## 📋 Correct Settings

### Backend (Render)

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Frontend (Vercel)

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

---

## ✅ How to Verify It's Fixed

After saving and redeployment:

1. **Check Logs** → Should see:
   ```
   ==> Detected Node.js app
   ==> Installing dependencies
   ==> added 113 packages
   ==> Build successful
   ```

2. **Test Health Endpoint**:
   Visit: `https://your-backend.onrender.com/health`
   
   Should return:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "..."
   }
   ```

---

## 🆘 Still Not Working?

### Check These:

1. **Is package.json committed to Git?**
   ```powershell
   git ls-files backend/package.json
   ```
   Should show: `backend/package.json`
   
   If blank, commit it:
   ```powershell
   git add backend/package.json
   git commit -m "Add backend package.json"
   git push
   ```

2. **Is Root Directory spelled correctly?**
   - Must be: `backend` (lowercase, no trailing slash)
   - NOT: `Backend`, `/backend`, `backend/`, `src`

3. **Check Render logs** for exact error:
   - Dashboard → Your service → Logs tab
   - Look for the actual path Render is checking

---

## 🎓 Understanding Monorepos

Your project has **multiple apps in one repo** (monorepo):

```
linkedin/          ← Single GitHub repository
├── backend/       ← Independent Node.js app
├── frontend/      ← Independent Next.js app
└── scraper/       ← Independent Python app
```

Each needs its own deployment with **Root Directory** pointing to its folder.

**Without Root Directory set**:
- ❌ Render looks for package.json at repo root
- ❌ Can't find it (it's in backend/ subfolder)
- ❌ Build fails

**With Root Directory = `backend`**:
- ✅ Render changes to backend/ folder first
- ✅ Then looks for package.json
- ✅ Finds it and builds successfully

---

## 📖 Related Files

- **render.yaml** → Updated with `rootDir: backend`
- **DEPLOYMENT.md** → Full deployment guide
- **DEPLOYMENT-STRUCTURE.md** → Detailed repo structure explanation

---

## 🚀 Quick Deploy Checklist

- [ ] Root Directory set to `backend` on Render
- [ ] Build Command is `npm install`
- [ ] Start Command is `npm start`
- [ ] Environment variables configured (DATABASE_URL, etc.)
- [ ] Save Changes and wait for redeploy
- [ ] Test `/health` endpoint
- [ ] ✅ Working!

---

**Time to fix**: 2 minutes  
**Impact**: Fixes all "Cannot find package.json" errors

**Updated**: September 23, 2026
