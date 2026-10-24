import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import ImagePicker from "@/components/ImagePicker";
import { Badge, Button, Field, Modal, confirmToast } from "@/components/ui";
import { request, toForm } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { FILE_URL } from "@/utils/api";

const EMPTY = { type: "bank", name: "", account_number: "", account_holder: "", active: "1" };

export default function TopupAccounts() {
  const list = usePaginated(API_ENDPOINTS.TOPUP_ACCOUNTS);
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const open = (a) => { setForm(a ? { ...a, active: String(a.active) } : EMPTY); setFiles([]); };

  const save = async (e) => {
    e.preventDefault();
    if (form.type === "qris" && !form.id && !files.length) return toast.error("Gambar QRIS wajib diunggah");
    setSaving(true);
    const body = toForm({ ...form, image: files[0] });
    const res = form.id ? await request("put", API_ENDPOINTS.ADMIN.TOPUP_ACCOUNT(form.id), body, { success: false }) : await request("post", API_ENDPOINTS.ADMIN.TOPUP_ACCOUNTS, body, { success: false });
    setSaving(false);
    if (res) { toast.success("Rekening disimpan"); setForm(null); list.reload(); }
  };
  const remove = async (a) => {
    if (!(await confirmToast(`Hapus rekening ${a.name}?`))) return;
    if (await request("delete", API_ENDPOINTS.ADMIN.TOPUP_ACCOUNT(a.id), null, { success: false })) { toast.success("Rekening dihapus"); list.reload(); }
  };

  const columns = [
    { label: "Nama", render: (a) => <span className="font-medium">{a.name}</span> },
    { label: "Tipe", render: (a) => (a.type === "qris" ? "QRIS" : "Transfer bank") },
    { label: "Detail", render: (a) => a.type === "qris" ? <img src={FILE_URL + a.image} alt="QRIS" className="h-16 w-16 rounded border object-cover" /> : <div><p>{a.account_number}</p><p className="text-xs text-slate-500">{a.account_holder}</p></div> },
    { label: "Status", render: (a) => <Badge value={a.active ? "active" : "blocked"} /> },
    { label: "Aksi", render: (a) => <div className="flex gap-2"><button className="btn-ghost !p-2" onClick={() => open(a)} aria-label="Edit"><Pencil size={14} /></button><button className="btn-ghost !p-2 text-red-600" onClick={() => remove(a)} aria-label="Hapus"><Trash2 size={14} /></button></div> },
  ];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <DataTable list={list} columns={columns} toolbar={<Button onClick={() => open()}><Plus size={16} />Tambah rekening</Button>} />
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit rekening" : "Tambah rekening"}>
        {form && (
          <form onSubmit={save} className="space-y-4">
            <Field label="Tipe"><select className="input" value={form.type} onChange={set("type")}><option value="bank">Transfer bank</option><option value="qris">QRIS</option></select></Field>
            <Field label="Nama (mis. BCA / QRIS Cakau)" value={form.name} onChange={set("name")} required />
            {form.type === "bank" ? (
              <>
                <Field label="Nomor rekening" value={form.account_number || ""} onChange={set("account_number")} required />
                <Field label="Atas nama" value={form.account_holder || ""} onChange={set("account_holder")} required />
              </>
            ) : (
              <Field label="Gambar QRIS"><ImagePicker existing={form.image ? [form.image] : []} onExisting={() => setForm({ ...form, image: null })} files={files} onFiles={setFiles} /></Field>
            )}
            <Field label="Status"><select className="input" value={form.active} onChange={set("active")}><option value="1">Aktif</option><option value="0">Nonaktif</option></select></Field>
            <Button loading={saving} className="w-full">Simpan rekening</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
