/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/refs */
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ontoAPIHandler } from "@/lib/api/client-handler";
import { getCategories, Category } from "@/lib/api/category-api";
import { uploadToCloudinary } from "@/lib/cloudinary";

const INPUT =
  "w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50";

const LABEL = "block text-sm font-medium text-gray-700 mb-1";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const submitType = useRef<"draft" | "publish">("publish");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then((list) => {
      setCategories(list);
      if (list.length > 0)
        setForm((prev) => ({ ...prev, categoryId: String(list[0].id) }));
    });
  }, []);

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    stockQuantity: "",
    soldQuantity: "",
    description: "",
    imageUrl: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      alert("Upload ảnh thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const statusName = submitType.current === "draft" ? "DRAFT" : "ACTIVE";
    ontoAPIHandler({
      method: "POST",
      apiUrl: "/api/products",
      body: JSON.stringify({
        name: form.name,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        soldQuantity: Number(form.soldQuantity),
        description: form.description,
        imageUrl: form.imageUrl,
        statusName,
      }),
      headers: { "Content-Type": "application/json" },
      setLoading,
      successHandler: () => router.push("/admin/products"),
    });
  };

  const statusLabel = submitType.current === "draft" ? "Draft" : "Active";

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-sm"
            >
              ←
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-800">
                Add New Product
              </h1>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              onClick={() => {
                submitType.current = "publish";
              }}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          {/* Left panel: Image */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              {/* Preview area */}
              <button
                type="button"
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-indigo-400">
                    <svg
                      className="animate-spin"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <span className="text-xs font-medium">Đang upload...</span>
                  </div>
                ) : form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-indigo-400 transition-colors">
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs font-medium">Click to upload</span>
                    <span className="text-xs text-gray-300">
                      PNG, JPG, WEBP
                    </span>
                  </div>
                )}
                {!uploading && form.imageUrl && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Change image
                    </span>
                  </div>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => !uploading && fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading
                  ? "Uploading..."
                  : form.imageUrl
                    ? "Replace image"
                    : "Choose from device"}
              </button>

              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                  className="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-rose-500 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    Product Details
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Key info to describe and display your product.
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    statusLabel === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Status: {statusLabel}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={LABEL}>
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={handleChange}
                    className={INPUT}
                    placeholder="e.g. Natural Glow Face Moisturizer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className={INPUT}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>
                      Price (₫) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      className={INPUT}
                      placeholder="e.g. 150000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="stockQuantity"
                      type="number"
                      required
                      min={0}
                      value={form.stockQuantity}
                      onChange={handleChange}
                      className={INPUT}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>
                      Sold Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="soldQuantity"
                      type="number"
                      required
                      min={0}
                      value={form.soldQuantity}
                      onChange={handleChange}
                      disabled
                      className={INPUT}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    className={`${INPUT} resize-none`}
                    placeholder="Write a short description highlighting key benefits and features"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
