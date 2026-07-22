# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA (TypeScript)                                  │   │
│  │  - Login, Dashboard, Customers, Products, Challans      │   │
│  │  - Responsive UI with CSS Grid/Flexbox                  │   │
│  │  - Axios HTTP Client with JWT Auth                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js Server (TypeScript)                          │   │
│  │  - CORS Middleware                                       │   │
│  │  - JWT Authentication Middleware                         │   │
│  │  - Error Handling Middleware                             │   │
│  │  - Request Logging                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Auth   │      │Customer│      │Product │
    │Route   │      │Route   │      │Route   │
    └───┬────┘      └───┬────┘      └───┬────┘
        │               │               │
        └───────┬───────┴───────┬───────┘
                ↓               ↓
        ┌─────────────┐  ┌────────────────┐
        │  Business   │  │   Validation   │
        │   Logic     │  │  & Sanitization│
        └──────┬──────┘  └────────────────┘
               │
               ↓
        ┌──────────────────┐
        │  Database Layer  │
        │  - pg (Node.js)  │
        │  - Connection    │
        │    Pooling       │
        └────────┬─────────┘
                 │
                 ↓
        ┌──────────────────┐
        │   PostgreSQL     │
        │   Database       │
        │                  │
        │  - Users         │
        │  - Customers     │
        │  - Products      │
        │  - Challans      │
        │  - Stock Logs    │
        └──────────────────┘
```

## Database Schema

### Tables

**Users**
- id (PK)
- username (unique)
- password (hashed)
- email (unique)
- role (enum)
- is_active
- created_at, updated_at

**Customers**
- id (PK)
- customer_name
- mobile_number
- email
- business_name
- gst_number
- customer_type
- address
- status
- follow_up_date
- notes
- created_by (FK → users)
- created_at, updated_at

**Follow_up_notes**
- id (PK)
- customer_id (FK)
- note
- created_by (FK)
- created_at

**Products**
- id (PK)
- product_name
- sku (unique)
- category
- unit_price
- current_stock
- minimum_stock_alert
- location_warehouse
- created_by (FK)
- created_at, updated_at

**Stock_movements**
- id (PK)
- product_id (FK)
- quantity_changed
- movement_type (IN/OUT)
- reason
- created_by (FK)
- created_at

**Challans**
- id (PK)
- challan_number (unique)
- customer_id (FK)
- total_quantity
- status (Draft/Confirmed/Cancelled)
- created_by (FK)
- created_at, updated_at

**Challan_items**
- id (PK)
- challan_id (FK)
- product_id (FK)
- product_name (snapshot)
- sku (snapshot)
- unit_price (snapshot)
- quantity
- created_at

## API Routes

### Authentication
- `POST /auth/login` - User login

### Customers (Protected)
- `GET /customers` - List with pagination/search
- `GET /customers/:id` - Detail with follow-ups
- `POST /customers` - Create (Sales, Admin)
- `PUT /customers/:id` - Update (Sales, Admin)
- `POST /customers/:id/follow-up` - Add note (Sales, Admin)

### Products (Protected)
- `GET /products` - List with pagination/search
- `GET /products/:id` - Detail
- `POST /products` - Create (Warehouse, Admin)
- `PUT /products/:id` - Update (Warehouse, Admin)
- `GET /products/:id/stock-movements` - Stock history

### Challans (Protected)
- `GET /challans` - List with filter
- `GET /challans/:id` - Detail with items
- `POST /challans` - Create (Sales)
- `POST /challans/:id/confirm` - Confirm (Sales, Accounts)
- `POST /challans/:id/cancel` - Cancel (Sales, Admin)

## Frontend Structure

```
src/
├── api/
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.ts             # Auth API calls
│   ├── customers.ts        # Customer API calls
│   ├── products.ts         # Product API calls
│   └── challans.ts         # Challan API calls
├── components/
│   ├── Layout.tsx          # Main layout wrapper
│   └── Layout.css
├── pages/
│   ├── Login.tsx           # Login page
│   ├── Dashboard.tsx       # Stats & quick actions
│   ├── Customers.tsx       # List customers
│   ├── CustomerDetail.tsx  # Customer detail & edit
│   ├── Products.tsx        # List products
│   ├── Challans.tsx        # List challans
│   ├── ChallanForm.tsx     # Create challan
│   ├── ChallanDetail.tsx   # Challan detail
│   └── *.css               # Component styles
├── App.tsx                 # Router setup
├── App.css
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Backend Structure

