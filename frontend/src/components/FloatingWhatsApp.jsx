import { useEffect, useState, useRef } from "react";
import { X, Mail, MapPin, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { waLink } from "@/utils/format";

export default function FloatingWhatsApp({
  phone: propPhone,
  email: propEmail,
  address: propAddress,
}) {
  const [contact, setContact] = useState({
    phone: propPhone || "",
    email: propEmail || "",
    address: propAddress || "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Sync props and fetch settings if needed
  useEffect(() => {
    if (propPhone) setContact((c) => ({ ...c, phone: propPhone }));
    if (propEmail) setContact((c) => ({ ...c, email: propEmail }));
    if (propAddress) setContact((c) => ({ ...c, address: propAddress }));

    if (!propPhone || !propEmail || !propAddress) {
      api.get(API_ENDPOINTS.SETTINGS)
        .then(({ data }) => {
          if (data?.data) {
            setContact((c) => ({
              phone: c.phone || data.data.contact_phone || "081234567890",
              email: c.email || data.data.contact_email || "support@cakau.id",
              address: c.address || data.data.contact_address || "Jl. Jendral Sudirman No. 123, Jakarta Pusat",
            }));
          }
        })
        .catch(() => {});
    }
  }, [propPhone, propEmail, propAddress]);

  // Handle click outside & escape key to dismiss popover
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const targetPhone = contact.phone || "081234567890";
  const targetEmail = contact.email || "support@cakau.id";
  const targetAddress = contact.address || "Jl. Jendral Sudirman No. 123, Jakarta Pusat";

  const waUrl = waLink(
    targetPhone,
    "Halo Admin Cakau ID, saya butuh informasi / bantuan mengenai layanan marketplace."
  );

  return (
    <aside aria-label="Kontak dan WhatsApp" className="fixed bottom-6 right-6 z-50">
      {/* Popover Contact Us */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-labelledby="contact-popover-title"
          className="absolute bottom-16 right-0 mb-3 w-[320px] sm:w-[350px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-5 text-white">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup popover"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
              <Sparkles size={14} />
              <span>Bantuan & Layanan</span>
            </div>
            <h2 id="contact-popover-title" className="mt-1 text-base sm:text-lg font-bold tracking-tight text-white">
              Hubungi Kami
            </h2>
            <p className="mt-0.5 text-xs text-emerald-100 leading-relaxed">
              Ada pertanyaan? Tim Cakau ID siap membantu Anda.
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100 backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Online • Respon Cepat</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3.5 bg-white">
            {/* Direct WhatsApp Action Button */}
            <div>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 shadow-md shadow-emerald-600/25 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                <WhatsAppIcon size={20} colored={false} className="text-white shrink-0" />
                <span>Chat via WhatsApp</span>
              </a>
              <div className="mt-1.5 text-center text-[11px] text-slate-400 font-mono">
                {targetPhone}
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-0.5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-2 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Kontak Alternatif
              </span>
            </div>

            {/* Email Support Card */}
            <a
              href={`mailto:${targetEmail}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition group text-slate-700"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 shrink-0 group-hover:bg-teal-100 transition">
                <Mail size={16} />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[10px] font-medium text-slate-400">Email Resmi</div>
                <div className="text-xs font-semibold text-slate-700 truncate group-hover:text-brand-700">
                  {targetEmail}
                </div>
              </div>
            </a>

            {/* Office Address Card */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-slate-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                <MapPin size={16} />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[10px] font-medium text-slate-400">Alamat Kantor</div>
                <div className="text-xs text-slate-600 leading-snug line-clamp-2">
                  {targetAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button (Icon WhatsApp only, no text) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-slate-800 shadow-slate-800/40 rotate-90"
            : "bg-[#25D366] hover:bg-[#20bd5a] shadow-emerald-600/40 hover:shadow-emerald-600/60"
        }`}
        title={isOpen ? "Tutup Kontak" : "Hubungi Kami (WhatsApp)"}
        aria-label={isOpen ? "Tutup Kontak" : "Hubungi Kami via WhatsApp"}
      >
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
        )}
        {isOpen ? (
          <X size={24} className="text-white transition-transform duration-200" />
        ) : (
          <WhatsAppIcon size={28} colored={false} className="relative z-10 shrink-0 text-white" />
        )}
      </button>
    </aside>
  );
}
