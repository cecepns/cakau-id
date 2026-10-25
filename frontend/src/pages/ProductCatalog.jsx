import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Store,
  SlidersHorizontal,
  ChevronRight,
  Package,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import usePaginated from "@/hooks/usePaginated";
import { Spinner, Empty } from "@/components/ui";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { api, FILE_URL } from "@/utils/api";
import { rupiah, stripHtml } from "@/utils/format";

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("id");
  const [orderDir, setOrderDir] = useState("desc");

  useEffect(() => {
    api
      .get(API_ENDPOINTS.CATEGORIES, { params: { limit: 100 } })
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  const list = usePaginated(API_ENDPOINTS.PRODUCTS, {
    sortBy,
    order: orderDir,
    ...(activeCategory ? { category: activeCategory } : {}),
  });

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800">
      <PublicNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link to="/" className="hover:text-brand-600 transition">
            Beranda
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-800 font-semibold">Semua Produk</span>
          {activeCategory && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-brand-600 font-semibold capitalize">
                {categories.find((c) => c.slug === activeCategory)?.name ||
                  activeCategory}
              </span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 mb-2">
              Katalog Lengkap
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Katalog Produk Cakau ID
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Jelajahi produk berkualitas dari berbagai kategori dan toko lokal
              pilihan.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="input pl-10 !py-2.5 text-xs rounded-xl shadow-sm"
                placeholder="Cari nama produk atau toko..."
                value={list.search}
                onChange={(e) => list.setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={16}
                className="text-slate-400 shrink-0"
              />
              <select
                className="input !w-auto !py-2.5 text-xs rounded-xl font-medium shadow-sm"
                value={`${sortBy}-${orderDir}`}
                onChange={(e) => {
                  const [by, dir] = e.target.value.split("-");
                  setSortBy(by);
                  setOrderDir(dir);
                }}
              >
                <option value="id-desc">Terbaru</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="name-asc">Nama A-Z</option>
                <option value="stock-desc">Stok Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("category");
                  return next;
                });
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                !activeCategory
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-200"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>Semua Kategori</span>
            </button>

            {categories.map((c) => {
              const isActive = activeCategory === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      if (isActive) next.delete("category");
                      else next.set("category", c.slug);
                      return next;
                    });
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                    isActive
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-200"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span>{c.name}</span>
                  {c.total_products != null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.total_products}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {list.loading ? (
          <div className="py-20 text-center">
            <Spinner />
            <p className="mt-3 text-sm text-slate-500">
              Memuat katalog produk...
            </p>
          </div>
        ) : list.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {list.error}
          </div>
        ) : !list.rows.length ? (
          <div className="py-16">
            <Empty
              text={
                activeCategory
                  ? "Tidak ada produk dalam kategori ini."
                  : "Tidak ada produk yang cocok dengan pencarian Anda."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {list.rows.map((product) => {
              const imgThumb = product.images?.[0];
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-brand-500 hover:shadow-lg hover:-translate-y-1"
                >
                  <div>
                    {/* Image Thumbnail */}
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                      {imgThumb ? (
                        <img
                          src={FILE_URL + imgThumb}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Package size={40} />
                        </div>
                      )}
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-slate-800 shadow">
                        Stok {product.stock}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-500 truncate">
                          <Store
                            size={13}
                            className="text-brand-600 shrink-0"
                          />
                          <span className="truncate">
                            {product.store_name || "Toko"}
                          </span>
                        </p>
                        {product.category_name && (
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md shrink-0">
                            {product.category_name}
                          </span>
                        )}
                      </div>
                      <h2 className="line-clamp-2 text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug">
                        {product.name}
                      </h2>
                      <p className="text-lg sm:text-xl font-extrabold text-brand-700">
                        {rupiah(product.price)}
                      </p>
                      {product.description && (
                        <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                          {stripHtml(product.description)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-4 pt-0">
                    <span className="btn-primary w-full !py-2.5 text-xs sm:text-sm font-bold rounded-xl text-center block">
                      Lihat & Pesan
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {list.pg.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 text-sm">
            <button
              className="btn-ghost !px-4 !py-2 text-xs font-bold rounded-xl"
              disabled={list.pg.page <= 1}
              onClick={() => list.setPage(list.pg.page - 1)}
            >
              Sebelumnya
            </button>
            <span className="px-4 text-xs font-semibold text-slate-600">
              Halaman {list.pg.page} dari {list.pg.totalPages}
            </span>
            <button
              className="btn-ghost !px-4 !py-2 text-xs font-bold rounded-xl"
              disabled={list.pg.page >= list.pg.totalPages}
              onClick={() => list.setPage(list.pg.page + 1)}
            >
              Berikutnya
            </button>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
