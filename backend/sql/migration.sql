-- =====================================================
-- Migration File: Kategori Produk & Sistem Escrow Order
-- Petunjuk:
-- 1. Buka phpMyAdmin
-- 2. Pilih database aplikasi Anda (misal: cakau_id)
-- 3. Masuk ke tab "Import", pilih file ini lalu klik "Kirim" / "Go"
--    (atau copy paste isi file ini ke tab "SQL" lalu klik "Kirim" / "Go")
-- =====================================================

-- 1. Buat Tabel Categories (Kategori Produk) tanpa kolom icon
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hapus kolom icon jika sebelumnya sudah sempat terbuat
ALTER TABLE categories DROP COLUMN IF EXISTS icon;

-- 2. Masukkan 5 Kategori Default
INSERT IGNORE INTO categories (`id`, `name`, `slug`) VALUES
  (1, 'Makanan / Jajanan', 'makanan-jajanan'),
  (2, 'UMKM', 'umkm'),
  (3, 'Barang Baru', 'barang-baru'),
  (4, 'Barang Bekas', 'barang-bekas'),
  (5, 'Lainnya', 'lainnya');

-- 3. Tambahkan kolom status pembayaran (is_paid) pada tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_paid TINYINT(1) NOT NULL DEFAULT 1;

-- 4. Tambahkan kolom category_id pada tabel products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT NULL;
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_products_category (category_id);

-- 5. Hubungkan produk lama yang belum berkategori ke kategori 'Makanan / Jajanan' (id: 1)
UPDATE products SET category_id = 1 WHERE category_id IS NULL;
