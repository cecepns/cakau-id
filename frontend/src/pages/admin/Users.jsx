import { useState } from "react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import { Badge, confirmToast, WhatsAppIcon } from "@/components/ui";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, waLink } from "@/utils/format";

export default function Users() {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const list = usePaginated(API_ENDPOINTS.ADMIN.USERS, { role, status });

  const setStatusAction = async (u, newStatus) => {
    const text = { active: u.status === "pending" ? `Setujui kurir ${u.name}?` : `Aktifkan ${u.name}?`, blocked: `Blokir ${u.name}?` }[newStatus];
    if (!(await confirmToast(text))) return;
    if (await request("patch", API_ENDPOINTS.ADMIN.USER_STATUS(u.id), { status: newStatus }, { success: false })) list.reload();
  };

  const columns = [
    { label: "Nama", render: (u) => <div><p className="font-medium">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div> },
    { label: "Role", render: (u) => <Badge value={u.role} /> },
    { label: "WhatsApp", render: (u) => <a href={waLink(u.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800"><WhatsAppIcon size={14} />{u.phone}</a> },
    { label: "Saldo", render: (u) => rupiah(u.balance) },
    { label: "Status", render: (u) => <Badge value={u.status} /> },
    { label: "Aksi", render: (u) => u.role === "admin" ? null : u.status === "blocked" || u.status === "pending"
      ? <button className="btn-primary !py-1" onClick={() => setStatusAction(u, "active")}>{u.status === "pending" ? "Setujui" : "Aktifkan"}</button>
      : <button className="btn-danger !py-1" onClick={() => setStatusAction(u, "blocked")}>Blokir</button> },
  ];

  return (
    <DataTable list={list} columns={columns} searchPlaceholder="Cari nama, email, WhatsApp"
      toolbar={
        <>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="active">Aktif</option>
            <option value="blocked">Diblokir</option>
          </select>
          <select className="input !w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Semua role</option>
            <option value="seller">Seller</option>
            <option value="courier">Kurir</option>
            <option value="buyer">Pembeli</option>
          </select>
        </>
      } />
  );
}
