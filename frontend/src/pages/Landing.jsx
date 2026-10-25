import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero.png";
import {
  Store,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Package,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useAuth } from "@/context/AuthContext";
import usePaginated from "@/hooks/usePaginated";
import { Spinner, Empty } from "@/components/ui";
import { api, FILE_URL } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, stripHtml } from "@/utils/format";

export default function Landing() {
  const { user } = useAuth();

  // Settings & Categories
  const [settings, setSettings] = useState({
    price_per_km: 3000,
    fee_percent: 5,
  });
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("");

  useEffect(() => {
    api
      .get(API_ENDPOINTS.SETTINGS)
      .then(({ data }) => {
        if (data.data) setSettings(data.data);
      })
      .catch(() => {});
    api
      .get(API_ENDPOINTS.CATEGORIES, { params: { limit: 10 } })
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  // Featured products (latest 8 products)
  const list = usePaginated(API_ENDPOINTS.PRODUCTS, {
    limit: 8,
    sortBy: "id",
    order: "desc",
    ...(activeCat ? { category: activeCat } : {}),
  });

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <PublicNavbar />

      {/* ---------- HERO SECTION (GRAND & IMPACTFUL) ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50/30 py-16 sm:py-24 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/90 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
                <Sparkles size={15} />
                <span>E-Commerce Saldo Lokal Terpadu</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] sm:leading-[1.25] text-slate-900 space-y-2.5 sm:space-y-3">
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 px-4 sm:px-6 py-0.5 text-brand-700">
                      Belanja Praktis
                    </span>
                    <span className="absolute inset-x-0 top-[20%] bottom-[12%] rounded-full bg-teal-100/90 -z-0" />
                  </span>
                </span>
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 px-4 sm:px-6 py-0.5 text-orange-600">
                      Ongkir GPS Akurat
                    </span>
                    <span className="absolute inset-x-0 top-[20%] bottom-[12%] rounded-full bg-orange-100 -z-0" />
                  </span>
                </span>
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 px-4 sm:px-6 py-0.5 text-brand-700">
                      Aman Sistem Saldo
                    </span>
                    <span className="absolute inset-x-0 top-[20%] bottom-[12%] rounded-full bg-teal-100/90 -z-0" />
                  </span>
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mx-auto lg:mx-0">
                Solusi jual beli cerdas menghubungkan <strong>Pembeli</strong>,{" "}
                <strong>Penjual</strong>, dan <strong>Kurir</strong>. Bebas
                biaya transfer berulang, ongkir otomatis dari jarak GPS, dan
                saldo hanya terpotong setelah barang tiba.
              </p>

              {/* Big, bold CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                <Link
                  to="/products"
                  className="btn-primary !py-4 !px-8 text-base font-bold rounded-2xl shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition"
                >
                  <ShoppingBag size={20} />
                  <span>Jelajahi Semua Produk</span>
                </Link>

                {!user ? (
                  <Link
                    to="/register"
                    className="btn-ghost !py-4 !px-8 text-base font-bold rounded-2xl border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition"
                  >
                    <span>Daftar Akun Baru</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link
                    to="/about"
                    className="btn-ghost !py-4 !px-8 text-base font-bold rounded-2xl border-slate-300 hover:bg-slate-50 transition"
                  >
                    <span>Panduan Alur Sistem</span>
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Hero Illustration */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-lg flex items-center justify-center">
                {/* Soft backdrop glow matching brand colors */}
                <div className="absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-gradient-to-tr from-brand-200/50 via-teal-100/60 to-emerald-100/40 blur-3xl -z-10" />
                <img
                  src={heroImg}
                  alt="Belanja & Jual di Cakau ID"
                  className="w-full h-auto max-h-[520px] object-contain drop-shadow-xl transition duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS SECTION ---------- */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
            <div>
              <span className="inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 mb-2">
                Pilihan Terbaik
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Produk Terbaru dari Toko Terverifikasi
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-slate-500">
                Pesan langsung dengan saldo akun Anda dan perhitungan ongkir
                akurat.
              </p>
            </div>

            <Link
              to="/products"
              className="btn-ghost !py-3 !px-6 text-sm font-bold rounded-xl shrink-0 inline-flex items-center gap-2"
            >
              <span>Lihat Semua Produk ({list.pg.total || "Katalog"})</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Category Filter Pills on Landing */}
          {categories.length > 0 && (
            <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveCat("")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                  !activeCat
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-2 ring-brand-200"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Semua Kategori</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    setActiveCat(activeCat === c.slug ? "" : c.slug)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                    activeCat === c.slug
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-2 ring-brand-200"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {list.loading ? (
            <div className="py-20 text-center">
              <Spinner />
              <p className="mt-3 text-sm text-slate-500">
                Memuat produk pilihan...
              </p>
            </div>
          ) : list.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
              {list.error}
            </div>
          ) : !list.rows.length ? (
            <div className="py-16">
              <Empty text="Belum ada produk yang tersedia saat ini." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {list.rows.map((product) => {
                const imgThumb = product.images?.[0];
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-brand-500 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                        {imgThumb ? (
                          <img
                            src={FILE_URL + imgThumb}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package size={44} />
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-slate-800 shadow">
                          Stok: {product.stock}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <div className="flex items-center justify-between gap-1 text-xs">
                          <p className="flex items-center gap-1.5 font-semibold text-slate-500 truncate">
                            <Store
                              size={13}
                              className="text-brand-600 shrink-0"
                            />
                            <span className="truncate">
                              {product.store_name || "Toko"}
                            </span>
                          </p>
                          {product.category_name && (
                            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md shrink-0">
                              {product.category_name}
                            </span>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-lg sm:text-xl font-extrabold text-brand-700">
                          {rupiah(product.price)}
                        </p>
                        {product.description && (
                          <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                            {stripHtml(product.description)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Button directs to Product Detail Page */}
                    <div className="p-4 sm:p-5 pt-0">
                      <span className="btn-primary w-full !py-2.5 text-xs sm:text-sm font-bold rounded-xl text-center block shadow-sm group-hover:shadow">
                        Lihat & Pesan
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Bottom Catalog Link Banner */}
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="btn-primary !py-3.5 !px-8 text-sm font-bold rounded-2xl shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              <span>Buka Halaman Katalog Lengkap</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- 4 ROLES ECOSYSTEM SECTION ---------- */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block rounded-full bg-brand-100 px-3.5 py-1 text-xs font-bold text-brand-700 mb-2.5">
              3 Peran Terintegrasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ekosistem Transaksi Cakau ID
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Setiap pihak saling terhubung dalam satu sistem yang aman,
              transparan, dan terukur secara otomatis.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Pembeli */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-brand-700 font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pembeli</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-brand-600 mt-0.5 shrink-0"
                  />
                  <span>Daftar WhatsApp & topup saldo via Bank / QRIS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-brand-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Ongkos kirim otomatis dihitung dari koordinat GPS.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-brand-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Saldo hanya terpotong saat pesanan Anda konfirmasi selesai.
                  </span>
                </li>
              </ul>
            </div>

            {/* Seller */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Penjual (Seller)
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-indigo-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Wajib pasang pin koordinat GPS toko sebelum berjualan.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-indigo-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Unggah produk dengan multiple gambar & deskripsi kaya.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-indigo-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Terima pembayaran langsung ke saldo toko dan tarik kapan
                    saja.
                  </span>
                </li>
              </ul>
            </div>

            {/* Kurir */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700 font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Kurir Pengantar
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-sky-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Pendaftaran kurir diverifikasi dan disetujui (ACC) oleh
                    admin.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-sky-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Ambil pengiriman pesanan yang siap & gunakan rute maps.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-sky-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Unggah foto bukti tiba untuk menerima ongkir ke saldo kurir.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CALL TO ACTION BANNER ---------- */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border border-slate-800 p-8 sm:p-12 lg:p-16 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Ambient glow effects */}
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 text-center md:text-left max-w-xl">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
                  Mulai Hari Ini
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight !text-white leading-tight">
                Siap Berbelanja atau Membuka Toko Anda?
              </h2>
              <p className="text-sm sm:text-base !text-slate-300 leading-relaxed font-normal">
                Daftar sekarang untuk menikmati ekosistem e-commerce berbasis
                saldo dengan ongkir transparan dan kurir terverifikasi.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm sm:text-base font-extrabold text-slate-900 hover:bg-emerald-50 hover:text-emerald-800 shadow-xl shadow-black/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Daftar Akun Gratis
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/40 bg-white/10 hover:bg-white/20 hover:border-white !text-white px-7 py-4 text-sm sm:text-base font-extrabold backdrop-blur-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
      <FloatingWhatsApp
        phone={settings.contact_phone}
        email={settings.contact_email}
        address={settings.contact_address}
      />
    </div>
  );
}
