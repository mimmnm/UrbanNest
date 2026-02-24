"use client";

import { motion } from "framer-motion";
import { Store, Globe, CreditCard, Bell, Save } from "lucide-react";

const settingsSections = [
  {
    icon: Store,
    title: "Store Information",
    description: "General store details and branding",
    fields: [
      { label: "Store Name", value: "UrbanNest", type: "text" },
      { label: "Store Email", value: "hello@urbannest.com", type: "email" },
      { label: "Phone", value: "+1 (555) 123-4567", type: "tel" },
      {
        label: "Address",
        value: "123 Design District, Portland, OR 97201",
        type: "text",
      },
    ],
  },
  {
    icon: Globe,
    title: "SEO & Social",
    description: "Search engine optimization and social media",
    fields: [
      {
        label: "Meta Title",
        value: "UrbanNest — Modern Minimalist Home Store",
        type: "text",
      },
      {
        label: "Meta Description",
        value: "Curating modern, minimalist home essentials for thoughtful living spaces.",
        type: "text",
      },
      { label: "Instagram", value: "@urbannest", type: "text" },
      { label: "Twitter", value: "@urbannest", type: "text" },
    ],
  },
  {
    icon: CreditCard,
    title: "Payment",
    description: "Payment methods and processing",
    fields: [
      { label: "Currency", value: "USD", type: "text" },
      {
        label: "Stripe Key",
        value: "sk_test_****",
        type: "password",
      },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email and push notification settings",
    fields: [],
    toggles: [
      { label: "New order notifications", enabled: true },
      { label: "Low stock alerts", enabled: true },
      { label: "Customer signup notifications", enabled: false },
      { label: "Weekly report email", enabled: true },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light text-stone-900">Settings</h2>
        <p className="text-sm text-stone-500 mt-1">
          Manage your store configuration
        </p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <section.icon size={16} className="text-stone-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-900">
                {section.title}
              </h3>
              <p className="text-xs text-stone-400">{section.description}</p>
            </div>
          </div>
          <div className="p-6">
            {section.fields && section.fields.length > 0 && (
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs text-stone-500 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {section.toggles && (
              <div className="space-y-4">
                {section.toggles.map((toggle) => (
                  <div
                    key={toggle.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-stone-700">
                      {toggle.label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={toggle.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900" />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          <Save size={16} />
          Save Changes
        </motion.button>
      </div>
    </motion.div>
  );
}
