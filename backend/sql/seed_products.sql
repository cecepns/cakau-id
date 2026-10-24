-- =====================================================
-- Seed File: Sample Users & Products for Cakau ID
-- Default password untuk semua akun sample: password123
-- =====================================================

USE cakau_id;

-- 1. Insert Sample Users (Seller, Buyer, Kurir Aktif, Kurir Pending)
-- Note: Password hash bcrypt untuk 'password123' adalah:
-- $2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S

INSERT INTO users (name, email, password, phone, role, status, balance, store_name, address, lat, lng)
VALUES
  (
    'Admin',
    'admin@cakau.id',
    '$2a$10$O3QWjI/vdQ2r8/x/pSjHxeZqR4/Kj593Vv7oY/tK1jM6Y5G1G3h2y',
    '6281234567890',
    'admin',
    'active',
    0,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Budi Santoso',
    'seller@cakau.id',
    '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S',
    '081298765432',
    'seller',
    'active',
    0,
    'Nusantara Artisan Goods',
    'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
    -6.2297465,
    106.8074932
  ),
  (
    'Siti Rahmawati',
    'buyer@cakau.id',
    '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S',
    '081211112222',
    'buyer',
    'active',
    750000,
    NULL,
    'Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan',
    -6.2608120,
    106.8143200
  ),
  (
    'Ahmad Kurniawan',
    'kurir@cakau.id',
    '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S',
    '081233334444',
    'courier',
    'active',
    0,
    NULL,
    'Jl. Fatmawati Raya No. 8, Cilandak, Jakarta Selatan',
    -6.2912400,
    106.7975400
  ),
  (
    'Rian Saputra',
    'kurir.pending@cakau.id',
    '$2a$10$ISrH7zNo6KKW6q9suHkZM.unwTAObIQGKSLnJLihm2biX.su5vV5S',
    '081255556666',
    'courier',
    'pending',
    0,
    NULL,
    'Jl. Tebet Barat Dalam No. 15, Jakarta Selatan',
    -6.2384100,
    106.8523900
  )
ON DUPLICATE KEY UPDATE
  phone=VALUES(phone),
  store_name=VALUES(store_name),
  address=VALUES(address),
  lat=VALUES(lat),
  lng=VALUES(lng);

-- 2. Insert Sample Topup Accounts
INSERT INTO topup_accounts (type, name, account_number, account_holder, active)
VALUES
  ('bank', 'BCA (Bank Central Asia)', '1234567890', 'Cakau ID Official', 1),
  ('bank', 'Bank Mandiri', '1370019283746', 'Cakau ID Official', 1)
ON DUPLICATE KEY UPDATE
  account_holder=VALUES(account_holder);

-- 3. Insert Sample Products (menggunakan ID seller 'seller@cakau.id')
SET @seller_id = (SELECT id FROM users WHERE email='seller@cakau.id' LIMIT 1);

INSERT INTO products (seller_id, name, price, stock, description, images)
VALUES
  (
    @seller_id,
    'Kopi Arabika Sumatra Gayo 250g (Specialty Grade)',
    85000,
    35,
    '<p><strong>Kopi Arabika Sumatra Gayo</strong> dipetik langsung dari dataran tinggi Takengon, Aceh Tengah pada ketinggian 1.400 mdpl. Diproses dengan metode semi-washed yang menghasilkan body tebal, aroma rempah khas, dan aftertaste cokelat hitam yang memikat.</p><ul><li>Tingkat Sangrai: Medium to Dark</li><li>Profil Rasa: Dark Chocolate, Spices, Brown Sugar</li><li>Berat Bersih: 250 gram</li></ul><p>Sangat cocok untuk metode seduh manual (V60, French Press) maupun mesin espresso rumah.</p>',
    '["/uploads/seed-coffee.jpg"]'
  ),
  (
    @seller_id,
    'Dompet Pria Kulit Asli Handmade (Crazy Horse Leather)',
    175000,
    20,
    '<p>Dompet pria bergaya minimalis klasik dibuat menggunakan 100% <strong>kulit sapi asli jenis Crazy Horse</strong>. Jahitan tangan kokoh dengan benang wax berkualitas tinggi menghasilkan daya tahan bertahun-tahun serta karakter patina yang semakin indah seiring waktu.</p><ul><li>6 Slot Kartu ATM / KTP</li><li>2 Kompartemen Uang Kertas Utama</li><li>Dimensi: 11.5 cm x 9.5 cm</li></ul>',
    '["/uploads/seed-wallet.jpg"]'
  ),
  (
    @seller_id,
    'Tote Bag Kanvas Premium Studio & Co (Water Repellent)',
    95000,
    45,
    '<p>Tas jinjing kanvas tebal 14oz premium dengan lapisan anti cipratan air (water-repellent). Desain monokrom estetis yang cocok untuk aktivitas kuliah, kerja, maupun jalan santai akhir pekan.</p><ul><li>Bahan: Kanvas Katun Tebal 14oz</li><li>Penutup: Resleting YKK Premium</li><li>Dilengkapi saku dalam untuk dompet & smartphone</li><li>Muat laptop hingga ukuran 15.6 inch</li></ul>',
    '["/uploads/seed-tote.jpg"]'
  ),
  (
    @seller_id,
    'Mug Keramik Artisan Handmade (Speckled Terracotta 350ml)',
    68000,
    25,
    '<p>Mug keramik buatan tangan pengrajin lokal dengan sentuhan glasir bintik alami (speckled) dan aksen tanah liat terracotta. Nyaman digenggam dan memberikan pengalaman minum kopi atau teh yang lebih hangat dan estetik.</p><ul><li>Kapasitas: 350 ml</li><li>Aman untuk Microwave & Dishwasher</li><li>Food grade, bebas timbal dan racun</li></ul>',
    '["/uploads/seed-mug.jpg"]'
  );
