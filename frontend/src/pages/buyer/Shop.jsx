import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Crosshair, Search, AlertCircle, ShoppingBag } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import {
  Button,
  Empty,
  Field,
  Modal,
  Spinner,
  getPosition,
  WhatsAppIcon,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { api, FILE_URL } from "@/utils/api";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, calcKm, waLink } from "@/utils/format";

export default function Shop() {
  const { user, refresh } = useAuth();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const list = usePaginated(API_ENDPOINTS.PRODUCTS, {
    ...(category ? { category } : {}),
  });
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [f, setF] = useState({
    address: user?.address || "",
    lat: user?.lat ?? "",
    lng: user?.lng ?? "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [img, setImg] = useState(0);
  const [settings, setSettings] = useState({ price_per_km: 3000 });

  useEffect(() => {
    api
      .get(API_ENDPOINTS.SETTINGS)
      .then(({ data }) => {
        if (data.data) setSettings(data.data);
      })
      .catch(() => {});
    api
      .get(API_ENDPOINTS.CATEGORIES, { params: { limit: 100 } })
      .then(({ data }) => {
        if (data.data) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  const openP = (x) => {
    setP(x);
    setQty(1);
    setImg(0);
    setF({
      address: user?.address || "",
      lat: user?.lat ?? "",
      lng: user?.lng ?? "",
      note: "",
    });
  };

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await getPosition();
      setF((prev) => ({ ...prev, ...pos }));
      toast.success("Lokasi GPS berhasil diambil");
    } catch (e) {
      toast.error(e.message || "Gagal mengambil lokasi GPS");
    } finally {
      setLocating(false);
    }
  };

  const sellerLat = p?.seller_lat ?? p?.lat;
  const sellerLng = p?.seller_lng ?? p?.lng;
  const hasCoords =
    sellerLat != null &&
    sellerLng != null &&
    f.lat !== "" &&
    f.lng !== "" &&
    !isNaN(+sellerLat) &&
    !isNaN(+sellerLng) &&
    !isNaN(+f.lat) &&
    !isNaN(+f.lng);

  const distanceKm = hasCoords
    ? Math.round(calcKm(+sellerLat, +sellerLng, +f.lat, +f.lng) * 100) / 100
    : 0;
  const subtotal = p ? Number(p.price) * qty : 0;
  const shippingCost =
    distanceKm > 0
      ? Math.round(distanceKm * (settings.price_per_km || 3000))
      : 0;
  const grandTotal = subtotal + shippingCost;
  const noBalance = Number(user.balance) <= 0;
  const isBalanceInsufficient = Number(user.balance) < grandTotal;

  const order = async (e) => {
    e.preventDefault();
    if (f.lat === "" || f.lng === "")
      return toast.error("Atur lokasi pengiriman dengan tombol GPS");
    if (noBalance)
      return toast.error("Saldo Anda Rp0. Silakan topup terlebih dahulu");
    if (isBalanceInsufficient)
      return toast.error(
        `Saldo tidak cukup. Total tagihan: ${rupiah(grandTotal)} (Termasuk ongkir kurir ${distanceKm} km: ${rupiah(shippingCost)}), saldo Anda saat ini: ${rupiah(user.balance)}`,
      );

    setBusy(true);
    const res = await request("post", API_ENDPOINTS.ORDERS, {
      ...f,
      items: [{ product_id: p.id, qty }],
    });
    setBusy(false);
    if (res) {
      setP(null);
      list.reload();
      refresh();
      toast.success("Pesanan berhasil dibuat!");
    }
  };

  return (
    <div className="space-y-4">
      {noBalance && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <span>
              Saldo Anda Rp0, silakan topup untuk dapat memesan produk.
            </span>
          </div>
          <Link to="/topups" className="font-semibold underline">
            Topup Saldo
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-9"
            placeholder="Cari produk atau toko"
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500">
          Tarif ongkir: {rupiah(settings.price_per_km)}/km
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategory("")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
              !category
                ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-200"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(category === c.slug ? "" : c.slug)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                category === c.slug
                  ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-200"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {list.loading ? (
        <Spinner />
      ) : list.error ? (
        <p className="py-10 text-center text-sm text-red-600">{list.error}</p>
      ) : !list.rows.length ? (
        <Empty text="Produk tidak ditemukan" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.rows.map((x) => (
            <button
              key={x.id}
              onClick={() => openP(x)}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-brand-600 hover:shadow-sm"
            >
              <div className="aspect-square w-full overflow-hidden bg-slate-100">
                {x.images?.[0] ? (
                  <img
                    src={FILE_URL + x.images[0]}
                    alt={x.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <ShoppingBag size={28} />
                  </div>
                )}
              </div>
              <div className="space-y-1 p-3">
                {x.category_name && (
                  <div>
                    <span className="inline-block text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                      {x.category_name}
                    </span>
                  </div>
                )}
                <p className="line-clamp-2 text-sm font-semibold group-hover:text-brand-600 transition">
                  {x.name}
                </p>
                <p className="font-bold text-brand-700">{rupiah(x.price)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {list.pg.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm pt-2">
          <button
            className="btn-ghost !py-1"
            disabled={list.pg.page <= 1}
            onClick={() => list.setPage(list.pg.page - 1)}
          >
            Sebelumnya
          </button>
          <span className="text-xs text-slate-500">
            {list.pg.page} / {list.pg.totalPages}
          </span>
          <button
            className="btn-ghost !py-1"
            disabled={list.pg.page >= list.pg.totalPages}
            onClick={() => list.setPage(list.pg.page + 1)}
          >
            Berikutnya
          </button>
        </div>
      )}

      <Modal open={!!p} onClose={() => setP(null)} title={p?.name} wide>
        {p && (
          <form onSubmit={order} className="space-y-4">
            <div className="space-y-2">
              <div className="aspect-video max-h-64 w-full overflow-hidden rounded-lg border bg-slate-50 flex items-center justify-center">
                {p.images?.[img] ? (
                  <img
                    src={FILE_URL + p.images[img]}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400">Tidak ada gambar</div>
                )}
              </div>
              {p.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {p.images.map((u, i) => (
                    <img
                      key={u}
                      src={FILE_URL + u}
                      alt=""
                      onClick={() => setImg(i)}
                      className={`h-14 w-14 cursor-pointer rounded-md border-2 object-cover ${i === img ? "border-brand-600" : "border-slate-200"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-xl font-bold text-brand-700">
                  {rupiah(p.price)}
                </p>
                <p className="text-xs text-slate-500">Stok: {p.stock}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold text-slate-800">{p.store_name}</p>
                {p.seller_phone && (
                  <a
                    href={waLink(
                      p.seller_phone,
                      `Halo ${p.store_name || "Kak"}, saya tertarik dengan produk ${p.name} di Cakau ID`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    <WhatsAppIcon size={13} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div
              className="prose prose-sm max-w-none text-xs [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4"
              dangerouslySetInnerHTML={{
                __html: p.description || "<em>Tidak ada deskripsi.</em>",
              }}
            />
            <hr className="border-slate-100" />

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-700 w-24">
                Jumlah:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-8 w-8 rounded border bg-white font-bold text-slate-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={p.stock}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.min(p.stock, Math.max(1, +e.target.value || 1)))
                  }
                  className="input !w-16 !py-1 text-center font-semibold text-xs"
                />
                <button
                  type="button"
                  onClick={() => setQty(Math.min(p.stock, qty + 1))}
                  className="h-8 w-8 rounded border bg-white font-bold text-slate-600"
                >
                  +
                </button>
              </div>
            </div>

            <Field
              label="Alamat pengiriman"
              value={f.address}
              onChange={(e) => setF({ ...f, address: e.target.value })}
              minLength={8}
              required
            />

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-700">
                Titik Koordinat GPS
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input bg-slate-50 !py-1 text-xs"
                  readOnly
                  placeholder="Latitude"
                  value={f.lat}
                />
                <input
                  className="input bg-slate-50 !py-1 text-xs"
                  readOnly
                  placeholder="Longitude"
                  value={f.lng}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                loading={locating}
                onClick={locate}
                className="!py-1 text-xs w-full"
              >
                <Crosshair size={14} />
                {f.lat ? "Perbarui Lokasi GPS Saya" : "Gunakan Lokasi GPS Saya"}
              </Button>
            </div>

            <Field
              label="Catatan (opsional)"
              value={f.note}
              onChange={(e) => setF({ ...f, note: e.target.value })}
            />

            <div className="rounded-lg bg-slate-50 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({qty} item)</span>
                <span className="font-semibold">{rupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Ongkir Kurir (
                  {distanceKm > 0 ? `${distanceKm} km` : "Atur GPS"})
                </span>
                <span className="font-semibold">{rupiah(shippingCost)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total</span>
                <span className="text-brand-700">{rupiah(grandTotal)}</span>
              </div>
            </div>

            <Button
              loading={busy}
              disabled={noBalance || isBalanceInsufficient}
              className="w-full"
            >
              {noBalance
                ? "Saldo Rp0, Silakan Topup"
                : isBalanceInsufficient
                  ? "Saldo Tidak Cukup, Silakan Topup"
                  : "Pesan Sekarang"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
