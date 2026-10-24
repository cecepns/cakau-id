import { useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, X, Inbox } from "lucide-react";

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2>{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Tutup"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children, ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children || <input className="input" {...props} />}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Button({ loading, children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`btn-${variant} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

const TONES = {
  pending: "bg-amber-50 text-amber-700", processing: "bg-blue-50 text-blue-700", ready: "bg-indigo-50 text-indigo-700",
  shipping: "bg-sky-50 text-sky-700", delivered: "bg-violet-50 text-violet-700", completed: "bg-emerald-50 text-emerald-700",
  approved: "bg-emerald-50 text-emerald-700", active: "bg-emerald-50 text-emerald-700", cancelled: "bg-slate-100 text-slate-600",
  rejected: "bg-red-50 text-red-700", blocked: "bg-red-50 text-red-700",
};
const LABELS = {
  pending: "Menunggu", processing: "Diproses", ready: "Siap diambil", shipping: "Dikirim", delivered: "Tiba", completed: "Selesai",
  approved: "Disetujui", rejected: "Ditolak", cancelled: "Dibatalkan", active: "Aktif", blocked: "Diblokir",
  admin: "Admin", seller: "Seller", courier: "Kurir", buyer: "Pembeli",
};
export const label = (s) => LABELS[s] || s;
export const Badge = ({ value }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[value] || "bg-slate-100 text-slate-700"}`}>{label(value)}</span>
);

export const Spinner = () => <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" /></div>;
export const Empty = ({ text = "Belum ada data" }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-slate-400"><Inbox size={32} /><p className="text-sm">{text}</p></div>
);

export const confirmToast = (message) =>
  new Promise((resolve) => {
    toast.custom((t) => (
      <div className="w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <p className="text-sm text-slate-800">{message}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost !py-1.5" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Batal</button>
          <button className="btn-primary !py-1.5" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Ya, lanjutkan</button>
        </div>
      </div>
    ), { duration: Infinity });
  });

export const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("GPS tidak didukung browser ini"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude.toFixed(7), lng: p.coords.longitude.toFixed(7) }),
      () => reject(new Error("Izin lokasi ditolak. Aktifkan GPS lalu coba lagi")),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });

export function WhatsAppIcon({ className = "", size = 16, colored = true, ...props }) {
  if (colored) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={`shrink-0 inline-block ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fill="#25D366"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2Z"
        />
        <path
          fill="#FFFFFF"
          d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51-.17 0-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
        />
      </svg>
    );
  }

  // Official monochrome cutout glyph (bubble outline + phone handset in currentColor, transparent between)
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={`shrink-0 inline-block ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
