"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Plus, Edit, Trash2, X, Upload, Loader2, ImageIcon } from "lucide-react";
import { uploadFiles } from "@/lib/upload";

interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(files);
      if (urls[0]) setImage(urls[0]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setImage("");
    setShowModal(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditingId(cat.id || cat._id || "");
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    setSaveError("");
    const body = { name, description, image };
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        fetchCategories();
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveError(errData.error || "Failed to save category");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => (c.id || c._id) !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-light text-stone-900">Categories</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">Organize your products ({categories.length} categories)</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors flex-shrink-0">
          <Plus size={16} /> Add Category
        </motion.button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <ImageIcon size={40} className="mx-auto text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">No categories yet</p>
          <button onClick={openAdd} className="mt-3 text-sm text-stone-900 underline">Add your first category</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((category, i) => {
            const cid = category.id || category._id || "";
            return (
              <motion.div key={cid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }} className="bg-white rounded-xl sm:rounded-2xl border border-stone-100 overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-28 sm:h-40 bg-stone-100">
                  {category.image ? (
                    <>
                      <Image src={category.image} alt={category.name} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-stone-300" />
                    </div>
                  )}
                  <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-4">
                    <h3 className="text-white font-medium drop-shadow-sm text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{category.name}</h3>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  {category.description && <p className="text-[10px] sm:text-xs text-stone-500 mb-2 line-clamp-2">{category.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-stone-400">{category.productCount} products</span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(category)} className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cid)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h3 className="text-base sm:text-lg font-medium text-stone-900">{editingId ? "Edit Category" : "Add Category"}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-stone-400 hover:text-stone-900"><X size={18} /></button>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Image */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">Category Image</label>
                  {image ? (
                    <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-stone-100 mb-2 group">
                      <Image src={image} alt="" fill className="object-cover" sizes="400px" />
                      <button onClick={() => setImage("")} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full h-28 sm:h-32 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors mb-2">
                      {uploading ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={20} /><span className="text-xs mt-1">Upload Image</span></>}
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">Category Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" placeholder="e.g., Skincare" />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">Description</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none" placeholder="Category description" />
                </div>

                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{saveError}</div>
                )}
                <div className="flex gap-3 pt-2 pb-2">
                  <button onClick={() => { setShowModal(false); setSaveError(""); }} className="flex-1 py-2.5 sm:py-3 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving || !name} className="flex-1 py-2.5 sm:py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {editingId ? "Update" : "Add Category"}
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
