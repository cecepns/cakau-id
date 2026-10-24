import { Link } from "react-router-dom";
import {
  Truck,
  Store,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800">
      <PublicNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link to="/" className="hover:text-brand-600 transition">Beranda</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-800 font-semibold">Tentang & Panduan Alur</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 mb-3">
            Mengenal Cakau ID
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            E-Commerce Berbasis Saldo dengan Ongkos Kirim Transparan
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Cakau ID hadir untuk menghadirkan pengalaman transaksi lokal yang efisien. Tanpa biaya admin transfer berulang untuk tiap pesanan, didukung perhitungan ongkos kirim real-time berbasis titik koordinat GPS.
          </p>
        </div>

        {/* 3 Roles Detailed Cards */}
        <div className="space-y-6 mb-16">
          <h2 className="text-2xl font-bold text-slate-900">
            Panduan Alur 3 Peran Pengguna
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 1. Pembeli */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-brand-700 font-bold">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">1. Pembeli (Buyer)</h3>
                  <p className="text-xs text-slate-500">Belanja produk lokal aman & mudah</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-brand-600 mt-0.5 shrink-0" />
                  <span><strong>Topup Saldo</strong>: Mengisi saldo akun melalui transfer bank atau QRIS resmi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-brand-600 mt-0.5 shrink-0" />
                  <span><strong>Checkout GPS</strong>: Titik koordinat pengiriman dideteksi otomatis untuk menghitung jarak ke toko secara akurat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-brand-600 mt-0.5 shrink-0" />
                  <span><strong>Konfirmasi Terima</strong>: Saldo hanya akan dipotong setelah barang tiba di tangan Anda dan Anda mengonfirmasi pesanan.</span>
                </li>
              </ul>
            </div>

            {/* 2. Seller */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">2. Penjual (Seller)</h3>
                  <p className="text-xs text-slate-500">Kelola toko dan raih pelanggan lokal</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <span><strong>Wajib Atur Titik GPS Toko</strong>: Memastikan lokasi pengambilan barang dapat diukur oleh kurir.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <span><strong>Kelola Produk Lengkap</strong>: Mengunggah gambar terkompresi otomatis dan deskripsi lengkap.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <span><strong>Penarikan Saldo Hasil Penjualan</strong>: Saldo otomatis bertambah saat pesanan selesai dan dapat ditarik kapan saja.</span>
                </li>
              </ul>
            </div>

            {/* 3. Kurir */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 font-bold">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">3. Kurir (Delivery)</h3>
                  <p className="text-xs text-slate-500">Antar pesanan & peroleh ongkir transparan</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-sky-600 mt-0.5 shrink-0" />
                  <span><strong>Persetujuan Admin (ACC)</strong>: Pendaftaran kurir diverifikasi admin untuk menjamin kualitas pengantaran.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-sky-600 mt-0.5 shrink-0" />
                  <span><strong>Ambil Pesanan Siap Kirim</strong>: Memilih pesanan yang siap dan membuka rute navigasi Google Maps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-sky-600 mt-0.5 shrink-0" />
                  <span><strong>Foto Bukti Pengiriman</strong>: Mengunggah bukti foto saat pesanan tiba untuk mencairkan ongkir ke saldo kurir.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Formula Haversine & Saldo Security Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6 mb-16">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Bagaimana Ongkir Dihitung Secara Adil?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami menggunakan perhitungan jarak lingkaran besar (Great-Circle Distance) berdasarkan koordinat latitude dan longitude toko penjual ke titik alamat penerima:
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 font-mono text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">Total Biaya Pesanan = Subtotal Produk + (Jarak GPS dalam KM × Tarif Kurir per KM)</p>
            <p className="text-slate-500">* Pembeli mengetahui ongkir pasti sebelum melakukan pemesanan.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Subtle ambient glow effects */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold !text-white">Siap Memulai Bersama Cakau ID?</h3>
            <p className="text-sm !text-slate-300 max-w-lg font-normal">
              Daftar sekarang untuk mulai berbelanja atau membuka toko lokal Anda dengan perlindungan transaksi saldo terpadu.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-slate-900 hover:bg-emerald-50 hover:text-emerald-800 shadow-xl shadow-black/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Daftar Sekarang
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 hover:bg-white/20 hover:border-white !text-white px-6 py-3.5 text-sm font-extrabold backdrop-blur-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Lihat Produk</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
