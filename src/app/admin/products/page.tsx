"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ontoAPIHandler } from "@/lib/api/client-handler";
import { filterProducts, ProductStatusEnum } from "@/lib/api/product-api";
import { getCategories, Category } from "@/lib/api/category-api";
import { Product } from "@/lib/store";
import { ResponseType } from "@/types/api";

const PAGE_SIZE = 10;

function DeleteDialog({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 mx-auto mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-rose-500"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-800 text-center mb-1">
          Xóa sản phẩm
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Bạn có chắc muốn xóa{" "}
          <span className="font-semibold text-gray-700">
            &ldquo;{name}&rdquo;
          </span>
          ?<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-medium bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Active
      </span>
    );
  if (status === "INACTIVE")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
        Inactive
      </span>
    );
  if (status === "OUT_OF_STOCK")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Out of stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Draft
    </span>
  );
}

function ProductImage({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="w-9 h-9 rounded-lg object-cover shrink-0"
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProductStatusEnum | "">("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const fetchProducts = useCallback(
    (p: number, status: ProductStatusEnum | "", catId: number | "") => {
      filterProducts({
        filterOption: {
          ...(status ? { statusEnum: status } : {}),
          ...(catId !== "" ? { categoryId: Number(catId) } : {}),
        },
        pagination: { page: p + 1, size: PAGE_SIZE },
        setLoading,
        successHandler: (data: ResponseType, headers?: Headers) => {
          setProducts((data.content as Product[]) ?? []);
          setTotal(Number(headers?.get("X-total") ?? 0));
        },
      });
    },
    [],
  );

  useEffect(() => {
    fetchProducts(page, statusFilter, categoryFilter);
  }, [fetchProducts, page, statusFilter, categoryFilter]);

  const handleStatusChange = (value: ProductStatusEnum | "") => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleCategoryChange = (value: number | "") => {
    setCategoryFilter(value);
    setPage(0);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    ontoAPIHandler({
      method: "DELETE",
      apiUrl: `/api/products/${deleteTarget.id}`,
      successHandler: () => {
        setDeleteTarget(null);
        fetchProducts(page, statusFilter, categoryFilter);
      },
    });
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fmtPrice = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="p-4 sm:p-8">
      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {/* Page header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} sản phẩm tổng cộng
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            <h2 className="text-sm font-semibold text-gray-800">
              Most Popular Products
            </h2>
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusChange(e.target.value as ProductStatusEnum | "")
              }
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) =>
                handleCategoryChange(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-135 text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Product name
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Created at
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-gray-400 text-sm"
                    >
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Product name + thumbnail */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage src={p.image} name={p.name} />
                          <div>
                            <p className="font-medium text-gray-800 leading-tight">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              ({p.stockQuantity})
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-center text-gray-500 text-xs">
                        {categories.find((c) => c.id === p.categoryId)?.name ??
                          p.categoryId}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-800">
                        {fmtPrice(p.price)}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-center text-gray-500 text-xs">
                        {fmtDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={p.statusName} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                    page === i
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
