require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cakau_id',
      multipleStatements: true,
    });
    console.log('Terhubung ke database MySQL...');
    const sql = fs.readFileSync(path.join(__dirname, 'sql', 'seed_products.sql'), 'utf8');
    await conn.query(sql);
    console.log('✅ Berhasil menjalankan seed products dan sample users!');
    console.log('\nAkun sample yang siap digunakan (Password: password123):');
    console.log('  • Seller : seller@cakau.id (Toko: Nusantara Artisan Goods)');
    console.log('  • Buyer  : buyer@cakau.id (Saldo Awal: Rp750.000)');
    console.log('  • Kurir  : kurir@cakau.id (Status: Aktif)');
    console.log('  • Kurir  : kurir.pending@cakau.id (Status: Menunggu Persetujuan Admin)');
    await conn.end();
  } catch (err) {
    console.error('❌ Gagal menjalankan seed:', err.message);
    process.exit(1);
  }
})();
