import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Wallet,
  User,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { rupiah } from "@/utils/format";

const DASHBOARD_PATHS = {
  admin: "/users",
  seller: "/seller/products",
  courier: "/orders",
  buyer: "/orders",
};

export default function PublicNavbar({ onSearch, searchValue }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
      isActive
        ? "bg-brand-50 text-brand-700 font-bold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: ONLY LOGO (no text) */}
        <Link to="/" className="flex items-center shrink-0" title="Cakau ID Beranda">
          <img
            src="/logo.png"
            alt="Cakau ID"
            className="h-11 sm:h-12 w-auto object-contain transition hover:opacity-90"
          />
        </Link>

        {/* Center: Real Page Navigation (NO scroll anchors) */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={navClass}>
            Beranda
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Semua Produk
          </NavLink>
          <NavLink to="/about" className={navClass}>
            Tentang & Panduan
          </NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role !== "admin" && (
                <Link
                  to="/topups"
                  title="Klik untuk topup saldo"
                  className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/80 px-3.5 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100 transition shadow-sm"
                >
                  <Wallet size={17} className="text-brand-600" />
                  <span>{rupiah(user.balance)}</span>
                </Link>
              )}
              <Link
                to={DASHBOARD_PATHS[user.role] || "/orders"}
                className="btn-primary !py-2.5 !px-5 text-sm font-bold rounded-xl shadow-sm hover:shadow"
              >
                <User size={16} />
                <span>Panel {user.role === "buyer" ? "Pembeli" : user.role === "seller" ? "Seller" : user.role === "courier" ? "Kurir" : "Admin"}</span>
              </Link>
              <button
                onClick={logout}
                className="btn-ghost !p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:border-red-200"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="btn-ghost !py-2.5 !px-5 text-sm font-bold rounded-xl"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="btn-primary !py-2.5 !px-6 text-sm font-bold rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/35"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-1 text-base font-semibold">
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-xl ${
                  isActive ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-700"
                }`
              }
            >
              Beranda
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-xl ${
                  isActive ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-700"
                }`
              }
            >
              Semua Produk
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-xl ${
                  isActive ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-700"
                }`
              }
            >
              Tentang & Panduan
            </NavLink>
          </nav>

          <div className="border-t border-slate-100 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3 text-sm font-bold text-brand-700">
                  <span className="flex items-center gap-2">
                    <Wallet size={18} /> Saldo:
                  </span>
                  <span>{rupiah(user.balance)}</span>
                </div>
                <Link
                  to={DASHBOARD_PATHS[user.role] || "/orders"}
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full !py-3 text-sm font-bold rounded-xl text-center"
                >
                  Buka Panel {user.role}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="btn-ghost w-full !py-2.5 text-sm text-red-600 rounded-xl"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost text-center !py-3 text-sm font-bold rounded-xl"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center !py-3 text-sm font-bold rounded-xl"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
