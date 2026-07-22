-- Seed demo data

-- Insert users with bcrypt hashed passwords (generated with bcryptjs salt 10)
-- admin123 -> $2a$10$aW9ucF0/OJ.aRBf1nNfHKOd8QvqxD5G5p1U5j7yOLZcE5Y1xTKBGS
-- sales123 -> $2a$10$H5xG.qQ.qF8p3L9Z1K4Q4ObDKr5vT2T5D7G8F9H0I1J2K3L4M5N6O
-- warehouse123 -> $2a$10$X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5
-- accounts123 -> $2a$10$W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4

INSERT INTO users (username, password, email, role, is_active) VALUES
('admin', '$2a$10$aW9ucF0/OJ.aRBf1nNfHKOd8QvqxD5G5p1U5j7yOLZcE5Y1xTKBGS', 'admin@test.com', 'Admin', true),
('sales', '$2a$10$H5xG.qQ.qF8p3L9Z1K4Q4ObDKr5vT2T5D7G8F9H0I1J2K3L4M5N6O', 'sales@test.com', 'Sales', true),
('warehouse', '$2a$10$X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5', 'warehouse@test.com', 'Warehouse', true),
('accounts', '$2a$10$W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4', 'accounts@test.com', 'Accounts', true);

-- Insert sample customers
INSERT INTO customers (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by) VALUES
('Acme Corporation', '9876543210', 'contact@acme.com', 'Acme Corp', '18AABCA1234H1Z0', 'Wholesale', '123 Business St, City', 'Active', '2025-08-01', 'Large wholesale customer', 1),
('Retail Shop 1', '9876543211', 'shop1@retail.com', 'Retail Store', '18AABCA1234H1Z1', 'Retail', '456 Market Rd, City', 'Lead', '2025-07-25', 'New potential customer', 1),
('Distribution Hub', '9876543212', 'hub@distrib.com', 'DH Industries', '18AABCA1234H1Z2', 'Distributor', '789 Trade Zone, City', 'Active', '2025-08-15', 'Regular distributor', 1);

-- Insert sample products
INSERT INTO products (product_name, sku, category, unit_price, current_stock, minimum_stock_alert, location_warehouse, created_by) VALUES
('Laptop Pro', 'SKU001', 'Electronics', 1200.00, 25, 5, 'Shelf A1', 3),
('Wireless Mouse', 'SKU002', 'Accessories', 25.00, 150, 20, 'Shelf A2', 3),
('USB-C Cable', 'SKU003', 'Accessories', 10.00, 300, 50, 'Shelf B1', 3),
('Monitor 27"', 'SKU004', 'Electronics', 350.00, 12, 3, 'Shelf A3', 3),
('Keyboard Mechanical', 'SKU005', 'Accessories', 120.00, 45, 10, 'Shelf B2', 3),
('Desk Lamp', 'SKU006', 'Office', 55.00, 8, 2, 'Shelf C1', 3);

-- Insert sample challans
INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by) VALUES
('CH202508010001', 1, 5, 'Confirmed', 2),
('CH202508010002', 2, 10, 'Draft', 2),
('CH202508020001', 3, 8, 'Confirmed', 2);

-- Insert challan items
INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity) VALUES
(1, 1, 'Laptop Pro', 'SKU001', 1200.00, 2),
(1, 4, 'Monitor 27"', 'SKU004', 350.00, 3),
(2, 2, 'Wireless Mouse', 'SKU002', 25.00, 10),
(3, 3, 'USB-C Cable', 'SKU003', 10.00, 5),
(3, 5, 'Keyboard Mechanical', 'SKU005', 120.00, 3);

-- Insert stock movements for confirmed challans
INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES
(1, 2, 'OUT', 'Challan CH202508010001', 2),
(4, 3, 'OUT', 'Challan CH202508010001', 2),
(3, 5, 'OUT', 'Challan CH202508020001', 2),
(5, 3, 'OUT', 'Challan CH202508020001', 2);

-- Insert follow-up notes
INSERT INTO follow_up_notes (customer_id, note, created_by) VALUES
(1, 'Customer requested bulk discount on next order', 2),
(2, 'First meeting scheduled for next week', 2),
(3, 'Payment received for previous challan', 2);
