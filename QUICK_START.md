# Quick Start Guide (5 minutes)

## Using Docker (Easiest)

```bash
# 1. Ensure Docker is running
# 2. Clone and navigate to project
cd MiniERP

# 3. Start everything
docker-compose up

# 4. Wait for services to start (2-3 minutes)
# Backend will be at http://localhost:5000
# Frontend will be at http://localhost:3000

# 5. Open browser
# http://localhost:3000
```

## Manual Setup (Linux/Mac)

### Prerequisites
```bash
# Check versions
node --version  # v16+
npm --version   # v8+
psql --version  # 12+
```

### 1. Database Setup
```bash
# Create database
createdb erp_crm

# Load schema and seed data
psql erp_crm < backend/src/db/schema.sql
psql erp_crm < backend/seed.sql
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env - update DATABASE_URL if needed
# Default: postgresql://postgres:password@localhost:5432/erp_crm

# Start server
npm run dev
```

### 3. Frontend Setup (new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Copy .env
cp .env.example .env

# Start app
npm run dev
```

### 4. Access Application
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
```

## Windows Setup

### 1. Install PostgreSQL
- Download from https://www.postgresql.org/download/windows/
- Note username (default: postgres) and password

### 2. Create Database (PowerShell)
```powershell
# Using psql
psql -U postgres -c "CREATE DATABASE erp_crm;"

# Load schema
psql -U postgres -d erp_crm -f backend/src/db/schema.sql

# Load seed data
psql -U postgres -d erp_crm -f backend/seed.sql
```

### 3. Backend (.env)
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/erp_crm
JWT_SECRET=test_secret_change_in_prod
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Demo Credentials

After starting the app, use these to login:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sales | sales123 |
| Warehouse | warehouse | warehouse123 |
| Accounts | accounts | accounts123 |

## What Each Role Can Do

### Admin
- ✅ All features
- ✅ Manage all users
- ✅ View all reports

### Sales
- ✅ Create/edit customers
- ✅ Create challans
- ✅ View follow-ups
- ❌ Manage products
- ❌ Confirm challans

### Warehouse
- ✅ Create/edit products
- ✅ Track stock
- ✅ View stock movements
- ❌ Create challans
- ❌ Manage customers

### Accounts
- ✅ View all challans
- ✅ Confirm challans
- ✅ View customer history
- ❌ Create challans
- ❌ Modify data

## Test Workflows

### 1. Create a Sale (Sales Role)
1. Login as `sales`
2. Go to Customers
3. Click "Add Customer" (if needed)
4. Go to Challans → "Create Challan"
5. Select customer
6. Add products with quantities
7. Save as Draft or Confirm

### 2. Confirm Sale (Accounts Role)
1. Login as `accounts`
2. Go to Challans
3. Find draft challan
4. Click "View"
5. Click "Confirm Challan"
6. Check stock reduced

### 3. Manage Inventory (Warehouse Role)
1. Login as `warehouse`
2. Go to Products
3. Click "Add Product"
4. Enter details
5. View stock and movements

### 4. Customer Tracking (Sales Role)
1. Login as `sales`
2. Go to Customers
3. Click on customer
4. Add follow-up notes
5. Set follow-up date

## Troubleshooting

### Backend won't start
```bash
# Check port 5000 not in use
lsof -i :5000

# Check database connection
psql $DATABASE_URL

# Check schema loaded
psql -d erp_crm -c "\dt"
```

### Frontend won't load
```bash
# Check port 3000 not in use
lsof -i :3000

# Check API URL in .env
cat frontend/.env

# Clear cache
rm -rf frontend/node_modules/.vite
```

### Database connection error
```bash
# Test connection
psql postgresql://user:password@localhost:5432/erp_crm

# Reset password
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword';"
```

### CORS Error in Console
```bash
# Check CORS_ORIGIN in backend .env
# Should be http://localhost:3000 (development)

# Restart backend after changing
```

## File Structure Reference

```
MiniERP/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── db/          # Database setup
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth, errors
│   │   └── index.ts     # Main app
│   ├── package.json
│   ├── .env.example
│   └── seed.sql         # Demo data
│
├── frontend/            # React app
│   ├── src/
│   │   ├── api/        # API calls
│   │   ├── pages/      # Page components
│   │   ├── components/ # Shared components
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml  # Run everything
├── README.md           # Full documentation
├── DEPLOYMENT.md       # Deploy to production
└── ARCHITECTURE.md     # System design
```

## Next Steps

1. **Explore the UI** - Click around, understand features
2. **Test all roles** - See permissions in action
3. **Create test data** - Add customers, products, challans
4. **Try workflows** - Create and confirm sales
5. **Check database** - Verify stock movements logged
6. **Deploy** - Follow DEPLOYMENT.md when ready

## API Testing with Curl

```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy token from response, then:

# List customers
curl http://localhost:5000/customers \
  -H "Authorization: Bearer <TOKEN>"

# Create customer
curl -X POST http://localhost:5000/customers \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name":"Test Co",
    "email":"test@test.com",
    "mobile_number":"9999999999",
    "customer_type":"Retail",
    "status":"Lead"
  }'
```

## Common Tasks

### Reset Database
```bash
dropdb erp_crm
createdb erp_crm
psql erp_crm < backend/src/db/schema.sql
psql erp_crm < backend/seed.sql
```

### Add New User
```sql
INSERT INTO users (username, password, email, role, is_active) 
VALUES ('newuser', '$2a$10$hash', 'email@test.com', 'Sales', true);
```

### Check Stock for Product ID 1
```sql
SELECT * FROM products WHERE id = 1;
SELECT * FROM stock_movements WHERE product_id = 1;
```

### View All Confirmations by User
```sql
SELECT c.challan_number, u.username, c.created_at 
FROM challans c 
JOIN users u ON c.created_by = u.id 
WHERE c.status = 'Confirmed';
```

## Support

- **Docs**: See README.md, DEPLOYMENT.md, ARCHITECTURE.md
- **API Docs**: See POSTMAN_COLLECTION.json
- **Issues**: Check code comments and error messages
- **Questions**: Review inline documentation

---

**You're ready to go!** 🚀
