# Supabase Deployment Guide

## 🚀 Quick Overview

Supabase is a Firebase alternative with PostgreSQL as the backbone. It's perfect for your ERP/CRM because:
- ✅ Free tier with 500MB storage
- ✅ Real PostgreSQL (not locked-in)
- ✅ Built-in auth (optional, we're using custom)
- ✅ Easy migration path
- ✅ Simple connection string

---

## 📝 Step-by-Step Deployment

### Step 1: Create Supabase Account & Project

1. **Visit** https://supabase.com
2. **Sign up** with GitHub (recommended for easy OAuth)
3. **Create organization** with any name
4. **Create new project**:
   - Project name: `erp-crm`
   - Database password: Create a strong one (e.g., `Sup@base2024!Secure`)
   - Region: Choose closest to you
   - Click "Create new project"
   - ⏳ Wait 2-3 minutes for database to initialize

### Step 2: Get Your Database Connection String

1. **Go to Project Settings**:
   - Click gear icon ⚙️ top right
   - Select "Settings" from dropdown

2. **Navigate to Database**:
   - Left sidebar → "Configuration" → "Database"

3. **Find Connection String**:
   - Look for "Connection string" section
   - Select "URI" tab
   - Copy the connection string (starts with `postgresql://`)
   - Keep it safe - it has your password!

   **Format**: `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

---

### Step 3: Load Database Schema

You have **3 options** to load your schema:

#### **Option A: Using Supabase SQL Editor (Easiest)**

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy-paste the entire content from `backend/src/db/schema.sql`
4. Click **Run**
5. ✅ Schema created!
6. Repeat with `backend/seed.sql` to load demo data

#### **Option B: Using psql (Command Line)**

Replace `[CONNECTION_STRING]` with your actual connection string:

```bash
"C:\Program Files\PostgreSQL\18\bin\psql" "[CONNECTION_STRING]" -f backend/src/db/schema.sql
"C:\Program Files\PostgreSQL\18\bin\psql" "[CONNECTION_STRING]" -f backend/seed.sql
```

#### **Option C: Direct Connection in pgAdmin**

1. Open pgAdmin
2. Create new server connection:
   - Host: `db.[PROJECT-ID].supabase.co`
   - Port: `5432`
   - Username: `postgres`
   - Password: Your Supabase database password
3. Create new database
4. Use Query Tool to run schema and seed files

---

### Step 4: Update Backend Environment Variables

Update your `backend/.env` file:

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=your_strong_secret_key_minimum_32_chars
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-url.com
```

**Replace:**
- `[YOUR_PASSWORD]` - The password you created for Supabase
- `[PROJECT-ID]` - Your Supabase project ID (from connection string)
- `https://your-frontend-url.com` - Your Vercel/Netlify frontend URL (set this after frontend deployment)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Supabase deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. **Visit** https://vercel.com
2. **Sign in** with GitHub
3. **Import Project**:
   - Click "Add New" → "Project"
   - Select your repository
   - Framework Preset: `Other`
   - Root Directory: `frontend`

4. **Environment Variables**:
   - Add `VITE_API_URL` = Your backend URL (from Render, see below)

5. **Deploy** - Click "Deploy"

6. **Copy Vercel URL** (will be like `https://erp-crm-xyz.vercel.app`)

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Account

1. Visit https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click **New +** → **Web Service**
2. **Connect Repository**:
   - Select your GitHub repo
   - Allow Render access to your repo

3. **Configure Service**:
   - **Name**: `erp-crm-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Region**: Choose nearest

4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require
   JWT_SECRET=your_strong_secret_key_minimum_32_chars
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-frontend-url.com
   PORT=10000
   ```

5. **Pricing Plan**: Select "Free" (scroll down)

6. Click **Create Web Service**

7. ⏳ Wait 5-10 minutes for deployment

8. **Copy Backend URL** (will be like `https://erp-crm-backend.onrender.com`)

---

## 🔄 Update Frontend with Backend URL

After Render deployment:

1. Go to **Vercel Dashboard**
2. Select your frontend project
3. **Settings** → **Environment Variables**
4. **Edit** `VITE_API_URL`:
   - Set to: `https://erp-crm-backend.onrender.com`
5. **Redeploy** (Vercel → Deployments → Select latest → Redeploy)

---

## ✅ Verify Deployment

### Test Backend

```bash
# Test API is running
curl https://erp-crm-backend.onrender.com/health

# Test login (should work with demo credentials)
curl -X POST https://erp-crm-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try logging in with:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Navigate through app - should work perfectly!

---

## 📊 Costs (All Free!)

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Supabase Database** | 500MB storage, 2GB bandwidth | $0 |
| **Render Backend** | 0.5GB RAM, 100GB bandwidth | $0 |
| **Vercel Frontend** | Unlimited bandwidth | $0 |
| **Total Monthly** | | **$0** |

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed `JWT_SECRET` to a strong random value (32+ chars)
- [ ] All environment variables set correctly in Render
- [ ] `CORS_ORIGIN` is set to your frontend URL
- [ ] Database password is strong
- [ ] `.env` file is in `.gitignore` (it is!)
- [ ] No secrets in GitHub repository

---

## 🆘 Troubleshooting

### "Connection refused" error

**Cause**: Backend can't connect to Supabase database

**Solution**:
1. Verify `DATABASE_URL` in Render environment variables
2. Add `?sslmode=require` to connection string
3. Check if Supabase database is running
4. Verify database password is correct

### "Invalid credentials" on login

**Cause**: Demo data not loaded

**Solution**:
1. Load `backend/seed.sql` into Supabase (Step 3 above)
2. Try login with `admin` / `admin123`

### Frontend showing "API Error"

**Cause**: `VITE_API_URL` pointing to wrong backend

**Solution**:
1. Check Vercel environment variable `VITE_API_URL`
2. Should match your Render backend URL
3. Redeploy frontend after changing

### Very slow database queries

**Cause**: Free tier limitations

**Solution**:
- Switch to paid tier ($12/month)
- Or optimize queries
- Or use Supabase Pro ($25/month)

---

## 📱 Live Demo Credentials

After deployment, users can login with:

```
Admin Account:
  Username: admin
  Password: admin123

Sales Account:
  Username: sales
  Password: sales123

Warehouse Account:
  Username: warehouse
  Password: warehouse123

Accounts Account:
  Username: accounts
  Password: accounts123
```

---

## 🎯 What's Next?

1. ✅ Create Supabase project
2. ✅ Load schema and seed data
3. ✅ Deploy backend on Render
4. ✅ Deploy frontend on Vercel
5. ✅ Test live application
6. 📧 Share URL with stakeholders
7. 🚀 Go live!

---

## 📞 Support Links

- **Supabase Docs**: https://supabase.com/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

