# 🚀 Deployment Quick Checklist

## ☑️ Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] Backend and frontend tested locally
- [ ] Render account created
- [ ] Vercel account created

---

## 1️⃣ Database (Render PostgreSQL) - 10 min

- [ ] Render → New + → PostgreSQL
- [ ] Name: `news-pulse-db`, Plan: Free
- [ ] Wait for provisioning
- [ ] Copy **Internal Database URL**
- [ ] Connect via psql and run schema SQL
- [ ] (Optional) Insert sample data
- [ ] Test: `SELECT * FROM clusters;`

✅ Database URL: `postgresql://...`

---

## 2️⃣ Backend (Render Web Service) - 8 min

- [ ] Render → New + → Web Service
- [ ] Connect GitHub repo
- [ ] ⚠️ **Root Directory**: `backend` (CRITICAL - where package.json is)
- [ ] Build: `npm install`, Start: `npm start`
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `10000`
  - [ ] `DATABASE_URL` = *(paste from step 1)*
  - [ ] `FRONTEND_URL` = `https://temporary.com`
- [ ] Create Web Service
- [ ] Wait for deploy
- [ ] Copy backend URL
- [ ] Test: Visit `/health` endpoint

✅ Backend URL: `https://...`

---

## 3️⃣ Frontend (Vercel) - 5 min

- [ ] Vercel → Add New → Project
- [ ] Import GitHub repo
- [ ] Root Directory: `frontend`
- [ ] Add Environment Variable:
  - [ ] `NEXT_PUBLIC_API_URL` = *(paste backend URL)*
- [ ] Click Deploy
- [ ] Wait for build
- [ ] Copy Vercel URL

✅ Frontend URL: `https://...`

---

## 4️⃣ Update CORS - 2 min

- [ ] Go to Render backend dashboard
- [ ] Environment → `FRONTEND_URL`
- [ ] Update to Vercel URL
- [ ] Wait for redeploy

---

## 5️⃣ Test Everything - 5 min

- [ ] Visit Vercel URL
- [ ] Timeline displays ✅
- [ ] Click bar → articles load ✅
- [ ] Toggle filters → updates ✅
- [ ] No console errors ✅

---

## 📝 Update README

- [ ] Add Frontend URL to README
- [ ] Add Backend URL to README
- [ ] Add video walkthrough link

---

## 🎉 Done!

**Total Time**: ~30 minutes

Your News Pulse is LIVE! 🚀

---

## 🆘 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Failed to fetch" | Check `NEXT_PUBLIC_API_URL` in Vercel |
| Backend 500 | Check Render logs, verify `DATABASE_URL` |
| CORS errors | Verify `FRONTEND_URL` matches exactly |
| Cold start slow | Normal for free tier (~30s first load) |

Full guide: See `DEPLOYMENT.md`
