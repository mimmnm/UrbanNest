"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Store, Globe, CreditCard, Bell, Save, Loader2, CheckCircle } from "lucide-react";

interface SettingsData {
  storeName: string;
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-light text-stone-900">Settings</h2>
        <p className="text-sm text-stone-500 mt-1">Manage your store configuration</p>
      </div>

      {sections.map((section, i) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <section.icon size={16} className="text-stone-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-900">{section.title}</h3>
              <p className="text-xs text-stone-400">{section.description}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-stone-500 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={settings[field.key] as string | number}
                  onChange={(e) => updateField(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
            <Bell size={16} className="text-stone-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-stone-900">Notifications</h3>
            <p className="text-xs text-stone-400">Email and notification settings</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {toggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between">
              <span className="text-sm text-stone-700">{toggle.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[toggle.key] as boolean}
                  onChange={(e) => updateField(toggle.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end gap-3 pt-4">
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle size={16} /> Settings saved!
          </motion.div>
        )}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </motion.button>
      </div>
    </motion.div>
  );
}
