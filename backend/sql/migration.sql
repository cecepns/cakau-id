-- =====================================================
-- Migration File: Cakau ID E-Commerce System
-- Description: Skema database lengkap dengan index optimasi
-- =====================================================

CREATE DATABASE IF NOT EXISTS cakau_id CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cakau_id;

-- 1. Tabel Users (Admin, Seller, Courier, Buyer)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('admin','seller','courier','buyer') NOT NULL,
  status ENUM('active','blocked','pending') NOT NULL DEFAULT 'active',
  balance DECIMAL(15,0) NOT NULL DEFAULT 0,
  store_name VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB;

-- 2. Tabel Settings (fee_percent, price_per_km, contact info)
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO settings (`key`,`value`) VALUES
  ('fee_percent','5'),
  ('price_per_km','3000'),
  ('contact_email', 'support@cakau.id'),
  ('contact_phone', '081234567890'),
  ('contact_address', 'Jl. Jenderal Sudirman No. 10, Jakarta Pusat 10220');

-- 3. Tabel Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  price DECIMAL(15,0) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  description MEDIUMTEXT NULL,
  images JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_products_seller (seller_id),
  INDEX idx_products_stock (stock)
) ENGINE=InnoDB;

-- 4. Tabel Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  courier_id INT NULL,
  status ENUM('pending','processing','ready','shipping','delivered','completed','cancelled') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(15,0) NOT NULL,
  fee DECIMAL(15,0) NOT NULL,
  shipping_cost DECIMAL(15,0) NOT NULL,
  total DECIMAL(15,0) NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL,
  address VARCHAR(255) NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  note VARCHAR(255) NULL,
  proof VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (courier_id) REFERENCES users(id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_buyer (buyer_id),
  INDEX idx_orders_seller (seller_id),
  INDEX idx_orders_courier (courier_id)
) ENGINE=InnoDB;

-- 5. Tabel Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  name VARCHAR(160) NOT NULL,
  price DECIMAL(15,0) NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- 6. Tabel Rekening Topup
CREATE TABLE IF NOT EXISTS topup_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('bank','qris') NOT NULL,
  name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NULL,
  account_holder VARCHAR(100) NULL,
  image VARCHAR(255) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_topup_accounts_active (active)
) ENGINE=InnoDB;

-- 7. Tabel Permintaan Topup
CREATE TABLE IF NOT EXISTS topups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_id INT NULL,
  amount DECIMAL(15,0) NOT NULL,
  proof VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_topups_user (user_id),
  INDEX idx_topups_status (status)
) ENGINE=InnoDB;

-- 8. Tabel Permintaan Penarikan (Withdrawals)
CREATE TABLE IF NOT EXISTS withdrawals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  bank_name VARCHAR(80) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(100) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_withdrawals_user (user_id),
  INDEX idx_withdrawals_status (status)
) ENGINE=InnoDB;
