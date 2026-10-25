import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Wallet,
  Users,
  Settings,
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Store,
  ShoppingBag,
  Truck,
  ClipboardList,
  Home,
  PhoneCall,
  Tags,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { rupiah } from "@/utils/format";
import { label } from "./ui";

const MENUS = {
  admin: [
    ["/users", "Pengguna", Users],
    ["/categories", "Kategori Produk", Tags],
    ["/settings", "Pengaturan", Settings],
    ["/contact", "Kelola Kontak", PhoneCall],
    ["/accounts", "Rekening topup", Landmark],
    ["/topups", "Request topup", ArrowDownToLine],
    ["/withdrawals", "Request penarikan", ArrowUpFromLine],
    ["/orders", "Pesanan", ClipboardList],
  ],
  seller: [
    ["/seller/products", "Kelola Produk", Package],
    ["/store", "Toko", Store],
    ["/orders", "Pesanan", ClipboardList],
    ["/withdrawals", "Penarikan", ArrowUpFromLine],
  ],
  courier: [
    ["/orders", "Pengiriman", Truck],
    ["/withdrawals", "Penarikan", ArrowUpFromLine],
  ],
  buyer: [
    ["/orders", "Pesanan Saya", ClipboardList],
    ["/topups", "Topup Saldo", Wallet],
  ],
};

export default function Layout() {
  const { user, logout, refresh } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const menu = MENUS[user.role] || [];
  const title = menu.find(([to]) => pathname.startsWith(to))?.[1] || "";

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  return (
    <div className="min-h-screen bg-white">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/" className="flex items-center" title="Ke Beranda">
            <img
              src="/logo.png"
              alt="Cakau ID"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-3 pb-2">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Home size={16} className="text-brand-600" />
            <span>Lihat Marketplace</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {menu.map(([to, text, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"}`
              }
            >
              <Icon size={18} />
              {text}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="truncate text-sm font-medium text-slate-900">
            {user.name}
          </p>
          <p className="mb-3 text-xs text-slate-500">{label(user.role)}</p>
          <button onClick={logout} className="btn-ghost w-full">
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <h1>{title}</h1>
          </div>
          {user.role !== "admin" && (
            <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
              <Wallet size={16} />
              {rupiah(user.balance)}
            </div>
          )}
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
