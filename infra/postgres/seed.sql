-- Rental Management System - Local Database Seed & Schema Setup

-- Create Enums if they do not exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') THEN
        CREATE TYPE inventory_status AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'RETIRED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rental_status') THEN
        CREATE TYPE rental_status AS ENUM ('DRAFT', 'CONFIRMED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'RETURN_DUE', 'OVERDUE', 'RETURNED', 'CLOSED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_status') THEN
        CREATE TYPE deposit_status AS ENUM ('NOT_COLLECTED', 'HELD', 'PARTIALLY_DEDUCTED', 'REFUNDED', 'FORFEITED');
    END IF;
END
$$;

-- Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(50),
    size VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_units (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status inventory_status DEFAULT 'AVAILABLE',
    condition TEXT DEFAULT 'Excellent',
    qr_code_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rental_orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    status rental_status DEFAULT 'DRAFT',
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_status payment_status DEFAULT 'PENDING',
    deposit_status deposit_status DEFAULT 'NOT_COLLECTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rental_items (
    id SERIAL PRIMARY KEY,
    rental_order_id INTEGER REFERENCES rental_orders(id) ON DELETE CASCADE,
    inventory_unit_id INTEGER REFERENCES inventory_units(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS deposit_transactions (
    id SERIAL PRIMARY KEY,
    rental_order_id INTEGER REFERENCES rental_orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'HOLD', 'DEDUCTION', 'REFUND', 'FORFEITED'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data (Executes safely only if table is empty)
INSERT INTO users (email, password_hash, name, role)
VALUES 
('admin@rental.com', '$2b$10$wWwA727b1yW782b71yW88.e.p7yD/1wR38b71yW88b71yW88b71yW', 'Super Admin', 'ADMIN'),
('jane.doe@example.com', '$2b$10$wWwA727b1yW782b71yW88.e.p7yD/1wR38b71yW88b71yW88b71yW', 'Jane Doe', 'CUSTOMER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, description, category, base_price)
VALUES
('DeWalt Rotary Hammer Drill', 'Heavy-duty 1-inch SDS Plus rotary hammer drill for concrete masonry.', 'Power Tools', 45.00),
('Yamaha Portable Generator', '2000-Watt gas powered quiet inverter generator.', 'Generators', 65.00),
('Outdoor Extension Cord 50ft', 'Heavy duty water-resistant 10-gauge extension cord.', 'Accessories', 5.00),
('Bosch Laser Distance Measure', '165 feet laser measure with Bluetooth connectivity.', 'Hand Tools', 15.00)
ON CONFLICT DO NOTHING;

-- Let's associate variants to products
INSERT INTO product_variants (product_id, sku, color, size)
SELECT id, 'DEW-HAMMER-YEL', 'Yellow/Black', 'Standard' FROM products WHERE name = 'DeWalt Rotary Hammer Drill'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, color, size)
SELECT id, 'YAM-GEN-2000', 'Blue', '2000W' FROM products WHERE name = 'Yamaha Portable Generator'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, color, size)
SELECT id, 'EXT-CORD-50FT', 'Orange', '50ft' FROM products WHERE name = 'Outdoor Extension Cord 50ft'
ON CONFLICT (sku) DO NOTHING;

-- Let's add inventory units
INSERT INTO inventory_units (variant_id, serial_number, status, condition, qr_code_token)
SELECT id, 'SN-HAMMER-001', 'AVAILABLE', 'Excellent', 'qr-ham-001' FROM product_variants WHERE sku = 'DEW-HAMMER-YEL'
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO inventory_units (variant_id, serial_number, status, condition, qr_code_token)
SELECT id, 'SN-HAMMER-002', 'RENTED', 'Good', 'qr-ham-002' FROM product_variants WHERE sku = 'DEW-HAMMER-YEL'
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO inventory_units (variant_id, serial_number, status, condition, qr_code_token)
SELECT id, 'SN-GEN-001', 'AVAILABLE', 'Excellent', 'qr-gen-001' FROM product_variants WHERE sku = 'YAM-GEN-2000'
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO inventory_units (variant_id, serial_number, status, condition, qr_code_token)
SELECT id, 'SN-GEN-002', 'MAINTENANCE', 'Needs Repair', 'qr-gen-002' FROM product_variants WHERE sku = 'YAM-GEN-2000'
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO inventory_units (variant_id, serial_number, status, condition, qr_code_token)
SELECT id, 'SN-CORD-001', 'AVAILABLE', 'Good', 'qr-cord-001' FROM product_variants WHERE sku = 'EXT-CORD-50FT'
ON CONFLICT (serial_number) DO NOTHING;
