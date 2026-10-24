import { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, MessageCircle } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import ImagePicker from "@/components/ImagePicker";
import { Badge, Button, Modal, confirmToast, label, WhatsAppIcon } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { FILE_URL } from "@/utils/api";
import { request, toForm } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { dateTime, rupiah, waLink } from "@/utils/format";

const Wa = ({ name, phone }) => phone && <a href={waLink(phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800"><WhatsAppIcon size={14} />{name}</a>;

export default function Orders() {
  const { user, refresh } = useAuth();
  const role = user.role;
  const [scope, setScope] = useState("available");
  const [status, setStatus] = useState("");
  const list = usePaginated(API_ENDPOINTS.ORDERS, { status, ...(role === "courier" ? { scope } : {}) });
  const [deliver, setDeliver] = useState(null);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const act = async (o, action, text, extra = {}) => {
    if (text && !(await confirmToast(text))) return false;
    const res = await request("patch", API_ENDPOINTS.ORDER_ACTION(o.id), toForm({ action, ...extra }), { success: false });
    if (res) { toast.success("Pesanan diperbarui"); list.reload(); refresh(); }
    return !!res;
  };
  const submitProof = async (e) => {
    e.preventDefault();
    if (!files.length) return toast.error("Bukti pengiriman wajib diunggah");
    setSaving(true);
    if (await act(deliver, "deliver", null, { proof: files[0] })) { setDeliver(null); setFiles([]); }
    setSaving(false);
  };

  const actions = (o) => {
    const B = ({ onClick, v = "primary", children }) => <button className={`btn-${v} !py-1`} onClick={onClick}>{children}</button>;
    if (role === "seller") {
      if (o.status === "pending") return <div className="flex gap-2"><B onClick={() => act(o, "accept")}>Terima</B><B v="ghost" onClick={() => act(o, "cancel", "Tolak pesanan ini?")}>Tolak</B></div>;
      if (o.status === "processing") return <B onClick={() => act(o, "ready")}>Siap diambil kurir</B>;
    }
    if (role === "courier") {
      if (o.status === "ready" && !o.courier_id) return <B onClick={() => act(o, "take", "Ambil pengiriman ini?")}>Ambil</B>;
      if (o.status === "shipping") return <B onClick={() => setDeliver(o)}>Upload bukti</B>;
    }
    if (role === "buyer") {
      if (o.status === "pending") return <B v="ghost" onClick={() => act(o, "cancel", "Batalkan pesanan?")}>Batalkan</B>;
      if (o.status === "delivered") return <B onClick={() => act(o, "complete", `Terima pesanan? Saldo ${rupiah(o.total)} akan dipotong.`)}>Terima pesanan</B>;
    }
    return null;
  };

  const columns = [
    { label: "Pesanan", render: (o) => <div><p className="font-medium">#{o.id}</p><p className="text-xs text-slate-500">{dateTime(o.created_at)}</p></div> },
    { label: "Produk", render: (o) => <ul className="space-y-0.5">{o.items?.map((i, k) => <li key={k}>{i.qty}× {i.name}</li>)}</ul> },
    { label: "Pihak", render: (o) => <div className="space-y-0.5 text-xs"><div>Toko: <Wa name={o.store_name} phone={o.seller_phone} /></div><div>Pembeli: <Wa name={o.buyer_name} phone={o.buyer_phone} /></div>{o.courier_name && <div>Kurir: <Wa name={o.courier_name} phone={o.courier_phone} /></div>}</div> },
    { label: "Alamat", render: (o) => <div className="max-w-[220px] text-xs"><p className="flex gap-1"><MapPin size={13} className="mt-0.5 shrink-0" />{o.address}</p><p className="mt-1 text-slate-500">{o.distance_km} km{o.note ? ` · ${o.note}` : ""}</p>
      {role === "courier" && <a className="text-brand-600" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/${o.seller_lat},${o.seller_lng}/${o.lat},${o.lng}`}>Buka rute</a>}</div> },
    { label: "Total", render: (o) => <div><p className="font-medium">{rupiah(role === "courier" ? o.shipping_cost : role === "seller" ? o.subtotal - o.fee : o.total)}</p>{role === "buyer" && <p className="text-xs text-slate-500">Ongkir {rupiah(o.shipping_cost)}</p>}{role === "seller" && <p className="text-xs text-slate-500">Fee {rupiah(o.fee)}</p>}</div> },
    { label: "Bukti", render: (o) => o.proof && <a href={FILE_URL + o.proof} target="_blank" rel="noreferrer"><img src={FILE_URL + o.proof} alt="Bukti" className="h-12 w-12 rounded border object-cover" /></a> },
    { label: "Status", render: (o) => <Badge value={o.status} /> },
    { label: "Aksi", render: actions },
  ];

  return (
    <>
      <DataTable list={list} columns={columns} searchPlaceholder="Cari nomor, nama, alamat"
        emptyText={role === "courier" && scope === "available" ? "Belum ada pesanan yang siap diambil" : undefined}
        toolbar={<>
          {role === "courier" && <div className="flex rounded-lg border border-slate-300 p-0.5 text-sm">{[["available", "Tersedia"], ["mine", "Pengiriman saya"]].map(([v, t]) => <button key={v} onClick={() => setScope(v)} className={`rounded-md px-3 py-1.5 ${scope === v ? "bg-brand-600 text-white" : "text-slate-600"}`}>{t}</button>)}</div>}
          {!(role === "courier" && scope === "available") && <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option>{["pending", "processing", "ready", "shipping", "delivered", "completed", "cancelled"].map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>}
        </>} />
      <Modal open={!!deliver} onClose={() => setDeliver(null)} title={`Bukti pengiriman #${deliver?.id}`}>
        <form onSubmit={submitProof} className="space-y-4">
          <ImagePicker files={files} onFiles={setFiles} />
          <Button loading={saving} className="w-full">Kirim bukti</Button>
        </form>
      </Modal>
    </>
  );
}
