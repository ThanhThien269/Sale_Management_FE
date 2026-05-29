"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ontoAPIHandler } from "@/lib/api/client-handler";
import { getCategories, Category } from "@/lib/api/category-api";
import { Product } from "@/lib/store";
import { ResponseType } from "@/types/api";
import { uploadToCloudinary } from "@/lib/cloudinary";

const INPUT =
  "w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50";

const LABEL = "block text-sm font-medium text-gray-700 mb-1";

type FormState = {
  name: string;
  categoryId: string;
  price: string;
  stockQuantity: string;
  soldQuantity: string;
  description: string;
  imageUrl: string;
  statusName: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
};

const STATUS_OPTIONS: {
  value: FormState["statusName"];
  label: string;
  id: number;
}[] = [
  { value: "ACTIVE", label: "Active", id: 1 },
  { value: "INACTIVE", label: "Inactive", id: 2 },
  { value: "OUT_OF_STOCK", label: "Out of stock", id: 3 },
];

const STATUS_ID: Record<FormState["statusName"], number> = {
  ACTIVE: 1,
  INACTIVE: 2,
  OUT_OF_STOCK: 3,
};

const STATUS_STYLE: Record<FormState["statusName"], string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-rose-50 text-rose-600",
  OUT_OF_STOCK: "bg-amber-50 text-amber-600",
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    categoryId: "",
    price: "",
    stockQuantity: "",
    soldQuantity: "",
    description: "",
    imageUrl: "",
    statusName: "ACTIVE",
  });
  const [initialForm, setInitialForm] = useState<FormState | null>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    ontoAPIHandler({
      method: "GET",
      apiUrl: `/api/products/${id}`,
      setLoading,
      successHandler: (data: ResponseType) => {
        const p = data.content as Product;
        const loaded: FormState = {
          name: p.name,
          categoryId: String(p.categoryId),
          price: String(p.price),
          stockQuantity: String(p.stockQuantity),
          soldQuantity: String(p.soldQuantity ?? 0),
          description: p.description ?? "",
          imageUrl: p.image ?? "",
          statusName: p.statusName as FormState["statusName"],
        };
        setForm(loaded);
        setInitialForm(loaded);
      },
    });
  }, [id]);

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

  const getChangedFields = () => {
    if (!initialForm) return {};
    const patch: Record<string, unknown> = {};
    if (form.name !== initialForm.name) patch.name = form.name;
    if (form.categoryId !== initialForm.categoryId)
      patch.categoryId = Number(form.categoryId);
    if (form.price !== initialForm.price) patch.price = Number(form.price);
    if (form.stockQuantity !== initialForm.stockQuantity)
      patch.stockQuantity = Number(form.stockQuantity);
    if (form.soldQuantity !== initialForm.soldQuantity)
      patch.soldQuantity = Number(form.soldQuantity);
    if (form.description !== initialForm.description)
      patch.description = form.description;
    if (form.imageUrl !== initialForm.imageUrl) patch.imageUrl = form.imageUrl;
    if (form.statusName !== initialForm.statusName)
      patch.statusId = STATUS_ID[form.statusName];
    return patch;
  };

  const isDirty =
    initialForm !== null &&
    (form.name.trim() !== initialForm.name.trim() ||
      form.categoryId !== initialForm.categoryId ||
      form.price.trim() !== initialForm.price.trim() ||
      form.stockQuantity.trim() !== initialForm.stockQuantity.trim() ||
      form.description.trim() !== initialForm.description.trim() ||
      form.imageUrl.trim() !== initialForm.imageUrl.trim() ||
      form.statusName !== initialForm.statusName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patch = getChangedFields();
    if (!Object.keys(patch).length) return;
    ontoAPIHandler({
      method: "PATCH",
      apiUrl: `/api/products/${id}`,
      body: JSON.stringify(patch),
      headers: { "Content-Type": "application/json" },
      setLoading,
      successHandler: () => router.push("/admin/products"),
    });
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    ontoAPIHandler({
      method: "DELETE",
      apiUrl: `/api/products/${id}`,
      setLoading,
      successHandler: () => router.push("/admin/products"),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
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
                &ldquo;{form.name}&rdquo;
              </span>
              ?<br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm font-medium bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
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
                {form.name || "Edit Product"}
              </h1>
              <p className="text-xs text-gray-400">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
            <button
              type="submit"
              disabled={loading || !isDirty}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDirty && !loading
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          {/* Left panel */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">
            {/* Image card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors"
              >
                {form.imageUrl ? (
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
                {form.imageUrl && (
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

            {/* Status card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Status
              </h3>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                      form.statusName === opt.value
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="statusName"
                      value={opt.value}
                      checked={form.statusName === opt.value}
                      onChange={handleChange}
                      className="accent-indigo-600"
                    />
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[opt.value]}`}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
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
                    Edit the info below and click Save Changes.
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[form.statusName]}`}
                >
                  {
                    STATUS_OPTIONS.find((o) => o.value === form.statusName)
                      ?.label
                  }
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
                    disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                      className={INPUT}
                      placeholder="e.g. 150000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Stock Quantity</label>
                    <input
                      name="stockQuantity"
                      type="number"
                      min={0}
                      value={form.stockQuantity}
                      onChange={handleChange}
                      disabled={loading}
                      className={INPUT}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Sold Quantity</label>
                    <input
                      name="soldQuantity"
                      type="number"
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
                    disabled={loading}
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
