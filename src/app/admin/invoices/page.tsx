"use client";
import { useCallback, useEffect, useState } from "react";
import {
  filterInvoices,
  Invoice,
  InvoiceStatusEnum,
} from "@/lib/api/invoice-api";
import { ResponseType } from "@/types/api";

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status?: string }) {
  if (status === "PAID")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Paid
      </span>
    );
  if (status === "WAITING")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Waiting
      </span>
    );
  if (status === "CANCELED")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
        Canceled
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
      —
    </span>
  );
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusEnum | "">("");

  const fetchInvoices = useCallback(
    (p: number, status: InvoiceStatusEnum | "") => {
      filterInvoices({
        filterOption: {
          ...(status ? { statusEnum: status } : {}),
        },
        pagination: { page: p + 1, size: PAGE_SIZE },
        setLoading,
        successHandler: (data: ResponseType, headers?: Headers) => {
          const content = data.content;
          setInvoices((Array.isArray(content) ? content : []) as Invoice[]);
          setTotal(Number(headers?.get("X-total") ?? 0));
        },
      });
    },
    [],
  );

  useEffect(() => {
    fetchInvoices(page, statusFilter);
  }, [fetchInvoices, page, statusFilter]);

  const handleStatusChange = (value: InvoiceStatusEnum | "") => {
    setStatusFilter(value);
    setPage(0);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fmtCurrency = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="p-4 sm:p-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Invoices</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} hóa đơn tổng cộng
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            <h2 className="text-sm font-semibold text-gray-800">
              Invoice List
            </h2>
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusChange(e.target.value as InvoiceStatusEnum | "")
            }
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">All status</option>
            <option value="WAITING">Waiting</option>
            <option value="PAID">Paid</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Sản phẩm
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Tạm tính
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Giảm / Phụ thu
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Tổng
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-gray-400 text-sm"
                    >
                      Không có hóa đơn nào
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const firstItem = inv.items[0];
                    const extraItems = inv.items.length - 1;
                    const hasDiscount =
                      inv.discountAmount > 0 || inv.discountPercentage > 0;
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        {/* Invoice # */}
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {inv.invoiceNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs">
                            {inv.customerName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {inv.customerPhone}
                          </p>
                          {inv.invoiceNote && (
                            <p className="text-[10px] text-gray-400 mt-0.5 italic truncate max-w-36">
                              {inv.invoiceNote}
                            </p>
                          )}
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3">
                          {firstItem ? (
                            <>
                              <p className="text-xs font-medium text-gray-800">
                                {firstItem.productName}
                                <span className="text-gray-400 font-normal">
                                  {" "}
                                  ×{firstItem.quantity}
                                </span>
                              </p>
                              {extraItems > 0 && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  +{extraItems} sản phẩm khác
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Original amount */}
                        <td className="hidden md:table-cell px-4 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                          {fmtCurrency(inv.originalAmount)}
                        </td>

                        {/* Discount / extra fee */}
                        <td className="hidden md:table-cell px-4 py-3 text-right text-xs whitespace-nowrap">
                          {hasDiscount && (
                            <p className="text-red-500">
                              −
                              {inv.discountPercentage > 0
                                ? `${inv.discountPercentage}%`
                                : fmtCurrency(inv.discountAmount)}
                            </p>
                          )}
                          {inv.extraFee > 0 && (
                            <p className="text-gray-500">
                              +{fmtCurrency(inv.extraFee)}
                            </p>
                          )}
                          {!hasDiscount && inv.extraFee === 0 && (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                          {fmtCurrency(inv.totalAmount)}
                        </td>

                        {/* Date */}
                        <td className="hidden sm:table-cell px-4 py-3 text-center text-xs text-gray-500 whitespace-nowrap">
                          {fmtDate(inv.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={inv.statusName} />
                        </td>
                      </tr>
                    );
                  })
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
