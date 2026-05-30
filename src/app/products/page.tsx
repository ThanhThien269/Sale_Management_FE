/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useState } from "react";
import { ontoAPIHandler } from "@/lib/api/client-handler";
import { getCategories, Category } from "@/lib/api/category-api";
import { Product } from "@/lib/store";
import { ResponseType } from "@/types/api";

// ── Cart types ────────────────────────────────────────────────────────────────
type CartItem = { product: Product; qty: number };
type Cart = CartItem[];

const PAGE_SIZE = 12;
const BANNER_IMAGE =
  "https://img.magnific.com/free-vector/hand-drawn-pattern-background_23-2150822444.jpg?semt=ais_hybrid&w=740&q=80";

// ── CartPanel ─────────────────────────────────────────────────────────────────
function CartPanel({
  cart,
  selectedIds,
  onToggleSelected,
  onChangeQty,
  onRemove,
  onCheckout,
}: {
  cart: Cart;
  selectedIds: Set<string>;
  onToggleSelected: (productId: string) => void;
  onChangeQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  const fmtPrice = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const selectedItems = cart.filter((i) => selectedIds.has(i.product.id));
  const total = selectedItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const isEmpty = cart.length === 0;
  const hasSelected = selectedItems.length > 0;

  return (
    <div className="w-72 shrink-0 sticky top-4 self-start">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="font-bold text-sm">Giỏ hàng</span>
          </div>
          {cart.length > 0 && (
            <span className="bg-white text-green-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto max-h-105">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-xs text-gray-400">Giỏ hàng trống</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 px-3 py-2">
              {cart.map(({ product, qty }) => {
                const isSelected = selectedIds.has(product.id);
                return (
                  <li
                    key={product.id}
                    className={`flex gap-2 py-2.5 items-start transition-colors ${
                      isSelected ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    {/* Checkbox tròn */}
                    <label className="flex items-center pt-1 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelected(product.id)}
                        className="w-4 h-4 rounded-full border-gray-300 accent-green-600 cursor-pointer"
                      />
                    </label>

                    {/* Thumbnail */}
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-green-600 font-bold mt-0.5">
                        {fmtPrice(product.price)}
                      </p>
                      {/* Qty */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <button
                          onClick={() =>
                            qty > 1
                              ? onChangeQty(product.id, qty - 1)
                              : onRemove(product.id)
                          }
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-gray-800">
                          {qty}
                        </span>
                        <button
                          onClick={() =>
                            onChangeQty(
                              product.id,
                              Math.min(product.stockQuantity, qty + 1),
                            )
                          }
                          disabled={qty >= product.stockQuantity}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-gray-400 ml-1">
                          ={fmtPrice(product.price * qty)}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemove(product.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors mt-0.5 shrink-0"
                      title="Xóa"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-3">
            {hasSelected ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  Tổng ({selectedItems.length} sản phẩm)
                </span>
                <span className="font-extrabold text-green-700 text-base">
                  {fmtPrice(total)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">
                Chọn sản phẩm để đặt hàng
              </p>
            )}
            <button
              onClick={onCheckout}
              disabled={!hasSelected}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-sm py-2.5 rounded-xl transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Mua ngay {hasSelected ? `(${selectedItems.length})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CartToast ─────────────────────────────────────────────────────────────────
function CartToast({
  name,
  onDone,
}: {
  name: string;
  qty: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#166534",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        animation: "fadeUp .22s ease",
      }}
    >
      ✓ Đã thêm &ldquo;{name}&rdquo; vào giỏ hàng
    </div>
  );
}

// ── QuantitySelector ──────────────────────────────────────────────────────────
function QuantitySelector({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
  };

  return (
    <div className="flex items-center gap-0 rounded-lg border border-gray-200 overflow-hidden h-7 text-sm">
      <button
        onClick={dec}
        disabled={value <= min}
        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInput}
        className="w-9 h-7 text-center text-xs font-semibold text-gray-800 border-x border-gray-200 bg-white focus:outline-none"
        style={{ MozAppearance: "textfield" } as React.CSSProperties}
      />
      <button
        onClick={inc}
        disabled={value >= max}
        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
      >
        +
      </button>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────
function ProductCard({
  product,
  cartQty,
  onAddToCart,
  onQtyChange,
}: {
  product: Product;
  cartQty: number;
  onAddToCart: (p: Product) => void;
  onQtyChange: (productId: string, qty: number) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const inStock = product.stockQuantity > 0;
  const inCart = cartQty > 0;

  const fmtPrice = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const stockLabel = !inStock
    ? "Hết hàng"
    : product.stockQuantity <= 5
      ? `Còn ${product.stockQuantity} sản phẩm`
      : `Tồn kho: ${product.stockQuantity}`;

  const stockColor = !inStock
    ? "text-red-400"
    : product.stockQuantity <= 5
      ? "text-amber-500"
      : "text-emerald-600";

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group p-3 flex flex-col gap-2 ${
        inCart ? "border-green-300 ring-1 ring-green-100" : "border-gray-100"
      }`}
    >
      {/* Row 1: Thumbnail + name/price */}
      <div className="flex gap-2 items-start">
        {/* Thumbnail */}
        <div className="w-14 h-14 shrink-0 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 relative">
          {product.image && !imgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
          {/* In-cart badge */}
          {inCart && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
              {cartQty}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-green-600">
              {fmtPrice(product.price)}
            </span>
          </div>
          {/* Stock indicator */}
          <div className={`flex items-center gap-1 mt-1 ${stockColor}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="12" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {stockLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Qty selector khi đã có trong giỏ, hoặc nút thêm */}
      {inCart ? (
        <div className="flex items-center gap-2 pt-1.5 border-t border-green-50">
          <span className="text-xs text-gray-500 font-medium shrink-0">
            Số lượng:
          </span>
          <QuantitySelector
            value={cartQty}
            min={1}
            max={product.stockQuantity}
            onChange={(v) => onQtyChange(product.id, v)}
          />
          <span className="text-[10px] text-gray-400 flex-1">
            / {product.stockQuantity}
          </span>
          <span className="text-xs font-bold text-green-700 shrink-0">
            {fmtPrice(product.price * cartQty)}
          </span>
        </div>
      ) : (
        <button
          disabled={!inStock}
          onClick={() => onAddToCart(product)}
          className="w-full py-1.5 rounded-lg text-xs font-bold border transition-all duration-150
            bg-green-50 text-green-700 border-green-200
            hover:bg-green-600 hover:text-white hover:border-green-600
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {inStock ? "+ Thêm vào giỏ" : "Hết hàng"}
        </button>
      )}
    </div>
  );
}

// ── CheckoutModal ─────────────────────────────────────────────────────────────
function CheckoutModal({
  cart,
  selectedIds,
  onClose,
  onSuccess,
}: {
  cart: Cart;
  selectedIds: Set<string>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [note, setNote] = useState("");
  const [extraFee, setExtraFee] = useState(0);
  const [discountMode, setDiscountMode] = useState<"percentage" | "amount">(
    "percentage",
  );
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmountInput, setDiscountAmountInput] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fmtPrice = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Chỉ tính các item được chọn
  const selectedCart = cart.filter((i) => selectedIds.has(i.product.id));
  const subtotal = selectedCart.reduce(
    (s, i) => s + i.product.price * i.qty,
    0,
  );
  const discountAmount =
    discountMode === "percentage"
      ? Math.round((subtotal * discountPercentage) / 100)
      : discountAmountInput;
  const effectiveDiscountPercentage =
    discountMode === "percentage" ? discountPercentage : 0;
  const total = subtotal - discountAmount + extraFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      items: selectedCart.map((i) => ({
        productId: i.product.id,
        quantity: i.qty,
      })),
      note,
      customerName,
      customerPhoneNumber,
      extraFee,
      discountAmount,
      discountPercentage: effectiveDiscountPercentage,
    };
    ontoAPIHandler({
      method: "POST",
      apiUrl: "/api/invoices",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      setLoading: setSubmitting,
      successHandler: () => onSuccess(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-base">Xác nhận đặt hàng</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Order summary — chỉ hiển thị selectedCart */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 max-h-36 overflow-y-auto">
            {selectedCart.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 line-clamp-1 flex-1">
                  {product.name}
                </span>
                <span className="text-gray-500 shrink-0">×{qty}</span>
                <span className="text-green-700 font-semibold shrink-0 w-24 text-right">
                  {fmtPrice(product.price * qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Customer info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Tên khách hàng <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={customerPhoneNumber}
                onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                placeholder="0901234567"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Ghi chú
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho đơn hàng..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Phụ thu (₫)
                </label>
                <input
                  type="number"
                  min="0"
                  value={extraFee}
                  onChange={(e) => setExtraFee(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ MozAppearance: "textfield" } as React.CSSProperties}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600">
                    Giảm giá
                  </label>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiscountMode("percentage")}
                      className={`px-2 py-0.5 transition-colors ${
                        discountMode === "percentage"
                          ? "bg-green-600 text-white"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode("amount")}
                      className={`px-2 py-0.5 transition-colors ${
                        discountMode === "amount"
                          ? "bg-green-600 text-white"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      ₫
                    </button>
                  </div>
                </div>
                {discountMode === "percentage" ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) =>
                      setDiscountPercentage(
                        Math.min(100, Math.max(0, Number(e.target.value))),
                      )
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={
                      { MozAppearance: "textfield" } as React.CSSProperties
                    }
                  />
                ) : (
                  <input
                    type="number"
                    min="0"
                    max={subtotal + extraFee}
                    value={discountAmountInput}
                    onChange={(e) =>
                      setDiscountAmountInput(
                        Math.min(
                          subtotal + extraFee,
                          Math.max(0, Number(e.target.value)),
                        ),
                      )
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={
                      { MozAppearance: "textfield" } as React.CSSProperties
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{fmtPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>
                  Giảm giá
                  {discountMode === "percentage"
                    ? ` (${discountPercentage}%)`
                    : ""}
                </span>
                <span>−{fmtPrice(discountAmount)}</span>
              </div>
            )}
            {extraFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Phụ thu</span>
                <span>+{fmtPrice(extraFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base text-green-700 pt-1 border-t">
              <span>Tổng cộng</span>
              <span>{fmtPrice(total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-60"
            >
              {submitting ? "Đang xử lý…" : "Đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CategoryBottomCard ────────────────────────────────────────────────────────
function CategoryBottomCard({
  cat,
  onClick,
}: {
  cat: Category;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-44 rounded-2xl overflow-hidden group text-left shadow-sm hover:shadow-md transition-shadow"
    >
      {(cat as any).image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(cat as any).image}
          alt={cat.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide">
          Danh mục
        </p>
        <p className="text-white font-bold text-sm leading-tight line-clamp-2">
          {cat.name}
        </p>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ product: Product; qty: number } | null>(
    null,
  );
  const [cart, setCart] = useState<Cart>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(
    new Set(),
  );
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    getCategories().then((cats) => {
      if (cats.length === 0) return;
      setCategories(cats);
      setActiveCategoryId(cats[0].id);
    });
  }, []);

  const fetchProducts = useCallback((catId: number, p: number) => {
    ontoAPIHandler({
      method: "POST",
      apiUrl: "/api/products/filter",
      body: JSON.stringify({
        filterOption: { status: [1, 2], categoryId: catId },
        pagination: { page: p + 1, size: PAGE_SIZE },
        sorts: [],
      }),
      headers: { "Content-Type": "application/json" },
      setLoading,
      successHandler: (data: ResponseType, headers?: Headers) => {
        setProducts((data.content as Product[]) ?? []);
        setTotal(Number(headers?.get("X-total") ?? 0));
      },
    });
  }, []);

  useEffect(() => {
    if (activeCategoryId !== null) fetchProducts(activeCategoryId, page);
  }, [fetchProducts, activeCategoryId, page]);

  const handleSelectCategory = (catId: number) => {
    setActiveCategoryId(catId);
    setPage(0);
    setProducts([]);
  };

  // Thêm vào giỏ (nút trên ProductCard), auto-tick checkbox
  const handleAddToCart = useCallback((product: Product) => {
    setToast({ product, qty: 1 });
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: Math.min(product.stockQuantity, i.qty + 1) }
            : i,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    // Auto-select item khi thêm vào giỏ
    setSelectedCartIds((prev) => new Set([...prev, product.id]));
  }, []);

  // Toggle checkbox trong CartPanel
  const handleToggleSelected = useCallback((productId: string) => {
    setSelectedCartIds((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  }, []);

  const handleCartChangeQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
    );
  }, []);

  const handleCartRemove = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    setSelectedCartIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }, []);

  const handleCheckout = useCallback(() => {
    setShowCheckout(true);
  }, []);

  const handleOrderSuccess = useCallback(() => {
    setShowCheckout(false);
    setCart([]);
    setSelectedCartIds(new Set());
    if (activeCategoryId !== null) fetchProducts(activeCategoryId, page);
  }, [activeCategoryId, fetchProducts, page]);

  // Build a map of productId -> qty in cart for quick lookup
  const cartQtyMap = Object.fromEntries(cart.map((i) => [i.product.id, i.qty]));

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const otherCategories = categories.filter((c) => c.id !== activeCategoryId);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const range: (number | "...")[] = [];
    if (page < 4) {
      range.push(0, 1, 2, 3, 4, "...", totalPages - 1);
    } else if (page > totalPages - 5) {
      range.push(
        0,
        "...",
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      );
    } else {
      range.push(0, "...", page - 1, page, page + 1, "...", totalPages - 1);
    }
    return range;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        /* hide number input arrows */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BANNER_IMAGE}
          alt="Banner nền cửa hàng"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center top" }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-green-900/70 via-green-800/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
          <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Khám phá
          </p>
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight drop-shadow">
            Tất cả sản phẩm
          </h1>
          {activeCategory && (
            <p className="text-green-100 text-sm mt-1 font-medium">
              Đang xem:{" "}
              <span className="font-bold text-white">
                {activeCategory.name}
              </span>
              {total > 0 && (
                <span className="ml-2 text-green-200 font-normal">
                  — {total} sản phẩm
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── Main body: content + cart ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">
        {/* ── Left: categories + products + pagination + explore ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ── TOP: Active category (left) + Products (right) ── */}
          <div className="flex gap-6 items-stretch min-h-120">
            {/* LEFT: Active category */}
            {activeCategory && (
              <aside className="w-56 shrink-0">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
                  <div
                    className="relative flex-1 bg-gray-100"
                    style={{ minHeight: 220 }}
                  >
                    {(activeCategory as any).image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(activeCategory as any).image}
                        alt={activeCategory.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-5xl">
                        🛒
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="bg-green-600 text-white px-4 py-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-green-200 mb-1">
                      Danh mục
                    </p>
                    <h2 className="font-bold text-base leading-tight">
                      {activeCategory.name}
                    </h2>
                    {total > 0 && (
                      <p className="text-xs text-green-200 mt-1">
                        {total} sản phẩm
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            )}

            {/* RIGHT: Products + pagination */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 animate-pulse"
                      style={{ height: 100 }}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-2 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                  Không có sản phẩm nào trong danh mục này
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      cartQty={cartQtyMap[p.id] ?? 0}
                      onAddToCart={handleAddToCart}
                      onQtyChange={handleCartChangeQty}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-auto pt-2 flex-wrap">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-100"
                  >
                    ←
                  </button>
                  {getPageNumbers().map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`e-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                          page === item
                            ? "bg-green-600 text-white font-semibold shadow-sm"
                            : "text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                        }`}
                      >
                        {(item as number) + 1}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-100"
                  >
                    →
                  </button>
                </div>
              )}
              {totalPages > 1 && (
                <p className="text-center text-xs text-gray-400 -mt-2">
                  Trang {page + 1} / {totalPages}
                </p>
              )}
            </div>
          </div>

          {/* ── BOTTOM: Other categories ── */}
          {otherCategories.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Khám phá thêm
              </p>
              <div className="grid grid-cols-3 gap-4">
                {otherCategories.map((cat) => (
                  <CategoryBottomCard
                    key={cat.id}
                    cat={cat}
                    onClick={() => handleSelectCategory(cat.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Cart panel ── */}
        <CartPanel
          cart={cart}
          selectedIds={selectedCartIds}
          onToggleSelected={handleToggleSelected}
          onChangeQty={handleCartChangeQty}
          onRemove={handleCartRemove}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Toast */}
      {toast && (
        <CartToast
          name={toast.product.name}
          qty={toast.qty}
          onDone={() => setToast(null)}
        />
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          selectedIds={selectedCartIds}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
}
