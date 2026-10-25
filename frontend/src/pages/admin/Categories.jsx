import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import { Button, Field, Modal, confirmToast } from "@/components/ui";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";

const EMPTY = { name: "", slug: "" };

export default function Categories() {
  const list = usePaginated(API_ENDPOINTS.CATEGORIES);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const open = (c) => setForm(c ? { ...c } : EMPTY);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nama kategori wajib diisi");
    setSaving(true);
    const res = form.id
      ? await request("put", API_ENDPOINTS.CATEGORY(form.id), form, {
          success: false,
        })
      : await request("post", API_ENDPOINTS.CATEGORIES, form, {
          success: false,
        });
    setSaving(false);
    if (res) {
      toast.success(form.id ? "Kategori diperbarui" : "Kategori ditambahkan");
      setForm(null);
      list.reload();
    }
  };

  const remove = async (c) => {
    if (Number(c.total_products) > 0) {
      return toast.error(
        `Kategori tidak dapat dihapus karena memiliki ${c.total_products} produk.`,
      );
    }
    if (!(await confirmToast(`Hapus kategori "${c.name}"?`))) return;
    const res = await request("delete", API_ENDPOINTS.CATEGORY(c.id), null, {
      success: false,
    });
    if (res) {
      toast.success("Kategori dihapus");
      list.reload();
    }
  };

  const columns = [
    {
      label: "Kategori",
      render: (c) => (
        <div>
          <p className="font-semibold text-slate-800">{c.name}</p>
          <p className="text-xs text-slate-400 font-mono">slug: {c.slug}</p>
        </div>
      ),
    },
    {
      label: "Jumlah Produk",
      render: (c) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {c.total_products || 0} produk
        </span>
      ),
    },
    {
      label: "Aksi",
      render: (c) => (
        <div className="flex gap-2">
          <button
            className="btn-ghost !p-2"
            onClick={() => open(c)}
            aria-label="Edit kategori"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn-ghost !p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => remove(c)}
            aria-label="Hapus kategori"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        list={list}
        columns={columns}
        searchPlaceholder="Cari nama atau slug kategori..."
        emptyText="Belum ada kategori produk."
        toolbar={
          <Button onClick={() => open()}>
            <Plus size={16} />
            <span>Tambah Kategori</span>
          </Button>
        }
      />

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit Kategori Produk" : "Tambah Kategori Baru"}
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <Field
              label="Nama Kategori"
              placeholder="Contoh: Makanan / Jajanan"
              value={form.name}
              onChange={set("name")}
              required
            />
            <Field
              label="Slug (Opsional)"
              placeholder="Otomatis jika kosong, contoh: makanan-jajanan"
              value={form.slug || ""}
              onChange={set("slug")}
              hint="Digunakan untuk URL dan filter query"
            />

            <Button loading={saving} className="w-full">
              {form.id ? "Perbarui Kategori" : "Simpan Kategori"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
