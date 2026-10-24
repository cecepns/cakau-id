buatkan saya aplikasi ecommerce bernama cakau ID yang transaksinya menggunakan sistem saldo, logonya ini [logo.png](file;file:///Users/cecep/Desktop/SP%20-%20New/cakau.id/logo.png) dimana transaksinya itu menggunakan saldo. baca rules tech stack yang saya inginkan [AGENTS.md](file;file:///Users/cecep/Desktop/SP%20-%20New/cakau.id/AGENTS.md) 


ada 4 role akses
1. Admin (manage semua data)
2. Seller
3. Kurir (wajib di acc oleh admin jika di register)
4. pembeli

Admin
- bisa manage % an fee yang didapat dari penjualan
- bisa manage harga per km dari kurir, jdi saat pengiriman alamat pengirim -> buyer/pembeli harganya berdasarkan jarak km nya
- manage request topup
- manage rekening topup, jika
qris bisa upload images
- manage users/block users
- manage request withdrawl seller dan kurir

Seller
- bisa manage product, gambar bisa multiple, dan deskripsi product pakai react quill js
- manage lokasi toko by gps, jika lokasi toko belum di set maka dia belum bisa berjualan / buat produk

Kurir
- manage pengiriman barang dari seller ke pembeli
- upload bukti pengiriman pesanan

pembeli
- manage order , manage terima pesanan
- request topup ke admin
tidak bisa order jika saldonya 0
- saat pesanan diselesaikan, saldo otomatis terpotong dan masuk ke seller dan kurir

pastikan semuanya wajib masukan nomor whatsapp, kurir, seller dan pembeli


semua upload images di compress di fe pakai compressor js max 500kb (gaperlu ditulis di compress di ui / alertnya)

pastikan desain UI nya clean, rapih, typgraphy konsisten dengan bg putih