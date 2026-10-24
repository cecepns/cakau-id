import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Empty, Spinner } from "./ui";

const pageList = (page, total) => {
  const s = Math.max(1, Math.min(page - 2, total - 4));
  return Array.from({ length: Math.min(5, total) }, (_, i) => s + i);
};

export default function DataTable({ list, columns, toolbar, searchPlaceholder = "Cari...", emptyText }) {
  const { rows, pg, search, setSearch, setPage, limit, setLimit, loading, error } = list;
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
      </div>

      {loading ? <Spinner /> : error ? <p className="py-10 text-center text-sm text-red-600">{error}</p> : !rows.length ? <Empty text={emptyText} /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>{columns.map((c) => <th key={c.label} className="th">{c.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>{columns.map((c) => <td key={c.label} className="td">{c.render ? c.render(r) : r[c.key]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 p-4 text-sm sm:flex-row">
        <div className="flex items-center gap-2 text-slate-500">
          <span>Tampilkan</span>
          <select className="input !w-auto !py-1" value={limit} onChange={(e) => setLimit(+e.target.value)}>
            {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
          </select>
          <span>dari {pg.total} data</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn-ghost !px-2 !py-1.5" disabled={pg.page <= 1} onClick={() => setPage(pg.page - 1)} aria-label="Sebelumnya"><ChevronLeft size={16} /></button>
          {pageList(pg.page, pg.totalPages).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`h-8 min-w-8 rounded-lg px-2 text-sm ${n === pg.page ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{n}</button>
          ))}
          <button className="btn-ghost !px-2 !py-1.5" disabled={pg.page >= pg.totalPages} onClick={() => setPage(pg.page + 1)} aria-label="Berikutnya"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
