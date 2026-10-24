import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Store,
  MapPin,
  MessageCircle,
  Truck,
  ShieldCheck,
  Crosshair,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Package,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Spinner, Button, Field, getPosition, WhatsAppIcon } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { api, FILE_URL } from "@/utils/api";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, calcKm, waLink } from "@/utils/format";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, refresh } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  // Settings for shipping rate
  const [settings, setSettings] = useState({ price_per_km: 3000, fee_percent: 5 });

  // Order state
  const [qty, setQty] = useState(1);
  const [orderForm, setOrderForm] = useState({
    address: user?.address || "",
    lat: user?.lat ?? "",
    lng: user?.lng ?? "",
    note: "",
  });
  const [locating, setLocating] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Load product & settings
  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    Promise.all([
      api.get(API_ENDPOINTS.PRODUCT(id)),
      api.get(API_ENDPOINTS.SETTINGS).catch(() => ({ data: { data: null } })),
    ])
      .then(([prodRes, setRes]) => {
        setProduct(prodRes.data.data);
        if (setRes.data?.data) setSettings(setRes.data.data);
        if (user) {
          setOrderForm((prev) => ({
            ...prev,
            address: prev.address || user.address || "",
            lat: prev.lat !== "" ? prev.lat : (user.lat ?? ""),
            lng: prev.lng !== "" ? prev.lng : (user.lng ?? ""),
          }));
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Produk tidak ditemukan");
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const locateBuyer = async () => {
    setLocating(true);
    try {
      const pos = await getPosition();
      setOrderForm((prev) => ({ ...prev, ...pos }));
      toast.success("Titik lokasi GPS Anda berhasil dideteksi!");
    } catch (e) {
      toast.error(e.message || "Gagal mengambil lokasi GPS");
    } finally {
      setLocating(false);
    }
  };

  // Distance & cost calculations (using seller_lat/seller_lng returned by API)
  const sellerLat = product?.seller_lat ?? product?.lat;
  const sellerLng = product?.seller_lng ?? product?.lng;
  const hasCoords =
    sellerLat != null &&
    sellerLng != null &&
    orderForm.lat !== "" &&
    orderForm.lng !== "" &&
    !isNaN(+sellerLat) &&
    !isNaN(+sellerLng) &&
    !isNaN(+orderForm.lat) &&
    !isNaN(+orderForm.lng);

  const distanceKm = hasCoords
    ? Math.round(calcKm(+sellerLat, +sellerLng, +orderForm.lat, +orderForm.lng) * 100) / 100
    : 0;
  const subtotal = product ? Number(product.price) * qty : 0;
  const shippingCost = distanceKm > 0 ? Math.round(distanceKm * (settings.price_per_km || 3000)) : 0;
  const grandTotal = subtotal + shippingCost;
  const hasZeroBalance = user?.role === "buyer" && Number(user?.balance || 0) <= 0;
  const isBalanceInsufficient = user?.role === "buyer" && Number(user?.balance || 0) < grandTotal;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast("Silakan masuk dengan akun Pembeli terlebih dahulu", { icon: "ℹ️" });
      nav("/login");
      return;
    }
    if (user.role !== "buyer") {
      return toast.error("Hanya akun Pembeli yang dapat melakukan pemesanan");
    }
    if (orderForm.lat === "" || orderForm.lng === "") {
      return toast.error("Titik koordinat GPS pengiriman wajib diisi. Silakan klik 'Gunakan Titik Lokasi GPS Saya'");
    }
    if (hasZeroBalance) {
      return toast.error("Saldo Anda Rp0. Silakan topup terlebih dahulu");
    }
    if (isBalanceInsufficient) {
      return toast.error(
        `Saldo tidak cukup. Total tagihan: ${rupiah(grandTotal)} (Termasuk ongkir kurir ${distanceKm} km: ${rupiah(shippingCost)}), saldo Anda saat ini: ${rupiah(user?.balance || 0)}`
      );
    }
    if (!orderForm.lat || !orderForm.lng) {
      return toast.error("Tentukan titik lokasi pengiriman dengan tombol GPS");
    }
    if (!orderForm.address.trim() || orderForm.address.trim().length < 8) {
      return toast.error("Alamat pengiriman lengkap wajib diisi (minimal 8 karakter)");
    }

    setOrdering(true);
    const res = await request("post", API_ENDPOINTS.ORDERS, {
      ...orderForm,
      items: [{ product_id: product.id, qty }],
    });
    setOrdering(false);

    if (res) {
      refresh();
      toast.success("Pesanan berhasil dibuat! Menunggu konfirmasi toko.");
      nav("/orders");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNavbar />
        <div className="py-24 text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-500">Memuat detail produk...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNavbar />
        <div className="mx-auto max-w-3xl py-20 px-4 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h2 className="text-xl font-bold text-red-700">Produk Tidak Ditemukan</h2>
            <p className="mt-2 text-sm text-red-600">{error || "Produk yang Anda cari tidak tersedia."}</p>
            <div className="mt-6">
              <Link to="/products" className="btn-primary !py-2.5 !px-6 text-sm font-bold">
                Kembali ke Katalog Produk
              </Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800 overflow-x-hidden w-full max-w-full">
      <PublicNavbar />

      <main className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 w-full min-w-0">
        {/* Breadcrumb (Mobile Friendly with wrapping & safe truncation) */}
        <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 mb-5 sm:mb-6 min-w-0">
          <Link to="/" className="hover:text-brand-600 transition shrink-0">
            Beranda
          </Link>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <Link to="/products" className="hover:text-brand-600 transition shrink-0">
            Semua Produk
          </Link>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-[130px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-12 items-start min-w-0">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-3 min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                {images[activeImg] ? (
                  <img
                    src={FILE_URL + images[activeImg]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package size={64} className="text-slate-300" />
                )}
                <span className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-slate-800 shadow">
                  Stok: {product.stock}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={imgUrl}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      idx === activeImg
                        ? "border-brand-600 shadow-md ring-2 ring-brand-100"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={FILE_URL + imgUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Store Information Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold shrink-0">
                    <Store size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{product.store_name}</h4>
                    <p className="text-[11px] text-slate-500">Penjual Terverifikasi Cakau ID</p>
                  </div>
                </div>
                {product.seller_phone && (
                  <a
                    href={waLink(
                      product.seller_phone,
                      `Halo ${product.store_name || "Kak"}, saya ingin bertanya seputar produk ${product.name} di Cakau ID: ${window.location.href}`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition shadow-2xs shrink-0 self-start sm:self-auto w-full sm:w-auto"
                    title="Hubungi penjual melalui WhatsApp"
                  >
                    <WhatsAppIcon size={16} />
                    <span>WhatsApp Toko</span>
                  </a>
                )}
              </div>

              {product.seller_address && (
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin size={15} className="text-brand-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{product.seller_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Order Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0">
            {/* Title & Price Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm space-y-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug break-words">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-700">
                  {rupiah(product.price)}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  / unit
                </span>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Produk</h3>
                <div
                  className="prose prose-sm max-w-none text-slate-700 text-sm leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 break-words"
                  dangerouslySetInnerHTML={{ __html: product.description || "<em>Belum ada deskripsi untuk produk ini.</em>" }}
                />
              </div>
            </div>

            {/* Order Card */}
            <div className="rounded-2xl border-2 border-brand-500/20 bg-white p-4 sm:p-6 lg:p-8 shadow-md shadow-brand-100/40 space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck size={18} className="text-brand-600 shrink-0" />
                  <span>Form Pemesanan & Hitung Ongkir</span>
                </h3>
                <span className="inline-block self-start sm:self-auto rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 shrink-0">
                  Tarif: {rupiah(settings.price_per_km)}/km
                </span>
              </div>

              {!user ? (
                /* Guest View */
                <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-5 sm:p-6 text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-600 font-bold">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Masuk untuk Melakukan Pemesanan</h4>
                    <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Transaksi di Cakau ID menggunakan sistem saldo yang aman dan terpotong hanya saat pesanan telah Anda terima dengan baik.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
                    <Link to="/login" className="btn-primary !py-3 !px-7 text-sm font-bold rounded-xl shadow w-full sm:w-auto text-center">
                      Masuk ke Akun
                    </Link>
                    <Link to="/register" className="btn-ghost !py-3 !px-6 text-sm font-bold rounded-xl w-full sm:w-auto text-center">
                      Daftar Pembeli Baru
                    </Link>
                  </div>
                </div>
              ) : user.role !== "buyer" ? (
                /* Non-buyer Role View */
                <div className="rounded-xl bg-amber-50 p-4 sm:p-5 text-sm text-amber-800 space-y-2">
                  <p className="font-bold">Peran Anda Saat Ini: {user.role.toUpperCase()}</p>
                  <p className="text-xs leading-relaxed">
                    Hanya akun dengan peran <strong>Pembeli (Buyer)</strong> yang dapat melakukan transaksi pemesanan produk.
                  </p>
                </div>
              ) : (
                /* Authenticated Buyer Order Form */
                <form onSubmit={handleOrder} className="space-y-4">
                  {/* Saldo status */}
                  {hasZeroBalance ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-amber-50 p-3.5 sm:p-4 text-xs text-amber-800 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-600 shrink-0" />
                        <span>Saldo Anda saat ini Rp0. Silakan topup terlebih dahulu.</span>
                      </div>
                      <Link to="/topups" className="font-bold underline text-amber-900 shrink-0 self-end sm:self-auto">
                        Topup Sekarang
                      </Link>
                    </div>
                  ) : isBalanceInsufficient ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-amber-50 p-3.5 sm:p-4 text-xs text-amber-800 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-600 shrink-0" />
                        <span>Saldo ({rupiah(user.balance)}) tidak cukup untuk total {rupiah(grandTotal)}.</span>
                      </div>
                      <Link to="/topups" className="font-bold underline text-amber-900 shrink-0 self-end sm:self-auto">
                        Isi Saldo
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 border border-emerald-200">
                      <span>Saldo Anda: <strong>{rupiah(user.balance)}</strong></span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Saldo Mencukupi
                      </span>
                    </div>
                  )}

                  {/* Quantity selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Jumlah Beli</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={qty}
                        onChange={(e) => setQty(Math.min(product.stock, Math.max(1, +e.target.value || 1)))}
                        className="input !w-16 sm:!w-20 !py-1 text-center font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        +
                      </button>
                      <span className="text-xs text-slate-400 ml-1">maks. {product.stock}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <Field
                    label="Alamat Lengkap Pengiriman"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    minLength={8}
                    required
                  />

                  {/* GPS Locator */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700">Titik Koordinat GPS Anda</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className="input bg-slate-50 !py-2 text-xs"
                        readOnly
                        placeholder="Latitude"
                        value={orderForm.lat}
                      />
                      <input
                        className="input bg-slate-50 !py-2 text-xs"
                        readOnly
                        placeholder="Longitude"
                        value={orderForm.lng}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      loading={locating}
                      onClick={locateBuyer}
                      className="!py-2 text-xs w-full font-bold"
                    >
                      <Crosshair size={15} />
                      {orderForm.lat ? "Perbarui Koordinat GPS Saya" : "Gunakan Titik Lokasi GPS Saya"}
                    </Button>
                  </div>

                  {/* Note */}
                  <Field
                    label="Catatan Pengiriman (Opsional)"
                    value={orderForm.note}
                    onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                    placeholder="Contoh: Titip di pos satpam, warna biru, dll."
                  />

                  {/* Cost Summary Box */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 sm:p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({qty} item)</span>
                      <span className="font-bold">{rupiah(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Jarak Pengiriman Kurir</span>
                      <span className="font-bold">
                        {distanceKm > 0
                          ? `${distanceKm} km`
                          : !orderForm.lat || !orderForm.lng
                          ? "Atur GPS Anda"
                          : "0 km"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        Ongkir Kurir (
                        {distanceKm > 0
                          ? `${distanceKm} km × ${rupiah(settings.price_per_km || 3000)}`
                          : "Belum dihitung"}
                        )
                      </span>
                      <span className="font-bold">{rupiah(shippingCost)}</span>
                    </div>

                    {distanceKm > 50 && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800 flex items-start gap-2 leading-relaxed">
                        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Perhatian Jarak Jauh:</strong> Jarak toko ke lokasi Anda adalah <strong>{distanceKm} km</strong>, sehingga biaya ongkir kurir disesuaikan ({rupiah(shippingCost)}).
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm sm:text-base">
                      <span>Total Biaya</span>
                      <span className="text-brand-700">{rupiah(grandTotal)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                      * Saldo pembeli hanya dipotong saat pesanan telah Anda terima dan Anda klik konfirmasi pesanan selesai.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    loading={ordering}
                    disabled={hasZeroBalance || isBalanceInsufficient}
                    className="w-full !py-3.5 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition"
                  >
                    {hasZeroBalance
                      ? "Saldo Rp0, Silakan Topup Terlebih Dahulu"
                      : isBalanceInsufficient
                      ? "Saldo Tidak Cukup, Silakan Topup"
                      : "Pesan Sekarang"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
