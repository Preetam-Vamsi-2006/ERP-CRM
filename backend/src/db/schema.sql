-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  email VARCHAR(255),
  business_name VARCHAR(255),
  gst_number VARCHAR(50),
  customer_type VARCHAR(50) CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
  address TEXT,
  status VARCHAR(50) CHECK (status IN ('Lead', 'Active', 'Inactive')),
  follow_up_date DATE,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follow-up notes
CREATE TABLE IF NOT EXISTS follow_up_notes (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(255),
  unit_price DECIMAL(12, 2) NOT NULL,
  current_stock INT DEFAULT 0,
  minimum_stock_alert INT DEFAULT 10,
  location_warehouse VARCHAR(255),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock movement log
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id),
  quantity_changed INT NOT NULL,
  movement_type VARCHAR(10) CHECK (movement_type IN ('IN', 'OUT')),
  reason VARCHAR(255),
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challans (sales documents)
CREATE TABLE IF NOT EXISTS challans (
  id SERIAL PRIMARY KEY,
  challan_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id INT NOT NULL REFERENCES customers(id),
  total_quantity INT NOT NULL,
  status VARCHAR(50) CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challan items (line items)
CREATE TABLE IF NOT EXISTS challan_items (
  id SERIAL PRIMARY KEY,
  challan_id INT NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_challans_customer ON challans(customer_id);
CREATE INDEX IF NOT EXISTS idx_challans_status ON challans(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_notes_customer ON follow_up_notes(customer_id);
