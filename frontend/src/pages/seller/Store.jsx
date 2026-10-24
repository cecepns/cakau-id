import { useState } from "react";
import toast from "react-hot-toast";
import { Crosshair } from "lucide-react";
import { Button, Field, getPosition } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";

export default function Store() {
  const { user, refresh } = useAuth();
  const [f, setF] = useState({ name: user.name, phone: user.phone, store_name: user.store_name || "", address: user.address || "", lat: user.lat ?? "", lng: user.lng ?? "" });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ready = user.store_name && user.lat != null;

  const locate = async () => {
    setLocating(true);
    try { setF({ ...f, ...(await getPosition()) }); toast.success("Lokasi berhasil diambil"); } catch (e) { toast.error(e.message); }
    setLocating(false);
  };
  const save = async (e) => {
    e.preventDefault();
    if (f.lat === "" || f.lng === "") return toast.error("Ambil lokasi toko dengan GPS terlebih dahulu");
    setSaving(true);
    const res = await request("put", API_ENDPOINTS.AUTH.PROFILE, f, { success: false });
    setSaving(false);
    if (res) { toast.success("Data toko disimpan"); refresh(); }
  };

  return (
    <div className="max-w-xl space-y-4">
      {!ready && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">Atur lokasi toko dulu sebelum Anda bisa membuat produk dan berjualan.</p>}
      <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 p-5">
        <Field label="Nama toko" value={f.store_name} onChange={set("store_name")} required />
        <Field label="Nomor WhatsApp" value={f.phone} onChange={set("phone")} inputMode="tel" required />
        <Field label="Alamat toko" value={f.address} onChange={set("address")} required />
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Lokasi GPS</span>
          <div className="grid grid-cols-2 gap-3"><input className="input bg-slate-50" readOnly placeholder="Latitude" value={f.lat} /><input className="input bg-slate-50" readOnly placeholder="Longitude" value={f.lng} /></div>
          <Button type="button" variant="ghost" loading={locating} onClick={locate}><Crosshair size={16} />Gunakan lokasi saat ini</Button>
        </div>
        <Button loading={saving}>Simpan toko</Button>
      </form>
    </div>
  );
}
