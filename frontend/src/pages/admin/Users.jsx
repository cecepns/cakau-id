import { useState } from "react";
import toast from "react-hot-toast";
import {
  Pencil,
  KeyRound,
  Check,
  Ban,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import usePaginated from "@/hooks/usePaginated";
import DataTable from "@/components/DataTable";
import {
  Badge,
  Button,
  Field,
  Modal,
  confirmToast,
  WhatsAppIcon,
} from "@/components/ui";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, waLink } from "@/utils/format";

export default function Users() {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const list = usePaginated(API_ENDPOINTS.ADMIN.USERS, { role, status });

  // Edit User State
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Change Password State
  const [pwdForm, setPwdForm] = useState(null);
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const setStatusAction = async (u, newStatus) => {
    const text = {
      active:
        u.status === "pending"
          ? `Setujui kurir ${u.name}?`
          : `Aktifkan user ${u.name}?`,
      blocked: `Blokir user ${u.name}?`,
    }[newStatus];
    if (!(await confirmToast(text))) return;
    if (
      await request(
        "patch",
        API_ENDPOINTS.ADMIN.USER_STATUS(u.id),
        { status: newStatus },
        { success: false },
      )
    ) {
      toast.success(
        newStatus === "active"
          ? `User ${u.name} telah diaktifkan`
          : `User ${u.name} telah diblokir`,
      );
      list.reload();
    }
  };

  const openEdit = (u) => {
    setEditForm({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "buyer",
      status: u.status || "active",
      store_name: u.store_name || "",
      balance: u.balance != null ? u.balance : 0,
      password: "",
    });
  };

  const handleEditChange = (k) => (e) => {
    setEditForm({ ...editForm, [k]: e.target.value });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || editForm.name.trim().length < 3) {
      return toast.error("Nama minimal 3 karakter");
    }
    if (!/^\S+@\S+\.\S+$/.test(editForm.email.trim())) {
      return toast.error("Format email tidak valid");
    }
    if (!editForm.phone.trim()) {
      return toast.error("Nomor WhatsApp wajib diisi");
    }
    if (editForm.password && editForm.password.length < 6) {
      return toast.error("Password minimal 6 karakter jika ingin diubah");
    }

    setSavingEdit(true);
    const res = await request(
      "put",
      API_ENDPOINTS.ADMIN.USER(editForm.id),
      editForm,
      { success: false },
    );
    setSavingEdit(false);

    if (res) {
      toast.success("Data user berhasil diperbarui");
      setEditForm(null);
      list.reload();
    }
  };

  const openPassword = (u) => {
    setPwdForm({
      id: u.id,
      name: u.name,
      password: "",
      confirmPassword: "",
    });
    setShowPwd(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.password || pwdForm.password.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }
    if (pwdForm.password !== pwdForm.confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok");
    }

    setSavingPwd(true);
    const res = await request(
      "patch",
      API_ENDPOINTS.ADMIN.USER_PASSWORD(pwdForm.id),
      { password: pwdForm.password },
      { success: false },
    );
    setSavingPwd(false);

    if (res) {
      toast.success(`Password untuk ${pwdForm.name} berhasil diubah`);
      setPwdForm(null);
    }
  };

  const columns = [
    {
      label: "Nama",
      render: (u) => (
        <div>
          <p className="font-semibold text-slate-800">{u.name}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
          {u.store_name && u.role === "seller" && (
            <p className="text-xs text-brand-600 font-medium mt-0.5">
              Toko: {u.store_name}
            </p>
          )}
        </div>
      ),
    },
    { label: "Role", render: (u) => <Badge value={u.role} /> },
    {
      label: "WhatsApp",
      render: (u) => (
        <a
          href={waLink(u.phone)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800"
        >
          <WhatsAppIcon size={14} />
          {u.phone}
        </a>
      ),
    },
    { label: "Saldo", render: (u) => rupiah(u.balance) },
    { label: "Status", render: (u) => <Badge value={u.status} /> },
    {
      label: "Aksi",
      render: (u) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Edit Data */}
          <button
            className="btn-ghost !p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50"
            onClick={() => openEdit(u)}
            title="Edit Data User"
            aria-label="Edit User"
          >
            <Pencil size={15} />
          </button>

          {/* Ganti Password */}
          <button
            className="btn-ghost !p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
            onClick={() => openPassword(u)}
            title="Ganti Password"
            aria-label="Ganti Password"
          >
            <KeyRound size={15} />
          </button>

          {/* Toggle Status */}
          {u.role !== "admin" && (
            <>
              {u.status === "pending" && (
                <button
                  className="btn-primary !py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                  onClick={() => setStatusAction(u, "active")}
                  title="Setujui Kurir"
                >
                  <UserCheck size={13} />
                  <span>Setujui</span>
                </button>
              )}
              {u.status === "blocked" && (
                <button
                  className="btn-primary !py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                  onClick={() => setStatusAction(u, "active")}
                  title="Aktifkan User"
                >
                  <Check size={13} />
                  <span>Aktifkan</span>
                </button>
              )}
              {u.status === "active" && (
                <button
                  className="btn-danger !py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                  onClick={() => setStatusAction(u, "blocked")}
                  title="Blokir User"
                >
                  <Ban size={13} />
                  <span>Blokir</span>
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        list={list}
        columns={columns}
        searchPlaceholder="Cari nama, email, WhatsApp, toko..."
        toolbar={
          <>
            <select
              className="input !w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua status</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="active">Aktif</option>
              <option value="blocked">Diblokir</option>
            </select>
            <select
              className="input !w-auto"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Semua role</option>
              <option value="seller">Seller</option>
              <option value="courier">Kurir</option>
              <option value="buyer">Pembeli</option>
            </select>
          </>
        }
      />

      {/* Modal Edit User */}
      <Modal
        open={!!editForm}
        onClose={() => setEditForm(null)}
        title={editForm ? `Edit User: ${editForm.name}` : "Edit User"}
        wide
      >
        {editForm && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nama Lengkap"
                value={editForm.name}
                onChange={handleEditChange("name")}
                required
              />
              <Field
                label="Email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange("email")}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="No. WhatsApp"
                value={editForm.phone}
                onChange={handleEditChange("phone")}
                placeholder="Contoh: 08123456789"
                required
              />
              <Field
                label="Saldo (Rp)"
                type="number"
                min="0"
                value={editForm.balance}
                onChange={handleEditChange("balance")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Role">
                <select
                  className="input"
                  value={editForm.role}
                  onChange={handleEditChange("role")}
                  disabled={editForm.role === "admin"}
                >
                  <option value="buyer">Pembeli (Buyer)</option>
                  <option value="seller">Penjual (Seller)</option>
                  <option value="courier">Kurir (Courier)</option>
                  {editForm.role === "admin" && (
                    <option value="admin">Administrator</option>
                  )}
                </select>
              </Field>

              <Field label="Status Akun">
                <select
                  className="input"
                  value={editForm.status}
                  onChange={handleEditChange("status")}
                  disabled={editForm.role === "admin"}
                >
                  <option value="active">Aktif</option>
                  <option value="pending">Menunggu Persetujuan</option>
                  <option value="blocked">Diblokir</option>
                </select>
              </Field>
            </div>

            {editForm.role === "seller" && (
              <Field
                label="Nama Toko"
                value={editForm.store_name}
                onChange={handleEditChange("store_name")}
                placeholder="Nama toko penjual"
              />
            )}

            <Field
              label="Password Baru (Opsional)"
              type="password"
              value={editForm.password}
              onChange={handleEditChange("password")}
              placeholder="Kosongkan jika tidak ingin mengubah password"
              hint="Minimal 6 karakter jika diisi"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditForm(null)}
              >
                Batal
              </button>
              <Button loading={savingEdit}>Simpan Perubahan</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Ganti Password */}
      <Modal
        open={!!pwdForm}
        onClose={() => setPwdForm(null)}
        title={pwdForm ? `Ganti Password: ${pwdForm.name}` : "Ganti Password"}
      >
        {pwdForm && (
          <form onSubmit={savePassword} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
              <p>
                Anda akan mengganti password untuk user:{" "}
                <strong className="text-slate-800">{pwdForm.name}</strong>
              </p>
            </div>

            <Field label="Password Baru">
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="input pr-10"
                  value={pwdForm.password}
                  onChange={(e) =>
                    setPwdForm({ ...pwdForm, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Konfirmasi Password Baru">
              <input
                type={showPwd ? "text" : "password"}
                className="input"
                value={pwdForm.confirmPassword}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
                }
                placeholder="Ulangi password baru"
                required
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPwdForm(null)}
              >
                Batal
              </button>
              <Button loading={savingPwd} variant="primary">
                Ganti Password
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
