import { Link } from "react-router-dom";
import { ShieldCheck, MapPin, Wallet, ArrowRight } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-14 pb-10 text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-slate-100">
          {/* Col 1: ONLY LOGO (no text) + Tagline */}
          <div className="space-y-4">
            <Link to="/" className="inline-block" title="Cakau ID">
              <img
                src="/logo.png"
                alt="Cakau ID"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Platform e-commerce modern berbasis sistem saldo dengan perhitungan ongkos kirim akurat berdasarkan koordinat GPS dan kurir terverifikasi.
            </p>
            <div className="flex items-center gap-3 text-xs text-brand-700 font-semibold">
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> Saldo Aman</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> GPS Akurat</span>
            </div>
          </div>

          {/* Col 2: Halaman Utama */}
          <div>
            <p className="font-bold text-slate-900 mb-4 text-sm">Halaman Utama</p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-brand-600 transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-brand-600 transition">
                  Semua Katalog Produk
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-600 transition">
                  Tentang & Panduan Alur
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Akun & Akses Peran */}
          <div>
            <p className="font-bold text-slate-900 mb-4 text-sm">Akses & Pendaftaran</p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/login" className="hover:text-brand-600 transition">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 transition">
                  Daftar Pembeli Baru
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 transition">
                  Buka Toko (Seller)
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 transition">
                  Gabung Jadi Kurir
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan Transaksi */}
          <div>
            <p className="font-bold text-slate-900 mb-4 text-sm">Keamanan Transaksi</p>
            <p className="text-xs leading-relaxed text-slate-500">
              Transaksi dilindungi sistem saldo terpusat. Saldo pembeli hanya dipotong saat pesanan benar-benar tiba dan terkonfirmasi, lalu diteruskan otomatis ke seller dan kurir.
            </p>
            <div className="mt-4">
              <Link to="/about" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
                Pelajari selengkapnya <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Cakau ID. Hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <Link to="/products" className="hover:text-slate-600">Belanja Sekarang</Link>
            <Link to="/about" className="hover:text-slate-600">Cara Kerja</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
