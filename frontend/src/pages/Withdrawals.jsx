import { useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import { Badge, Button, Field, Modal, confirmToast } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { dateTime, rupiah } from "@/utils/format";

const EMPTY = { amount: "", bank_name: "", account_number: "", account_holder: "" };

export default function Withdrawals() {
  const { user, refresh } = useAuth();
  const admin = user.role === "admin";
  const [status, setStatus] = useState("");
  const list = usePaginated(API_ENDPOINTS.WITHDRAWALS, { status });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    const res = await request("post", API_ENDPOINTS.WITHDRAWALS, f);
    setSaving(false);
    if (res) { setOpen(false); setF(EMPTY); list.reload(); refresh(); }
  };
  const review = async (w, st) => {
    if (!(await confirmToast(`${st === "approved" ? "Setujui" : "Tolak"} penarikan ${rupiah(w.amount)}?`))) return;
    if (await request("patch", API_ENDPOINTS.ADMIN.WITHDRAWAL_REVIEW(w.id), { status: st }, { success: false })) { toast.success("Penarikan diproses"); list.reload(); }
  };

  const columns = [
    { label: "Tanggal", render: (w) => dateTime(w.created_at) },
    ...(admin ? [{ label: "Pengguna", render: (w) => <div><p className="font-medium">{w.user_name}</p><p className="text-xs text-slate-500">{w.user_role} · {w.user_phone}</p></div> }] : []),
    { label: "Rekening tujuan", render: (w) => <div><p>{w.bank_name} {w.account_number}</p><p className="text-xs text-slate-500">a.n. {w.account_holder}</p></div> },
    { label: "Nominal", render: (w) => <span className="font-medium">{rupiah(w.amount)}</span> },
    { label: "Status", render: (w) => <Badge value={w.status} /> },
    ...(admin ? [{ label: "Aksi", render: (w) => w.status === "pending" && <div className="flex gap-2"><button className="btn-primary !py-1" onClick={() => review(w, "approved")}>Setujui</button><button className="btn-ghost !py-1" onClick={() => review(w, "rejected")}>Tolak</button></div> }] : []),
  ];

  return (
    <>
      <DataTable list={list} columns={columns} searchPlaceholder="Cari nama atau rekening"
        toolbar={<>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="pending">Menunggu</option><option value="approved">Disetujui</option><option value="rejected">Ditolak</option></select>
          {!admin && <Button onClick={() => setOpen(true)}><Plus size={16} />Tarik saldo</Button>}
        </>} />
      <Modal open={open} onClose={() => setOpen(false)} title="Request penarikan saldo">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nominal (Rp)" type="number" min="10000" value={f.amount} onChange={set("amount")} hint={`Saldo tersedia ${rupiah(user.balance)}`} required />
          <Field label="Nama bank / e-wallet" value={f.bank_name} onChange={set("bank_name")} required />
          <Field label="Nomor rekening" value={f.account_number} onChange={set("account_number")} required />
          <Field label="Atas nama" value={f.account_holder} onChange={set("account_holder")} required />
          <Button loading={saving} className="w-full">Kirim request</Button>
        </form>
      </Modal>
    </>
  );
}
