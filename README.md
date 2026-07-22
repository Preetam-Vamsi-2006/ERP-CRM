# Mini ERP/CRM Operations Portal

A full-stack ERP/CRM system for wholesale/distribution companies built with Node.js, React, and PostgreSQL.

## Features

- **Authentication & Authorization**: Role-based access control (Admin, Sales, Warehouse, Accounts)
- **Customer Management**: Add, edit, search customers with follow-up tracking
- **Product Inventory**: Manage products, track stock movements
- **Sales Challans**: Create, confirm, and manage sales challans with stock validation
- **Real-time Stock Updates**: Automatic stock adjustments when confirming challans

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js for REST APIs
- PostgreSQL for database
- JWT for authentication

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Axios for API calls

## Project Structure

```
mini-erp-crm/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.tsx
│   ├── package.json
│   └── index.html
└── README.md
```

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Local Setup

### 1. Database Setup

Create a PostgreSQL database:
```bash
createdb erp_crm
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/erp_crm
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

Initialize database schema:
```bash
psql erp_crm < src/db/schema.sql
```

Create demo users:
```bash
psql erp_crm
```

Run this SQL:
```sql
INSERT INTO users (username, password, email, role, is_active) VALUES
('admin', '$2a$10$...', 'admin@test.com', 'Admin', true),
('sales', '$2a$10$...', 'sales@test.com', 'Sales', true),
('warehouse', '$2a$10$...', 'warehouse@test.com', 'Warehouse', true),
('accounts', '$2a$10$...', 'accounts@test.com', 'Accounts', true);
```

Or use the script to create users with hashed passwords. Start backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Demo Credentials

- **Admin**: admin / admin123
- **Sales**: sales / sales123
- **Warehouse**: warehouse / warehouse123
- **Accounts**: accounts / accounts123

## API Documentation

### Authentication
- `POST /auth/login` - Login with username and password

### Customers
- `GET /customers` - List customers (paginated)
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `POST /customers/:id/follow-up` - Add follow-up note

### Products
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `GET /products/:id/stock-movements` - Get stock history

### Challans
- `GET /challans` - List challans
- `GET /challans/:id` - Get challan details with items
- `POST /challans` - Create new challan
- `POST /challans/:id/confirm` - Confirm draft challan
- `POST /challans/:id/cancel` - Cancel challan

## Deployment

### Backend Deployment (Render, Railway, Fly.io)

1. Create account on Render.com
2. Connect GitHub repository
3. Create new Web Service
4. Environment variables:
   ```
   DATABASE_URL=<your_postgres_url>
   JWT_SECRET=<strong_secret_key>
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=<your_frontend_url>
   ```
5. Build command: `npm install && npm run build`
6. Start command: `npm start`

### Frontend Deployment (Vercel, Netlify)

1. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```
2. Environment variable:
   ```
   VITE_API_URL=<your_backend_url>
   ```

### Database (Supabase, Neon, Render)

1. Create PostgreSQL database on Supabase or Neon
2. Run schema from `backend/src/db/schema.sql`
3. Use connection string in `DATABASE_URL`

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## Business Logic

### Stock Management
- Stock is only reduced when challan is **confirmed**
- Cannot confirm challan if stock is insufficient
- Stock is restored if challan is cancelled from confirmed state
- All stock movements are logged with timestamp and user

### Challan Workflow
1. Sales user creates challan (Draft)
2. Draft challan doesn't affect stock
3. Sales/Accounts confirms challan
4. Stock is deducted and movement logged
5. Challan can be cancelled (returns stock if confirmed)

### Role Permissions
- **Admin**: Full access to all modules
- **Sales**: Create/view customers and challans
- **Warehouse**: Manage products and inventory
- **Accounts**: View challans and stock reports

## Known Limitations

- PDF export not yet implemented (bonus feature)
- AWS S3 image upload not implemented (bonus feature)
- No email notifications
- Limited reporting features
- UI is basic (not production-grade design)

## Error Handling

- All API endpoints return proper HTTP status codes
- Validation errors include field-level details
- Database errors are logged with correlation IDs
- Frontend shows user-friendly error messages

## Future Enhancements

- Invoice generation and PDF export
- Product images with AWS S3 storage
- Email notifications for follow-ups
- Advanced reporting and analytics
- Mobile app
- Real-time updates with WebSocket
- Batch operations
- Import/export features

## Support

For issues or questions, refer to the inline code comments and API documentation above.
