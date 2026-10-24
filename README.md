# Cakau ID

E-commerce berbasis saldo. React + Vite + Tailwind (PWA) · Express + MySQL.

## Setup
1. Import `backend/sql/database.sql` atau jalankan `backend/sql/migration.sql` ke MySQL.
2. Untuk mengisi data produk & user sampel: jalankan `npm run seed` di folder `backend` atau import `backend/sql/seed_products.sql`.
3. `cd backend && cp .env.example .env` (sesuaikan konfigurasi DB & JWT_SECRET) lalu `npm i && npm run dev`.
   Akun admin dibuat otomatis dari `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. `cd frontend && cp .env.example .env && npm i && npm run dev`.

## Akun Sampel (Password: `password123`)
- **Admin**: `admin@cakau.id` (password dari `.env`: `admin12345`)
- **Seller**: `seller@cakau.id` (Toko: Nusantara Artisan Goods, GPS sudah terpasang)
- **Buyer**: `buyer@cakau.id` (Saldo awal: Rp750.000)
- **Kurir Aktif**: `kurir@cakau.id`
- **Kurir Pending**: `kurir.pending@cakau.id` (untuk menguji fitur ACC Kurir oleh Admin)

## Alur Sistem
Pembeli topup -> Admin approve -> Pembeli checkout produk (jarak & ongkir GPS terhitung otomatis, saldo > 0 dan cukup) -> Seller terima & siapkan -> Kurir ambil pengiriman & upload foto bukti -> Pembeli terima pesanan -> Saldo pembeli dipotong aman: seller (subtotal - fee), kurir (ongkir), admin (fee platform).

# cakau-id
