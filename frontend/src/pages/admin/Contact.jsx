import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send, ExternalLink, ShieldCheck } from "lucide-react";
import { api } from "@/utils/api";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { Button, Field, Spinner, WhatsAppIcon } from "@/components/ui";
import { waLink } from "@/utils/format";

export default function Contact() {
  const [f, setF] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(API_ENDPOINTS.SETTINGS).then(({ data }) => {
      setF({
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
    const res = await request("put", API_ENDPOINTS.ADMIN.CONTACT, f, { success: false });
    setSaving(false);
    if (res) toast.success("Informasi kontak platform berhasil diperbarui");
  };

  const previewWa = waLink(
    f.contact_phone,
    "Halo Admin Cakau ID, saya butuh informasi / bantuan mengenai layanan marketplace."
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Kelola Kontak Platform</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur informasi kontak resmi Cakau ID (Email, Alamat, dan WhatsApp). Nomor WhatsApp akan otomatis terhubung ke tombol mengambang (Floating Button) di landing page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Column */}
        <form onSubmit={save} className="lg:col-span-7 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Field
            label="Email Dukungan / Layanan"
            type="email"
            value={f.contact_email}
            onChange={(e) => setF({ ...f, contact_email: e.target.value })}
            placeholder="contoh: support@cakau.id"
            hint="Email resmi untuk pertanyaan umum dan korespondensi pengguna"
            required
          />

          <Field
            label="Nomor WhatsApp / Telepon Resmi"
            type="text"
            value={f.contact_phone}
            onChange={(e) => setF({ ...f, contact_phone: e.target.value })}
            placeholder="contoh: 081234567890"
            hint="Format: 08xxxxxxxxxx atau 62xxxxxxxxxx (Terhubung ke Floating WA Button)"
            required
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Alamat Kantor / Operasional</span>
            <textarea
              className="input !h-28 resize-none py-2 text-sm leading-relaxed"
              value={f.contact_address}
              onChange={(e) => setF({ ...f, contact_address: e.target.value })}
              placeholder="contoh: Jl. Jenderal Sudirman No. 10, Lantai 5, Jakarta Pusat 10220"
            />
            <span className="block text-xs text-slate-500">Alamat kantor atau lokasi operasional pengelola platform</span>
          </label>

          <div className="pt-2">
            <Button loading={saving} className="w-full sm:w-auto !py-3 !px-6 font-bold shadow-md">
              Simpan Perubahan Kontak
            </Button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Pratinjau Kontak Publik</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={12} /> Terhubung
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <WhatsAppIcon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">WhatsApp Resmi</p>
                  <p className="font-mono text-slate-600 truncate">{f.contact_phone || "Belum diatur"}</p>
                  {f.contact_phone && (
                    <a
                      href={previewWa}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      <span>Uji Buka Chat WA</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">Email Layanan</p>
                  <p className="text-slate-600 truncate">{f.contact_email || "Belum diatur"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">Alamat Operasional</p>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{f.contact_address || "Belum diatur"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-teal-50/70 border border-teal-200/60 p-3 text-[11px] text-teal-800 leading-relaxed">
              💡 <strong>Integrasi Otomatis:</strong> Mengubah nomor WhatsApp di sini akan langsung memperbarui tombol <em>Floating WhatsApp</em> di pojok kanan bawah halaman landing secara real-time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
