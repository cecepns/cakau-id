# Cakau ID - Mobile App (React Native Expo)

Aplikasi mobile resmi **Cakau ID** berbasis React Native Expo dengan WebView yang terhubung langsung ke [https://cakau-id.vercel.app/](https://cakau-id.vercel.app/).

---

## 🚀 Fitur & Konfigurasi Utama

1. **Anti-Cache & Real-time Update**:
   - `cacheEnabled={false}` & `cacheMode="LOAD_NO_CACHE"`
   - Header HTTP anti-cache: `Cache-Control: no-cache, no-store, must-revalidate`
   - Injeksi pembaruan Service Worker otomatis saat aplikasi dibuka
   - Setiap ada pembaruan kode di Vercel, aplikasi mobile akan langsung menampilkan versi terbaru tanpa perlu update aplikasi dari Play Store.
   - Sesi login (`localStorage` & Cookies) tetap tersimpan aman.

2. **Dukungan Perangkat & Hardware**:
   - **GPS / Geolocation**: Terintegrasi untuk kalkulasi ongkir GPS dan penentuan titik koordinat toko.
   - **Upload File & Kamera**: Terintegrasi untuk upload bukti transfer topup, foto produk toko, dan bukti pengantaran kurir.
   - **WhatsApp Link Interception**: Link WhatsApp (`wa.me`, `whatsapp://`) otomatis dibuka langsung ke aplikasi WhatsApp perangkat.
   - **Tombol Back Hardware Android**: Menangani navigasi mundur di dalam WebView.
   - **Offline Fallback Screen**: Layar interaktif elegan jika koneksi internet terputus dengan tombol *Coba Lagi*.

3. **Logo & Desain Ikon**:
   - Background ikon putih bersih (`#ffffff`).
   - Logo proporsional di dalam safe zone lingkaran/squircle launcher Android (tidak ter-stretch).

---

## 📦 File Release Siap Pakai

File hasil build tersimpan di folder `mobile/release/`:

1. **`mobile/release/cakau-id.apk`**
   - File APK release yang sudah ditandatangani (signed).
   - Siap langsung diinstal dan dites pada HP Android.
2. **`mobile/release/cakau-id.aab`**
   - Android App Bundle (AAB) resmi bertanda tangan.
   - Siap di-upload langsung ke **Google Play Console / Play Store**.
3. **`mobile/release/cakau-release-key.keystore`**
   - File sertifikat digital release keystore resmi.

---

## 🔑 Informasi Release Keystore

Simpan kredensial ini untuk update aplikasi ke Google Play Store di masa depan:

| Parameter | Nilai |
|---|---|
| **Keystore File** | `cakau-release-key.keystore` |
| **Alias** | `cakau-key` |
| **Keystore Password** | `cakauidpassword123` |
| **Key Password** | `cakauidpassword123` |
| **Algoritma** | RSA 2048-bit (Masa berlaku 10.000 hari) |
| **Owner** | CN=Cakau ID, OU=Mobile, O=Cakau, L=Subang, ST=Jawa Barat, C=ID |

---

## 🛠️ Cara Rebuild di Masa Depan

Jika ingin melakukan rebuild APK atau AAB secara mandiri:

```bash
# 1. Masuk ke folder android
cd mobile/android

# 2. Build Release APK & AAB
./gradlew assembleRelease bundleRelease
```
