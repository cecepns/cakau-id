import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { Button, Field } from "@/components/ui";

const ROLES = [["buyer", "Pembeli"], ["seller", "Seller"], ["courier", "Kurir"]];

export default function Auth({ register }) {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", role: "buyer" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = register
      ? f
      : { email: f.email, phone: f.email, password: f.password };
    const res = await request("post", register ? API_ENDPOINTS.AUTH.REGISTER : API_ENDPOINTS.AUTH.LOGIN, payload);
    setLoading(false);
    if (!res) return;
    if (register) nav("/login");
    else login(res.token, res.data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xl shadow-slate-100">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-4 transition">
            ← Kembali ke Beranda
          </Link>
          <div className="mb-2">
            <img src="/logo.png" alt="Cakau ID" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">{register ? "Buat Akun Baru" : "Masuk ke Akun Anda"}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {register ? "Pilih peran Anda dan lengkapi data" : "Gunakan Email atau Nomor WhatsApp / HP Anda"}
          </p>
        </div>
        {register && (
          <>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {ROLES.map(([v, t]) => (
                <button type="button" key={v} onClick={() => setF({ ...f, role: v })}
                  className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${f.role === v ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{t}</button>
              ))}
            </div>
            {f.role === "courier" && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">Akun kurir aktif setelah disetujui admin.</p>}
            <Field label="Nama lengkap" value={f.name} onChange={set("name")} placeholder="Nama lengkap Anda" required />
            <Field label="Nomor WhatsApp" value={f.phone} onChange={set("phone")} placeholder="08123456789" inputMode="tel" required />
          </>
        )}
        <Field
          label={register ? "Email" : "Email atau Nomor WhatsApp / HP"}
          type={register ? "email" : "text"}
          placeholder={register ? "nama@email.com" : "081234567890 atau email"}
          value={f.email}
          onChange={set("email")}
          required
        />
        <Field label="Password" type="password" value={f.password} onChange={set("password")} placeholder="••••••••" minLength={6} required />
        <Button loading={loading} className="w-full !py-3 text-sm font-bold rounded-xl shadow-md hover:shadow-lg">{register ? "Daftar Akun" : "Masuk"}</Button>

        {!register && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-600 space-y-2 mt-4">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Akun Demo Cepat:</span>
              <span className="text-[10px] text-slate-400">Klik untuk isi instan</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setF({ ...f, email: "081234567890", password: "admin12345" })}
                className="flex flex-col text-left rounded-xl border border-slate-200 bg-white p-2 hover:border-brand-500 hover:bg-brand-50/40 transition shadow-2xs"
              >
                <span className="font-bold text-slate-900">👑 Admin</span>
                <span className="text-[11px] text-slate-500 font-mono">081234567890</span>
              </button>
              <button
                type="button"
                onClick={() => setF({ ...f, email: "081298765432", password: "password123" })}
                className="flex flex-col text-left rounded-xl border border-slate-200 bg-white p-2 hover:border-brand-500 hover:bg-brand-50/40 transition shadow-2xs"
              >
                <span className="font-bold text-slate-900">🏪 Seller</span>
                <span className="text-[11px] text-slate-500 font-mono">081298765432</span>
              </button>
              <button
                type="button"
                onClick={() => setF({ ...f, email: "081211112222", password: "password123" })}
                className="flex flex-col text-left rounded-xl border border-slate-200 bg-white p-2 hover:border-brand-500 hover:bg-brand-50/40 transition shadow-2xs"
              >
                <span className="font-bold text-slate-900">🛍️ Pembeli</span>
                <span className="text-[11px] text-slate-500 font-mono">081211112222</span>
              </button>
              <button
                type="button"
                onClick={() => setF({ ...f, email: "081233334444", password: "password123" })}
                className="flex flex-col text-left rounded-xl border border-slate-200 bg-white p-2 hover:border-brand-500 hover:bg-brand-50/40 transition shadow-2xs"
              >
                <span className="font-bold text-slate-900">🛵 Kurir</span>
                <span className="text-[11px] text-slate-500 font-mono">081233334444</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 pt-1">
          {register ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <Link to={register ? "/login" : "/register"} className="font-bold text-brand-600 hover:text-brand-700">{register ? "Masuk" : "Daftar Sekarang"}</Link>
        </p>
      </form>
    </div>
  );
}
