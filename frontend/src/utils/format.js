export const rupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
export const dateTime = (d) => new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
export const waLink = (p, text) => {
  const num = String(p || "").replace(/^0/, "62").replace(/\D/g, "");
  return text ? `https://wa.me/${num}?text=${encodeURIComponent(text)}` : `https://wa.me/${num}`;
};
export const stripHtml = (h) => (h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export const calcKm = (a, b, c, d) => {
  if (a == null || b == null || c == null || d == null || a === "" || b === "" || c === "" || d === "") return 0;
  const r = (x) => (x * Math.PI) / 180, dl = r(c - a), dg = r(d - b);
  const x = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 100) / 100;
};

