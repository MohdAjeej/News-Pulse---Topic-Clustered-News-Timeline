# 🚀 News Pulse - Deployment Guide

Complete guide for deploying News Pulse to production with Vercel (frontend), Render (backend), and PostgreSQL (database).

---

## 📋 Prerequisites

- GitHub account (for Vercel and Render)
- Git installed locally
- Code pushed to GitHub repository

---

## 1️⃣ Deploy Database (Render PostgreSQL)

### Create Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `news-pulse-db`
   - **Database**: `news_pulse`
   - **User**: `news_pulse_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait ~2 minutes for provisioning

### Get Connection String

1. In database dashboard, find **"Connections"**
2. Copy **"Internal Database URL"** (starts with `postgresql://`)
3. Save this for backend configuration

### Initialize Schema

1. Click **"Connect"** → **"External Connection"**
2. Copy the `psql` command and run in terminal
3. Once connected, run:

```sql
CREATE TABLE clusters (
    id SERIAL PRIMARY KEY,
    label VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER REFERENCES clusters(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url VARCHAR(1000) UNIQUE NOT NULL,
    source VARCHAR(200) NOT NULL,
    published_at TIMESTAMP NOT NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cluster_id ON articles(cluster_id);
CREATE INDEX idx_published_at ON articles(published_at);
```

### Insert Sample Data (Optional)

```sql
INSERT INTO clusters (label) VALUES 
    ('Global technology companies announce major innovations'),
    ('Government officials discuss new international policies'),
    ('Stock markets show significant movement');

INSERT INTO articles (cluster_id, title, url, source, published_at, summary) VALUES
    (1, 'AI Breakthrough Announced', 'https://example.com/ai-1', 'TechCrunch', NOW() - INTERVAL '2 hours', 'Major AI advancement'),
    (1, 'New ML Model Shows Promise', 'https://example.com/ai-2', 'BBC News', NOW() - INTERVAL '1 hour', 'Revolutionary approach'),
    (1, 'Industry Leaders React', 'https://example.com/ai-3', 'CNN', NOW(), 'Expert opinions'),
    (2, 'Trade Agreement Negotiations', 'https://example.com/trade-1', 'BBC News', NOW() - INTERVAL '3 hours', 'Ongoing discussions'),
    (2, 'Officials Meet on Policy', 'https://example.com/trade-2', 'The New York Times', NOW() - INTERVAL '2 hours', 'High-level meetings'),
    (2, 'Expert Analysis', 'https://example.com/trade-3', 'NPR', NOW() - INTERVAL '1 hour', 'Expert weighs in'),
    (3, 'Markets React to Data', 'https://example.com/market-1', 'CNN', NOW() - INTERVAL '4 hours', 'Market movements'),
    (3, 'Investors Watch Fed', 'https://example.com/market-2', 'BBC News', NOW() - INTERVAL '2 hours', 'Fed decision pending'),
    (3, 'Stock Analysis', 'https://example.com/market-3', 'The New York Times', NOW(), 'Market predictions');
```

---

## 2️⃣ Deploy Backend (Render Web Service)

### Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `news-pulse-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT: Must be set to "backend"**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

> **⚠️ Critical**: The Root Directory MUST be set to `backend` because that's where package.json lives in your repo structure. If you see an error like "Cannot find package.json", this setting is wrong.

### Set Environment Variables

Add these in the **Environment** section:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | *Paste Internal Database URL* |
| `FRONTEND_URL` | `https://temporary.com` *(update after Vercel)* |

### Deploy & Test

1. Click **"Create Web Service"**
2. Wait ~3-5 minutes
3. Copy backend URL: `https://news-pulse-backend.onrender.com`
4. Test: Visit `https://your-backend-url.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-..."
}
```

---

## 3️⃣ Deploy Frontend (Vercel)

### Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js

### Configure

- **Framework**: Next.js (auto)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `.next` (auto)

### Set Environment Variable

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | *Paste Render backend URL* |

Example: `https://news-pulse-backend.onrender.com`

### Deploy

1. Click **"Deploy"**
2. Wait ~2-3 minutes
3. Get URL: `https://news-pulse-xyz.vercel.app`

---

## 4️⃣ Update Backend CORS

1. Go to Render backend dashboard
2. Environment → `FRONTEND_URL`
3. Update to your Vercel URL
4. Backend auto-redeploys

---

## 5️⃣ Test Production

1. Visit your Vercel URL
2. Should see colorful timeline
3. Click bars → articles load
4. Toggle filters → timeline updates
5. No CORS errors in console

---

## Troubleshooting

### "Cannot find package.json" on Render
**Error**: `ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`

**Cause**: Root Directory is not set correctly

**Fix**:
1. Go to your Render service → Settings
2. Find **Root Directory** field
3. Set it to `backend` (where package.json actually lives)
4. Click **Save Changes**
5. Render will auto-redeploy

**How to verify locally**:
```powershell
# Check your repo structure
Get-ChildItem -Recurse -Filter "package.json" | Select-Object FullName
```

Your backend package.json should be at: `backend/package.json`

---

**"Failed to fetch":**
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify backend URL (no trailing slash)

**Backend 500 errors:**
- Check Render logs
- Verify `DATABASE_URL`
- Test `/health` endpoint

**CORS errors:**
- Verify `FRONTEND_URL` matches Vercel URL exactly
- Ensure both use HTTPS

**Database connection fails:**
- Check database is running
- Verify `DATABASE_URL` format
- Ensure tables are created

---

## 💰 Cost

All services FREE:
- Render PostgreSQL: 1GB storage
- Render Web Service: 750 hours/month
- Vercel: Unlimited deployments

**Note**: Free tier services sleep after 15min inactivity (~30s to wake).

---

## 🎉 Success!

Your app is live! Update your README with the URLs and record a demo video.

**Deployment Complete!** 🚀
