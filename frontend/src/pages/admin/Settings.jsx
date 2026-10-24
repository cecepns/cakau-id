import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { Button, Field, Spinner } from "@/components/ui";

export default function Settings() {
  const [f, setF] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get(API_ENDPOINTS.SETTINGS).then(({ data }) => {
      setF({
        fee_percent: data?.data?.fee_percent ?? 5,
        price_per_km: data?.data?.price_per_km ?? 3000,
        contact_email: data?.data?.contact_email || "support@cakau.id",
        contact_phone: data?.data?.contact_phone || "081234567890",
        contact_address: data?.data?.contact_address || "",
      });
    });
  }, []);
  if (!f) return <Spinner />;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await request("put", API_ENDPOINTS.ADMIN.SETTINGS, f, { success: false });
    setSaving(false);
    if (res) toast.success("Semua pengaturan & kontak berhasil disimpan");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pengaturan Platform & Kontak</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola tarif sistem serta data kontak resmi WhatsApp, Email, dan Alamat Cakau ID.
        </p>
      </div>

      <form onSubmit={save} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Section 1: Financial & Courier */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Tarif & Komisi Platform
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Fee penjualan (%)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={f.fee_percent}
              onChange={(e) => setF({ ...f, fee_percent: e.target.value })}
              hint="Dipotong dari subtotal produk seller"
              required
            />
            <Field
              label="Tarif kurir per km (Rp)"
              type="number"
              min="0"
              value={f.price_per_km}
              onChange={(e) => setF({ ...f, price_per_km: e.target.value })}
              hint="Ongkir = jarak GPS × tarif"
              required
            />
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Kontak & WhatsApp Resmi (Floating Button)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Email Dukungan / Kontak"
              type="email"
              value={f.contact_email}
              onChange={(e) => setF({ ...f, contact_email: e.target.value })}
              placeholder="support@cakau.id"
              required
            />
            <Field
              label="Nomor WhatsApp / HP"
              type="text"
              value={f.contact_phone}
              onChange={(e) => setF({ ...f, contact_phone: e.target.value })}
              placeholder="081234567890"
              hint="Otomatis aktif di Floating WA button"
              required
            />
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Alamat Kantor / Operasional</span>
            <textarea
              className="input !h-24 resize-none py-2 text-sm leading-relaxed"
              value={f.contact_address}
              onChange={(e) => setF({ ...f, contact_address: e.target.value })}
              placeholder="Alamat lengkap operasional"
            />
          </label>
        </div>

        <div className="pt-2">
          <Button loading={saving} className="!py-3 !px-7 font-bold shadow-md">
            Simpan Semua Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
