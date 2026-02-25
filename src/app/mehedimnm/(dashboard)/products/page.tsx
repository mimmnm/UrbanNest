"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Star,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  colors: string[];
  sizes: string[];
  sku: string;
  stock: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "",
  tags: "",
  inStock: true,
  featured: false,
  isNew: false,
  isBestSeller: false,
  colors: "",
  sizes: "",
  sku: "",
  stock: "0",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.urls) setImages((prev) => [...prev, ...data.urls]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setImages([]); setSaveError(""); setShowModal(true); };

  const openEdit = (product: ProductItem) => {
    setEditingId(product.id || product._id || "");
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      category: product.category,
      tags: (product.tags || []).join(", "),
      inStock: product.inStock,
      featured: product.featured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      colors: (product.colors || []).join(", "),
      sizes: (product.sizes || []).join(", "),
      sku: product.sku || "",
      stock: (product.stock || 0).toString(),
    });
    setImages(product.images || []);
    setSaveError("");
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    setSaveError("");
    const body = {
      name: form.name, description: form.description, price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price), images, category: form.category,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      inStock: form.inStock, featured: form.featured, isNew: form.isNew, isBestSeller: form.isBestSeller,
      colors: form.colors ? form.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      sku: form.sku, stock: Number(form.stock) || 0,
    };
    try {
      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setShowModal(false); setEditingId(null); fetchProducts(); }
      else { const errData = await res.json().catch(() => ({})); setSaveError(errData.error || "Failed to save"); }
    } catch (err) { console.error("Save failed:", err); setSaveError("Network error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setActiveMenu(null);
    try { const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" }); if (res.ok) setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id)); }
    catch (err) { console.error("Delete failed:", err); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-light text-stone-900">Products</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">Manage your catalog ({products.length} products)</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors flex-shrink-0">
          <Plus size={16} /> Add Product
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-xs font-medium text-stone-500 px-4 lg:px-6 py-3">Product</th>
                <th className="text-left text-xs font-medium text-stone-500 px-4 lg:px-6 py-3">Category</th>
                <th className="text-left text-xs font-medium text-stone-500 px-4 lg:px-6 py-3">Price</th>
                <th className="text-left text-xs font-medium text-stone-500 px-4 lg:px-6 py-3">Stock</th>
                <th className="text-left text-xs font-medium text-stone-500 px-4 lg:px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-stone-500 px-4 lg:px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const pid = product.id || product._id || "";
                return (
                  <tr key={pid} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-stone-300" /></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                          <p className="text-[10px] text-stone-400">SKU: {product.sku || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3"><span className="text-sm text-stone-600 capitalize truncate block max-w-[120px]">{product.category || "—"}</span></td>
                    <td className="px-4 lg:px-6 py-3">
                      <p className="text-sm font-medium text-stone-900">{formatPrice(product.price)}</p>
                      {product.originalPrice > product.price && <p className="text-[10px] text-stone-400 line-through">{formatPrice(product.originalPrice)}</p>}
                    </td>
                    <td className="px-4 lg:px-6 py-3"><span className="text-sm text-stone-600">{product.stock}</span></td>
                    <td className="px-4 lg:px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {product.inStock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex items-center justify-end gap-1 relative">
                        <button onClick={() => setActiveMenu(activeMenu === pid ? null : pid)} className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"><MoreVertical size={16} /></button>
                        <AnimatePresence>
                          {activeMenu === pid && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-10 w-36 bg-white rounded-xl border border-stone-200 shadow-lg z-10 py-1">
                              <button onClick={() => openEdit(product)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"><Edit size={14} /> Edit</button>
                              <button onClick={() => handleDelete(pid)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon size={40} className="mx-auto text-stone-200 mb-3" />
            <p className="text-sm text-stone-400">No products yet</p>
            <button onClick={openAdd} className="mt-3 text-sm text-stone-900 underline">Add your first product</button>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
            <ImageIcon size={40} className="mx-auto text-stone-200 mb-3" />
            <p className="text-sm text-stone-400">No products yet</p>
            <button onClick={openAdd} className="mt-3 text-sm text-stone-900 underline">Add your first product</button>
          </div>
        )}
        {products.map((product) => {
          const pid = product.id || product._id || "";
          return (
            <div key={pid} className="bg-white rounded-xl border border-stone-100 p-3">
              <div className="flex items-start gap-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="56px" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-stone-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                      <p className="text-xs text-stone-500 capitalize">{product.category || "No category"}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {product.inStock ? "In Stock" : "Out"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-stone-900">{formatPrice(product.price)}</span>
                      <span className="text-xs text-stone-400">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(pid)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditingId(null); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h3 className="text-base sm:text-lg font-medium text-stone-900">{editingId ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Images */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">Product Images</label>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-stone-100 group">
                        <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                      </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={14} /><span className="text-[9px] mt-0.5">Upload</span></>}
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleUpload} className="hidden" />
                  <p className="text-[10px] sm:text-[11px] text-stone-400">Max 10MB per file. Images & videos supported.</p>
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="Product name" />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none" placeholder="Product description" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Price (৳) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Original Price</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300">
                      <option value="">Select</option>
                      {categories.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">SKU</label>
                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="SKU-001" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Stock Qty</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Tags (comma sep.)</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="beauty, skincare" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Colors (comma sep.)</label>
                    <input type="text" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="Red, Blue" />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">Sizes (comma sep.)</label>
                    <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="S, M, L, XL" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {[
                    { key: "inStock", label: "In Stock" },
                    { key: "featured", label: "Featured" },
                    { key: "isNew", label: "New" },
                    { key: "isBestSeller", label: "Best Seller" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 cursor-pointer">
                      <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="rounded border-stone-300" />
                      {label}
                    </label>
                  ))}
                </div>

                {saveError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{saveError}</div>}
                <div className="flex gap-3 pt-2 pb-2">
                  <button onClick={() => { setShowModal(false); setEditingId(null); setSaveError(""); }} className="flex-1 py-2.5 sm:py-3 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="flex-1 py-2.5 sm:py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {editingId ? "Update" : "Add Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
