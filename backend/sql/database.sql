CREATE DATABASE IF NOT EXISTS cakau_id CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cakau_id;

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
  operational_hours VARCHAR(100) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (`id`, `name`, `slug`) VALUES
  (1, 'Makanan / Jajanan', 'makanan-jajanan'),
  (2, 'UMKM', 'umkm'),
  (3, 'Barang Baru', 'barang-baru'),
  (4, 'Barang Bekas', 'barang-bekas'),
  (5, 'Lainnya', 'lainnya');

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT NULL,
  name VARCHAR(160) NOT NULL,
  price DECIMAL(15,0) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  operational_hours VARCHAR(100) NULL,
  description MEDIUMTEXT NULL,
  images JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_products_seller (seller_id),
  INDEX idx_products_category (category_id),
  INDEX idx_products_stock (stock)
) ENGINE=InnoDB;

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
  is_paid TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (courier_id) REFERENCES users(id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_buyer (buyer_id),
  INDEX idx_orders_seller (seller_id),
  INDEX idx_orders_courier (courier_id)
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  last_message TEXT NULL,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  unread_buyer INT DEFAULT 0,
  unread_seller INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_buyer_seller (buyer_id, seller_id),
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversations_buyer (buyer_id),
  INDEX idx_conversations_seller (seller_id),
  INDEX idx_conversations_last_at (last_message_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  product_id INT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_chat_messages_conv (conversation_id),
  INDEX idx_chat_messages_sender (sender_id),
  INDEX idx_chat_messages_receiver (receiver_id),
  INDEX idx_chat_messages_created (created_at)
) ENGINE=InnoDB;

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

-- =====================================================
-- Sample Data & Seed (Password: password123)
-- =====================================================

-- Rekening topup
INSERT INTO topup_accounts (type,name,account_number,account_holder,active)
VALUES ('bank','BCA (Bank Central Asia)','1234567890','Cakau ID Official',1),
       ('bank','Bank Mandiri','1370019283746','Cakau ID Official',1)
ON DUPLICATE KEY UPDATE account_holder=VALUES(account_holder);

-- Sample Users
INSERT INTO users (name, email, password, phone, role, status, balance, store_name, address, lat, lng)
VALUES
  ('Admin', 'admin@cakau.id', '$2a$10$O3QWjI/vdQ2r8/x/pSjHxeZqR4/Kj593Vv7oY/tK1jM6Y5G1G3h2y', '6281234567890', 'admin', 'active', 0, NULL, NULL, NULL, NULL),
  ('Budi Santoso', 'seller@cakau.id', '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S', '081298765432', 'seller', 'active', 0, 'Nusantara Artisan Goods', 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan', -6.2297465, 106.8074932),
  ('Siti Rahmawati', 'buyer@cakau.id', '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S', '081211112222', 'buyer', 'active', 750000, NULL, 'Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan', -6.2608120, 106.8143200),
  ('Ahmad Kurniawan', 'kurir@cakau.id', '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S', '081233334444', 'courier', 'active', 0, NULL, 'Jl. Fatmawati Raya No. 8, Cilandak, Jakarta Selatan', -6.2912400, 106.7975400),
  ('Rian Saputra', 'kurir.pending@cakau.id', '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S', '081255556666', 'courier', 'pending', 0, NULL, 'Jl. Tebet Barat Dalam No. 15, Jakarta Selatan', -6.2384100, 106.8523900)
ON DUPLICATE KEY UPDATE phone=VALUES(phone);

-- Sample Products
SET @seller_id = (SELECT id FROM users WHERE email='seller@cakau.id' LIMIT 1);

INSERT INTO products (seller_id, name, price, stock, description, images)
SELECT @seller_id, 'Kopi Arabika Sumatra Gayo 250g (Specialty Grade)', 85000, 35, '<p><strong>Kopi Arabika Sumatra Gayo</strong> dipetik langsung dari dataran tinggi Takengon, Aceh Tengah pada ketinggian 1.400 mdpl. Diproses dengan metode semi-washed yang menghasilkan body tebal, aroma rempah khas, dan aftertaste cokelat hitam yang memikat.</p><ul><li>Tingkat Sangrai: Medium to Dark</li><li>Profil Rasa: Dark Chocolate, Spices, Brown Sugar</li><li>Berat Bersih: 250 gram</li></ul><p>Sangat cocok untuk metode seduh manual (V60, French Press) maupun mesin espresso rumah.</p>', '["/uploads/seed-coffee.jpg"]'
WHERE @seller_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM products WHERE name LIKE 'Kopi Arabika Sumatra Gayo%');

INSERT INTO products (seller_id, name, price, stock, description, images)
SELECT @seller_id, 'Dompet Pria Kulit Asli Handmade (Crazy Horse Leather)', 175000, 20, '<p>Dompet pria bergaya minimalis klasik dibuat menggunakan 100% <strong>kulit sapi asli jenis Crazy Horse</strong>. Jahitan tangan kokoh dengan benang wax berkualitas tinggi menghasilkan daya tahan bertahun-tahun serta karakter patina yang semakin indah seiring waktu.</p><ul><li>6 Slot Kartu ATM / KTP</li><li>2 Kompartemen Uang Kertas Utama</li><li>Dimensi: 11.5 cm x 9.5 cm</li></ul>', '["/uploads/seed-wallet.jpg"]'
WHERE @seller_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM products WHERE name LIKE 'Dompet Pria Kulit Asli%');

INSERT INTO products (seller_id, name, price, stock, description, images)
SELECT @seller_id, 'Tote Bag Kanvas Premium Studio & Co (Water Repellent)', 95000, 45, '<p>Tas jinjing kanvas tebal 14oz premium dengan lapisan anti cipratan air (water-repellent). Desain monokrom estetis yang cocok untuk aktivitas kuliah, kerja, maupun jalan santai akhir pekan.</p><ul><li>Bahan: Kanvas Katun Tebal 14oz</li><li>Penutup: Resleting YKK Premium</li><li>Dilengkapi saku dalam untuk dompet & smartphone</li><li>Muat laptop hingga ukuran 15.6 inch</li></ul>', '["/uploads/seed-tote.jpg"]'
WHERE @seller_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM products WHERE name LIKE 'Tote Bag Kanvas%');

INSERT INTO products (seller_id, name, price, stock, description, images)
SELECT @seller_id, 'Mug Keramik Artisan Handmade (Speckled Terracotta 350ml)', 68000, 25, '<p>Mug keramik buatan tangan pengrajin lokal dengan sentuhan glasir bintik alami (speckled) dan aksen tanah liat terracotta. Nyaman digenggam dan memberikan pengalaman minum kopi atau teh yang lebih hangat dan estetik.</p><ul><li>Kapasitas: 350 ml</li><li>Aman untuk Microwave & Dishwasher</li><li>Food grade, bebas timbal dan racun</li></ul>', '["/uploads/seed-mug.jpg"]'
WHERE @seller_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM products WHERE name LIKE 'Mug Keramik Artisan%');
