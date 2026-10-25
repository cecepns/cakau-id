-- =====================================================
-- Migration File: Fitur Chat & Jam Operasional Toko
-- Cakau ID E-Commerce System
-- =====================================================

USE cakau_id;

-- 1. Tambah kolom operational_hours di tabel products dan users
ALTER TABLE products ADD COLUMN IF NOT EXISTS operational_hours VARCHAR(100) NULL AFTER stock;
ALTER TABLE users ADD COLUMN IF NOT EXISTS operational_hours VARCHAR(100) NULL AFTER address;

-- 2. Buat tabel conversations (percakapan antara pembeli dan penjual)
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

-- 3. Buat tabel chat_messages (pesan dalam percakapan)
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
