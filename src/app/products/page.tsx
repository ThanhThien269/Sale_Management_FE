"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ontoAPIHandler } from "@/lib/api/client-handler";
import { CATEGORY_MAP, Product } from "@/lib/store";
import { ResponseType } from "@/types/api";

type CartItem = Product & { qty: number };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    ontoAPIHandler({
      method: "GET",
      apiUrl: "/api/products",
      setLoading,
      successHandler: (data: ResponseType) => {
        setProducts((data.content as Product[]) ?? []);
      },
    });
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleOrder = () => {
    if (!customer.trim() || cart.length === 0) return;
    ontoAPIHandler({
      method: "POST",
      apiUrl: "/api/orders",
      body: JSON.stringify({
        customer: customer.trim(),
        phone: phone.trim(),
        items: cart.map((i) => ({
          productId: i.id,
          productName: i.name,
          quantity: i.qty,
          price: i.price,
        })),
        total,
      }),
      headers: { "Content-Type": "application/json" },
      setLoading: setSubmitting,
      successHandler: () => {
        setSuccess(true);
        setCart([]);
        setCustomer("");
        setPhone("");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-800">Đặt hàng</h1>
        <Link
          href="/admin/products"
          className="text-xs text-blue-600 hover:underline"
        >
          Admin →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-6 flex gap-6">
        {/* Product grid */}
        <div className="flex-1">
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
              ✓ Đặt hàng thành công! Đơn hàng đang được xử lý.
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Đang tải...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => {
                const cartItem = cart.find((i) => i.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
                  >
                    {/* Placeholder image */}
                    <div className="w-full h-24 bg-linear-to-br from-blue-50 to-indigo-100 rounded-lg mb-3 flex items-center justify-center text-2xl">
                      {CATEGORY_MAP[p.categoryId] === "Đồ uống" ? "☕" : "🥗"}
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">{CATEGORY_MAP[p.categoryId] ?? p.categoryId}</p>
                    <p className="text-sm font-semibold text-gray-800 mb-1 leading-tight">
                      {p.name}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mb-3">
                      {p.price.toLocaleString("vi-VN")}đ
                    </p>

                    {cartItem ? (
                      <div className="flex items-center justify-between mt-auto">
                        <button
                          onClick={() => updateQty(p.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-base leading-none"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => updateQty(p.id, 1)}
                          className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-base leading-none"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="mt-auto w-full py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Thêm vào giỏ
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart panel */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Giỏ hàng</h2>

            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 mb-4">Chưa có sản phẩm nào</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {cart.map((i) => (
                  <li key={i.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1 pr-2">
                      {i.name} <span className="text-gray-400">×{i.qty}</span>
                    </span>
                    <span className="text-gray-800 whitespace-nowrap">
                      {(i.price * i.qty).toLocaleString("vi-VN")}đ
                    </span>
                  </li>
                ))}
                <li className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </li>
              </ul>
            )}

            {/* Customer info */}
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Tên khách hàng *"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleOrder}
              disabled={submitting || cart.length === 0 || !customer.trim()}
              className="w-full py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? "Đang đặt..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
