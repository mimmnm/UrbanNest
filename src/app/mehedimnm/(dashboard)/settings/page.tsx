"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Store,
  Globe,
  CreditCard,
  Bell,
  Save,
  Loader2,
  CheckCircle,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { uploadFiles } from "@/lib/upload";

interface SettingsData {
  storeName: string;
  logo: string;
  storeEmail: string;
  phone: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  instagram: string;
  facebook: string;
  twitter: string;
  currency: string;
  shippingFee: number;
  freeShippingMin: number;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  customerSignupNotifications: boolean;
  weeklyReportEmail: boolean;
}

const defaultSettings: SettingsData = {
  storeName: "UrbanNest",
  logo: "",
  storeEmail: "hello@urbannest.com.bd",
  phone: "+880 1700-000000",
  address: "Gulshan 2, Dhaka 1212",
  metaTitle: "UrbanNest — Premium Beauty & Fashion",
  metaDescription: "Curated beauty, skincare, and fashion essentials for the modern woman.",
  instagram: "@urbannest",
  facebook: "",
  twitter: "",
  currency: "BDT",
  shippingFee: 120,
  freeShippingMin: 7500,
  orderNotifications: true,
  lowStockAlerts: true,
  customerSignupNotifications: false,
  weeklyReportEmail: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadFiles(files);
      if (urls[0]) {
        setSettings((prev) => ({ ...prev, logo: urls[0] }));
      } else {
        setUploadError("আপলোড সফল হয়নি — কোনো URL পাওয়া যায়নি");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      console.error("Logo upload failed:", err);
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const updateField = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const sections = [
    {
      icon: Store,
      title: "Store Information",
      description: "General store details and branding",
      fields: [
        { label: "Store Name", key: "storeName" as const, type: "text" },
        { label: "Store Email", key: "storeEmail" as const, type: "email" },
        { label: "Phone", key: "phone" as const, type: "tel" },
        { label: "Address", key: "address" as const, type: "text" },
      ],
    },
    {
      icon: Globe,
      title: "SEO & Social",
      description: "Search engine optimization and social media",
      fields: [
        { label: "Meta Title", key: "metaTitle" as const, type: "text" },
        { label: "Meta Description", key: "metaDescription" as const, type: "text" },
        { label: "Instagram", key: "instagram" as const, type: "text" },
        { label: "Facebook", key: "facebook" as const, type: "text" },
        { label: "Twitter", key: "twitter" as const, type: "text" },
      ],
    },
    {
      icon: CreditCard,
      title: "Shipping & Payment",
      description: "Shipping fees and payment settings",
      fields: [
        { label: "Currency", key: "currency" as const, type: "text" },
        { label: "Shipping Fee (৳)", key: "shippingFee" as const, type: "number" },
        { label: "Free Shipping Minimum (৳)", key: "freeShippingMin" as const, type: "number" },
      ],
    },
  ];

  const toggles: { label: string; key: keyof SettingsData }[] = [
    { label: "New order notifications", key: "orderNotifications" },
    { label: "Low stock alerts", key: "lowStockAlerts" },
    { label: "Customer signup notifications", key: "customerSignupNotifications" },
    { label: "Weekly report email", key: "weeklyReportEmail" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-light text-stone-900">Settings</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">Manage your store configuration</p>
      </div>

      {/* Logo Upload Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
            <ImageIcon size={16} className="text-stone-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-stone-900">Store Logo</h3>
            <p className="text-xs text-stone-400 truncate">Displayed in the store header next to the name</p>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {settings.logo ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 group flex-shrink-0">
                <Image src={settings.logo} alt="Store Logo" fill className="object-contain" sizes="80px" />
                <button onClick={() => updateField("logo", "")} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <button onClick={() => logoInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={20} /><span className="text-[10px] mt-1">Upload</span></>}
              </button>
            )}
            <div className="min-w-0">
              <p className="text-sm text-stone-700">{settings.logo ? "Logo uploaded. Click the X to remove." : "Upload your store logo (recommended: 200×200px, PNG or SVG)."}</p>
              {settings.logo && (
                <button onClick={() => logoInputRef.current?.click()} className="text-xs text-stone-500 hover:text-stone-900 mt-1 underline">
                  {uploading ? "Uploading..." : "Replace logo"}
                </button>
              )}
            </div>
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
        </div>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
              <section.icon size={16} className="text-stone-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-stone-900">{section.title}</h3>
              <p className="text-xs text-stone-400 truncate">{section.description}</p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-stone-500 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={settings[field.key] as string | number}
                  onChange={(e) => updateField(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
            <Bell size={16} className="text-stone-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-stone-900">Notifications</h3>
            <p className="text-xs text-stone-400 truncate">Email and notification settings</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {toggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-stone-700 min-w-0">{toggle.label}</span>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={settings[toggle.key] as boolean} onChange={(e) => updateField(toggle.key, e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-2 pb-4">
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center gap-2 text-sm text-emerald-600">
            <CheckCircle size={16} /> Settings saved!
          </motion.div>
        )}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </motion.button>
      </div>
    </motion.div>
  );
}