```
src/
├── db/
│   ├── connection.ts       # Pool & query wrapper
│   └── schema.sql          # Database schema
├── middleware/
│   ├── auth.ts             # JWT & role middleware
│   └── errorHandler.ts     # Error handling
├── routes/
│   ├── auth.ts             # Auth endpoints
│   ├── customers.ts        # Customer endpoints
│   ├── products.ts         # Product endpoints
│   └── challans.ts         # Challan endpoints
├── utils/
│   └── auth.ts             # JWT & bcrypt utils
└── index.ts                # Express app setup
```

## Key Features Implementation

### Authentication Flow

1. User submits credentials
2. Backend validates against hashed password
3. JWT token generated (24h expiry)
4. Token stored in localStorage
5. Token sent in Authorization header
6. Middleware validates token on each request
7. Token refresh on 401 response

### Stock Management

1. Challan created as Draft (no stock impact)
2. Challan confirmed → stock checked
3. If stock insufficient → error returned
4. If sufficient → stock deducted in transaction
5. Stock movement logged with timestamp
6. If challan cancelled → stock restored

### Transaction Handling

- Database transactions for multi-table operations
- Rollback on any failure
- Atomic stock updates
- Prevents race conditions

## Security Measures

### Authentication
- JWT with 24h expiration
- Bcrypt password hashing (salt 10)
- HTTP-only cookie support ready

### Authorization
- Role-based middleware
- Per-endpoint permission checks
- Admin override capability

### Data Validation
- Joi schema validation
- Input sanitization
- SQL injection prevention via parameterized queries

### API Security
- CORS configured
- Rate limiting ready
- Error messages don't leak internals
- Sensitive data not logged

## Performance Optimizations

### Database
- Connection pooling
- Indexes on foreign keys
- Indexes on search columns
- Query logging for monitoring

### API
- Pagination for large datasets
- Search/filter support
- Lazy loading on frontend
- Caching ready (Redis)

### Frontend
- Code splitting via React Router
- CSS modules (optional)
- Image optimization ready
- Build optimization with Vite

## Scalability Considerations

### Horizontal
- Stateless backend (JWT based)
- Database connection pooling
- Load balancer ready
- Session affinity not needed

### Vertical
- Optimized queries
- Proper indexing
- Connection pool tuning
- Cache layer ready

### Database
- Partitioning ready
- Read replicas possible
- Query optimization
- Index strategy

## Error Handling

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation)
- 401: Unauthorized
- 403: Forbidden (role)
- 404: Not Found
- 500: Server Error

### Error Responses
```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "fieldname",
      "message": "error detail"
    }
  ]
}
```

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (npm run dev) → http://localhost:3000
├── Backend (npm run dev) → http://localhost:5000
└── PostgreSQL (local) → localhost:5432
```

### Production (Free Tier)
```
Frontend Hosting (Vercel/Netlify)
    ↓ HTTPS
API Server (Render/Railway)
    ↓ Internal
PostgreSQL (Supabase/Neon/Render)
```

## Monitoring & Logging

### What to Monitor
- API response times
- Database query times
- Error rates
- Stock accuracy
- User authentication

### Logging Strategy
- Structured JSON logs
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs for tracing
- Sensitive data masking

## Testing Strategy

### Unit Tests (Ready to add)
- Authentication logic
- Validation schemas
- Business logic

### Integration Tests (Ready to add)
- API endpoints
- Database operations
- Transaction handling

### Manual Testing
- Postman collection provided
- Test scenarios documented
- Demo data included

## Assumptions & Decisions

1. **Single Admin Database**: No multi-tenancy
2. **UTC Timestamps**: All times in UTC
3. **Immediate Stock Update**: No pending approvals
4. **English Language**: UI and data in English
5. **No File Uploads**: Product images not implemented
6. **Simple Pricing**: No tax/discount logic
7. **Email Notifications**: Not implemented
8. **Two-Factor Auth**: Not implemented
9. **Audit Logs**: Stock movements are audit trail
10. **No Data Encryption**: TLS/HTTPS is encryption

## Future Enhancements

1. **Invoicing**: Generate PDF invoices
2. **Email**: Challan notifications
3. **Analytics**: Sales reports, trends
4. **Mobile App**: React Native version
5. **Real-time**: WebSocket updates
6. **Payments**: Online payment integration
7. **Webhooks**: Third-party integrations
8. **Audit**: Complete audit logging
9. **Backup**: Automated backups
10. **Disaster Recovery**: Data replication
