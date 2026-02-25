"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Tag,
  Loader2,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError("");
    setShowModal(true);
  };

  const openEdit = (coupon: CouponItem) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      usageLimit: coupon.usageLimit.toString(),
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: new Date(coupon.endDate).toISOString().split("T")[0],
      isActive: coupon.isActive,
    });
    setSaveError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.endDate) return;
    setSaving(true);
    setSaveError("");
    const body = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    };
    try {
      const url = editingId
        ? `/api/admin/coupons/${editingId}`
        : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        fetchCoupons();
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveError(errData.error || "Failed to save coupon");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleActive = async (coupon: CouponItem) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isActive: !c.isActive } : c
          )
        );
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-light text-stone-900">
            Coupons
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage discount codes ({coupons.length} coupons)
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors flex-shrink-0"
        >
          <Plus size={16} /> Add Coupon
        </motion.button>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-stone-100">
          <Tag size={40} className="mx-auto text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">No coupons yet</p>
          <button onClick={openAdd} className="mt-3 text-sm text-stone-900 underline">
            Create your first coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {coupons.map((coupon, i) => {
            const expired = isExpired(coupon.endDate);
            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-xl sm:rounded-2xl border p-3 sm:p-5 transition-shadow hover:shadow-lg ${
                  !coupon.isActive || expired
                    ? "border-stone-200 opacity-70"
                    : "border-stone-100"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      coupon.discountType === "percentage"
                        ? "bg-violet-50"
                        : "bg-emerald-50"
                    }`}
                  >
                    {coupon.discountType === "percentage" ? (
                      <Percent
                        size={18}
                        className="sm:w-5 sm:h-5 text-violet-600"
                      />
                    ) : (
                      <DollarSign
                        size={18}
                        className="sm:w-5 sm:h-5 text-emerald-600"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded-lg text-sm font-mono font-bold text-stone-800 hover:bg-stone-200 transition-colors"
                          >
                            {coupon.code}
                            {copiedCode === coupon.code ? (
                              <CheckCircle size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} className="text-stone-400" />
                            )}
                          </button>
                          {/* Status badges */}
                          {expired && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                              Expired
                            </span>
                          )}
                          {!coupon.isActive && !expired && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500">
                              Inactive
                            </span>
                          )}
                          {coupon.isActive && !expired && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-stone-500 mt-1 truncate">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-xl font-bold text-stone-900">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : formatPrice(coupon.discountValue)}
                        </p>
                        <p className="text-[10px] text-stone-400">off</p>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] sm:text-xs text-stone-400">
                      {coupon.minOrderAmount > 0 && (
                        <span>
                          Min: {formatPrice(coupon.minOrderAmount)}
                        </span>
                      )}
                      {coupon.maxDiscount > 0 &&
                        coupon.discountType === "percentage" && (
                          <span>
                            Max: {formatPrice(coupon.maxDiscount)}
                          </span>
                        )}
                      {coupon.usageLimit > 0 && (
                        <span>
                          Used: {coupon.usedCount}/{coupon.usageLimit}
                        </span>
                      )}
                      <span>
                        {new Date(coupon.startDate).toLocaleDateString()} –{" "}
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-stone-100">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`text-xs font-medium transition-colors ${
                          coupon.isActive
                            ? "text-stone-500 hover:text-red-500"
                            : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1.5 sm:p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h3 className="text-base sm:text-lg font-medium text-stone-900">
                  {editingId ? "Edit Coupon" : "Create Coupon"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-stone-300"
                    placeholder="SUMMER20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    placeholder="Summer sale 20% off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      Discount Type
                    </label>
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discountType: e.target.value as "percentage" | "fixed",
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      placeholder={
                        form.discountType === "percentage" ? "20" : "500"
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      Min Order (৳)
                    </label>
                    <input
                      type="number"
                      value={form.minOrderAmount}
                      onChange={(e) =>
                        setForm({ ...form, minOrderAmount: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      {form.discountType === "percentage"
                        ? "Max Discount (৳)"
                        : "Usage Limit"}
                    </label>
                    <input
                      type="number"
                      value={
                        form.discountType === "percentage"
                          ? form.maxDiscount
                          : form.usageLimit
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [form.discountType === "percentage"
                            ? "maxDiscount"
                            : "usageLimit"]: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                {form.discountType === "percentage" && (
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      Usage Limit (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) =>
                        setForm({ ...form, usageLimit: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                      placeholder="0"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded border-stone-300"
                  />
                  Active (can be used by customers)
                </label>

                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {saveError}
                  </div>
                )}

                <div className="flex gap-3 pt-2 pb-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setSaveError("");
                    }}
                    className="flex-1 py-2.5 sm:py-3 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      saving || !form.code || !form.discountValue || !form.endDate
                    }
                    className="flex-1 py-2.5 sm:py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}
                    {editingId ? "Update" : "Create Coupon"}
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
