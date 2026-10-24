-- =====================================================
-- Migration File: Manage Contact Platform Settings
-- Cakau ID E-Commerce System
-- =====================================================

USE cakau_id;

-- 1. Perlebar kapasitas kolom value di tabel settings untuk alamat panjang
ALTER TABLE settings MODIFY COLUMN `value` VARCHAR(255) NOT NULL;

-- 2. Tambahkan / perbarui data default kontak platform
INSERT INTO settings (`key`, `value`) VALUES
  ('contact_email', 'support@cakau.id'),
  ('contact_phone', '081234567890'),
  ('contact_address', 'Jl. Jenderal Sudirman No. 10, Jakarta Pusat 10220')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
