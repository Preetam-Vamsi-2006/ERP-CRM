# Deployment Guide

## Prerequisites

- GitHub account
- Credit card for free tier services (optional, will not be charged for free plans)
- Domain name (optional)

## Backend Deployment

### Option 1: Render.com

1. **Create Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New +
   - PostgreSQL
   - Name: erp-crm-db
   - Database: erp_crm
   - User: erp_user
   - Region: Choose nearest
   - Pricing Plan: Free

3. **Create Web Service**
   - New +
   - Web Service
   - Connect GitHub repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instances: 1
   - Environment Variables:
     ```
     DATABASE_URL=<postgresql_connection_string_from_database>
     JWT_SECRET=<generate_strong_secret>
     NODE_ENV=production
     PORT=10000
     CORS_ORIGIN=<your_frontend_url>
     ```

4. **Run Migrations**
   - SSH into the service
   - Run: `psql $DATABASE_URL < schema.sql`
   - Run: `psql $DATABASE_URL < seed.sql`

### Option 2: Railway.app

1. **Create Account**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create Project**
   - New Project
   - Deploy from GitHub repo

3. **Add PostgreSQL Plugin**
   - Add Plugin
   - PostgreSQL

4. **Set Environment Variables**
   - Reference database variables and set others

5. **Deploy**
   - Automatic deployment from main branch

### Option 3: Fly.io

```bash
brew install flyctl  # or apt-get install flyctl

flyctl auth login

flyctl launch
# Follow prompts to create app

flyctl postgres create
# Create attached database

flyctl deploy
```

## Frontend Deployment

### Option 1: Vercel

1. **Create Account**
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Deploy**
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=<your_backend_url>
   ```

4. **Configure**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option 2: Netlify

1. **Connect GitHub**
   - New site from Git
   - Select repository

2. **Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=<your_backend_url>
   ```

### Option 3: Cloudflare Pages

```bash
npm install -g wrangler

cd frontend
wrangler pages create erp-crm

# Deploy
wrangler pages deploy dist
```

## Database Deployment

### Option 1: Supabase

1. Visit https://supabase.com
2. Create new project
3. Go to SQL editor
4. Run schema.sql
5. Run seed.sql
6. Get connection string from Settings → Database

### Option 2: Neon

1. Visit https://neon.tech
2. Create project
3. Copy connection string
4. Run migrations

### Option 3: Render PostgreSQL

Included with Render backend deployment (see above)

## Domain Setup

### Connect Custom Domain

**Vercel:**
- Settings → Domains
- Add domain
- Update DNS records with Vercel's nameservers

**Render:**
- Settings → Custom Domain
- Add domain
- Add DNS record

**Netlify:**
- Settings → Domain Management
- Add custom domain
- Follow DNS setup

## SSL/TLS Certificates

All major platforms provide free SSL:
- Vercel: Automatic
- Render: Automatic
- Netlify: Automatic
- Fly.io: Automatic
- Railway: Automatic

## Environment Variables Setup

### Backend

Required:
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_strong_secret_key_minimum_32_chars
NODE_ENV=production
PORT=<provided_by_platform>
CORS_ORIGIN=https://your-frontend-url.com
```

### Frontend

Required:
```
VITE_API_URL=https://your-backend-url.com
```

## Database Initialization

After deployment:

```bash
# SSH into backend or use platform's terminal
psql $DATABASE_URL < backend/src/db/schema.sql
psql $DATABASE_URL < backend/seed.sql
```

Or create initial admin user:

```sql
INSERT INTO users (username, password, email, role, is_active) VALUES
('admin', '$2a$10$...', 'admin@test.com', 'Admin', true);
```

## Monitoring

### Logs

**Render:** Dashboard → Logs
**Railway:** Deployments → View Logs
**Vercel:** Deployments → Function Logs
**Netlify:** Deploys → Logs

### Performance

- Monitor response times
- Check error rates
- Set up alerts for downtime

### Database

- Monitor connection count
- Check query performance
- Review disk usage

## Scaling

### Horizontal Scaling

- Add more instances (paid feature)
- Use load balancer

### Vertical Scaling

- Increase instance size
- Increase database resources

### Caching

- Add Redis (optional)
- Enable CDN for frontend

## Backup

### Database Backups

Most platforms provide automatic daily backups.

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup.sql
```

### Code Backup

Using GitHub is your backup:
```bash
git clone <your-repo-url>
```

## Troubleshooting

### Database Connection Failed

1. Check DATABASE_URL format
2. Verify IP whitelist
3. Test connection: `psql $DATABASE_URL`

### Frontend Not Loading

1. Check VITE_API_URL
2. Verify CORS settings
3. Check browser console for errors

### API Returning 500

1. Check backend logs
2. Verify database connection
3. Check environment variables

### Build Failures

1. Check build logs
2. Verify Node.js version
3. Ensure all dependencies installed

## Cost Estimation

Using free tiers:
- **Backend**: Render ($0, 0.5GB RAM)
- **Frontend**: Vercel ($0, unlimited bandwidth)
- **Database**: Supabase/Render ($0, 500MB)
- **Total**: $0/month

Paid upgrades:
- Backend: $7/month (full container)
- Database: $12/month (1GB)
- Frontend: $20/month (Pro)

## Security Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Enable HTTPS/TLS (automatic)
- [ ] Set proper CORS_ORIGIN
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Regular security updates
- [ ] Database connection from app only

## Continuous Deployment

### GitHub Actions

Commits to main → Automatic deployment

Setup:
1. Add .github/workflows/deploy.yml
2. Add repository secrets
3. Enable Actions

Example in repository root.

## Support & Resources

- Render Docs: https://render.com/docs
- Railway Docs: https://railway.app/docs
- Vercel Docs: https://vercel.com/docs
- PostgreSQL Docs: https://postgresql.org/docs
- Node.js Best Practices: https://nodejs.org/en/docs/guides/
