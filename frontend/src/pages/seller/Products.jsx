import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import toast from "react-hot-toast";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import ImagePicker from "@/components/ImagePicker";
import { Button, Field, Modal, confirmToast } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { api, FILE_URL } from "@/utils/api";
import { request, toForm } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, stripHtml } from "@/utils/format";

const EMPTY = {
  name: "",
  category_id: "",
  price: "",
  stock: "",
  operational_hours: "",
  description: "",
  images: [],
};
const QUILL = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

export default function Products() {
  const { user } = useAuth();
  const ready = user.store_name && user.lat != null;
  const list = usePaginated(API_ENDPOINTS.PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(API_ENDPOINTS.CATEGORIES, { params: { limit: 100 } })
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  const open = (p) => {
    setForm(
      p
        ? {
            ...p,
            category_id: p.category_id || "",
            images: p.images || [],
            operational_hours:
              p.operational_hours || user.operational_hours || "",
          }
        : {
            ...EMPTY,
            operational_hours: user.operational_hours || "",
          },
    );
    setFiles([]);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!form.category_id) return toast.error("Kategori produk wajib dipilih");
    if (!form.images.length && !files.length)
      return toast.error("Minimal 1 gambar produk");
    setSaving(true);
    const body = toForm({
      name: form.name,
      category_id: form.category_id,
      price: form.price,
      stock: form.stock,
      operational_hours: form.operational_hours,
      description: form.description,
      keep: JSON.stringify(form.images),
      images: files,
    });
    const res = form.id
      ? await request("put", API_ENDPOINTS.PRODUCT(form.id), body, {
          success: false,
        })
      : await request("post", API_ENDPOINTS.PRODUCTS, body, { success: false });
    setSaving(false);
    if (res) {
      toast.success("Produk disimpan");
      setForm(null);
      list.reload();
    }
  };
  const remove = async (p) => {
    if (!(await confirmToast(`Hapus produk ${p.name}?`))) return;
    if (
      await request("delete", API_ENDPOINTS.PRODUCT(p.id), null, {
        success: false,
      })
    ) {
      toast.success("Produk dihapus");
      list.reload();
    }
  };

  const columns = [
    {
      label: "Produk",
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={FILE_URL + p.images?.[0]}
            alt=""
            className="h-12 w-12 rounded-lg border object-cover"
          />
          <div>
            <p className="font-medium">{p.name}</p>
            {p.operational_hours && (
              <p className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                <Clock size={11} className="shrink-0" />
                <span>{p.operational_hours}</span>
              </p>
            )}
            <p className="line-clamp-1 max-w-xs text-xs text-slate-500">
              {stripHtml(p.description)}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: "Kategori",
      render: (p) => (
        <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
          {p.category_name || "Lainnya"}
        </span>
      ),
    },
    { label: "Harga", render: (p) => rupiah(p.price) },
    { label: "Stok", key: "stock" },
    {
      label: "Aksi",
      render: (p) => (
        <div className="flex gap-2">
          <button
            className="btn-ghost !p-2"
            onClick={() => open(p)}
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn-ghost !p-2 text-red-600"
            onClick={() => remove(p)}
            aria-label="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {!ready && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Lokasi toko belum diatur.{" "}
          <Link to="/store" className="font-semibold underline">
            Atur lokasi toko
          </Link>{" "}
          untuk mulai berjualan.
        </p>
      )}
      <DataTable
        list={list}
        columns={columns}
        searchPlaceholder="Cari produk"
        emptyText="Belum ada produk. Tambahkan produk pertama Anda."
        toolbar={
          <Button disabled={!ready} onClick={() => open()}>
            <Plus size={16} />
            Tambah produk
          </Button>
        }
      />
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit produk" : "Tambah produk"}
        wide
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <Field
              label="Nama produk"
              value={form.name}
              onChange={set("name")}
              required
            />
            <Field label="Kategori Produk" required>
              <select
                className="input"
                value={form.category_id}
                onChange={set("category_id")}
                required
              >
                <option value="">-- Pilih Kategori Produk --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Harga (Rp)"
                type="number"
                min="100"
                value={form.price}
                onChange={set("price")}
                required
              />
              <Field
                label="Stok"
                type="number"
                min="0"
                value={form.stock}
                onChange={set("stock")}
                required
              />
            </div>
            <Field
              label="Jam Operasional Toko"
              value={form.operational_hours || ""}
              onChange={set("operational_hours")}
              placeholder="Contoh: 08:00 - 21:00 WIB (Senin - Sabtu)"
              hint="Jam operasional toko untuk produk ini agar pembeli mengetahui estimasi waktu pesanan diproses."
            />
            <Field label="Gambar (maks. 5)">
              <ImagePicker
                multiple
                existing={form.images}
                onExisting={(images) => setForm({ ...form, images })}
                files={files}
                onFiles={setFiles}
              />
            </Field>
            <Field label="Deskripsi">
              <ReactQuill
                theme="snow"
                modules={QUILL}
                value={form.description || ""}
                onChange={(v) => setForm((s) => ({ ...s, description: v }))}
              />
            </Field>
            <Button loading={saving} className="w-full">
              Simpan produk
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
