"use client";
import { useEffect, useState } from "react";
import { ontoAPIHandler } from "@/lib/api/client-handler";
import { Order } from "@/lib/store";
import { ResponseType } from "@/types/api";

const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING: "Chờ xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_STYLE: Record<Order["status"], string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | Order["status"]>("ALL");

  useEffect(() => {
    ontoAPIHandler({
      method: "GET",
      apiUrl: "/api/orders",
      setLoading,
      successHandler: (data: ResponseType) => {
        setOrders((data.content as Order[]) ?? []);
      },
    });
  }, []);

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <span className="text-sm text-gray-500">
          {filtered.length} đơn hàng
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "PENDING", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              filter === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {s === "ALL" ? "Tất cả" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Đang tải...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Mã đơn
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Ngày đặt
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Không có đơn hàng
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-gray-400 font-mono">
                      #{o.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{o.customer}</p>
                      <p className="text-xs text-gray-400">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-0.5">
                        {o.items.map((item, i) => (
                          <li key={i} className="text-gray-600">
                            {item.productName}{" "}
                            <span className="text-gray-400">
                              ×{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                      {o.total.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${STATUS_STYLE[o.status]}`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
