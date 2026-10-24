import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import ImagePicker from "@/components/ImagePicker";
import { Badge, Button, Field, Modal, confirmToast } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { api, FILE_URL } from "@/utils/api";
import { request, toForm } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { dateTime, rupiah } from "@/utils/format";

export default function Topups() {
  const { user, refresh } = useAuth();
  const admin = user.role === "admin";
  const [status, setStatus] = useState("");
  const list = usePaginated(API_ENDPOINTS.TOPUPS, { status });
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [f, setF] = useState({ amount: "", account_id: "" });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!admin) api.get(API_ENDPOINTS.TOPUP_ACCOUNTS, { params: { limit: 100 } }).then(({ data }) => setAccounts(data.data));
  }, [admin]);
  const acc = accounts.find((a) => String(a.id) === String(f.account_id));

  const submit = async (e) => {
    e.preventDefault();
    if (!files.length) return toast.error("Bukti transfer wajib diunggah");
    setSaving(true);
    const res = await request("post", API_ENDPOINTS.TOPUPS, toForm({ ...f, proof: files[0] }));
    setSaving(false);
    if (res) { setOpen(false); setF({ amount: "", account_id: "" }); setFiles([]); list.reload(); }
  };
  const review = async (t, st) => {
    if (!(await confirmToast(`${st === "approved" ? "Setujui" : "Tolak"} topup ${rupiah(t.amount)} dari ${t.user_name}?`))) return;
    if (await request("patch", API_ENDPOINTS.ADMIN.TOPUP_REVIEW(t.id), { status: st }, { success: false })) { toast.success("Topup diproses"); list.reload(); refresh(); }
  };

  const columns = [
    { label: "Tanggal", render: (t) => dateTime(t.created_at) },
    ...(admin ? [{ label: "Pengguna", render: (t) => <div><p className="font-medium">{t.user_name}</p><p className="text-xs text-slate-500">{t.user_phone}</p></div> }] : []),
    { label: "Rekening", key: "account_name" },
    { label: "Nominal", render: (t) => <span className="font-medium">{rupiah(t.amount)}</span> },
    { label: "Bukti", render: (t) => <img src={FILE_URL + t.proof} alt="Bukti" onClick={() => setPreview(t.proof)} className="h-12 w-12 cursor-pointer rounded border object-cover" /> },
    { label: "Status", render: (t) => <Badge value={t.status} /> },
    ...(admin ? [{ label: "Aksi", render: (t) => t.status === "pending" && <div className="flex gap-2"><button className="btn-primary !py-1" onClick={() => review(t, "approved")}>Setujui</button><button className="btn-ghost !py-1" onClick={() => review(t, "rejected")}>Tolak</button></div> }] : []),
  ];

  return (
    <>
      <DataTable list={list} columns={columns} searchPlaceholder="Cari nama atau rekening"
        toolbar={<>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="pending">Menunggu</option><option value="approved">Disetujui</option><option value="rejected">Ditolak</option></select>
          {!admin && <Button onClick={() => setOpen(true)}><Plus size={16} />Request topup</Button>}
        </>} />
      <Modal open={open} onClose={() => setOpen(false)} title="Request topup saldo">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Rekening tujuan"><select className="input" value={f.account_id} onChange={(e) => setF({ ...f, account_id: e.target.value })} required><option value="">Pilih rekening</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
          {acc && <div className="rounded-lg bg-slate-50 p-3 text-sm">{acc.type === "qris" ? <img src={FILE_URL + acc.image} alt="QRIS" className="mx-auto max-h-56" /> : <><p className="font-semibold">{acc.account_number}</p><p className="text-slate-500">a.n. {acc.account_holder}</p></>}</div>}
          <Field label="Nominal (Rp)" type="number" min="10000" step="1000" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} hint="Minimal Rp10.000" required />
          <Field label="Bukti transfer"><ImagePicker files={files} onFiles={setFiles} /></Field>
          <Button loading={saving} className="w-full">Kirim request</Button>
        </form>
      </Modal>
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Bukti transfer">{preview && <img src={FILE_URL + preview} alt="" className="w-full rounded-lg" />}</Modal>
    </>
  );
}
