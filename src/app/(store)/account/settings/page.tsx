"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Camera, Save, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar,
  CheckCircle, AlertTriangle, Loader2,
} from "lucide-react";
import { uploadUserAvatar } from "@/lib/user-upload";

interface ProfileForm {
  name: string;
  phone: string;
  avatar: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
}

export default function AccountSettingsPage() {
  const [form, setForm] = useState<ProfileForm>({
    name: "", phone: "", avatar: "", address: "", city: "",
    district: "", zipCode: "", dateOfBirth: "", gender: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            name: d.user.name || "",
            phone: d.user.phone || "",
            avatar: d.user.avatar || "",
            address: d.user.address || "",
            city: d.user.city || "",
            district: d.user.district || "",
            zipCode: d.user.zipCode || "",
            dateOfBirth: d.user.dateOfBirth ? d.user.dateOfBirth.slice(0, 10) : "",
            gender: d.user.gender || "",
          });
          setEmail(d.user.email || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadUserAvatar(file);
      setForm((p) => ({ ...p, avatar: url }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setMessage(null);

    if (!form.phone.trim()) {
      setMessage({ type: "error", text: "মোবাইল নম্বর আবশ্যক। অনুগ্রহ করে আপনার মোবাইল নম্বর দিন।" });
      return;
    }

    if (showPasswordSection) {
      if (newPassword && newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
      }
      if (newPassword && newPassword.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
        return;
      }
    }

    setSaving(true);
    try {
      const body: Record<string, string> = { ...form };
      if (showPasswordSection && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save." });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        if (showPasswordSection && newPassword) {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setShowPasswordSection(false);
        }
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    );
  }

  const Field = ({ label, icon: Icon, required, children }: { label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-display text-[#555] uppercase tracking-wider mb-2">
        <Icon size={13} className="text-[#66a80f]" /> {label}
        {required && <span className="text-red-500 text-sm">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-[#f8f6f3] border border-[#d4e8c2]/40 rounded-xl px-4 py-3 text-sm font-display text-[#111] placeholder:text-[#b5b5b5] focus:outline-none focus:ring-2 focus:ring-[#66a80f]/30 transition";

  return (
    <div className="space-y-5">
      {/* Message */}
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-display ${
            message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </motion.div>
      )}

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 md:p-6">
        <h2 className="font-display text-base font-semibold text-[#111] mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-[#e8f5d6] overflow-hidden border-2 border-[#d4e8c2]">
              {form.avatar ? (
                <Image src={form.avatar} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={28} className="text-[#66a80f]" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              {uploading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="text-sm font-display font-medium text-[#111]">{form.name || "Your Name"}</p>
            <p className="text-xs text-[#a1a1aa]">{email}</p>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="mt-2 text-xs font-display text-[#66a80f] hover:underline"
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 md:p-6">
        <h2 className="font-display text-base font-semibold text-[#111] mb-5">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" icon={User}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          </Field>
          <Field label="Mobile Number" icon={Phone} required>
            <input className={`${inputCls} ${!form.phone ? "ring-2 ring-red-300" : ""}`} value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="01XXXXXXXXX" type="tel"
            />
            {!form.phone && (
              <p className="text-[11px] text-red-500 mt-1 font-display">মোবাইল নম্বর আবশ্যক</p>
            )}
          </Field>
          <Field label="Date of Birth" icon={Calendar}>
            <input className={inputCls} type="date" value={form.dateOfBirth}
              onChange={(e) => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
            />
          </Field>
          <Field label="Gender" icon={User}>
            <select className={inputCls} value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 md:p-6">
        <h2 className="font-display text-base font-semibold text-[#111] mb-5">Address</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Street Address" icon={MapPin}>
              <input className={inputCls} value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="House, Road, Area" />
            </Field>
          </div>
          <Field label="City" icon={MapPin}>
            <input className={inputCls} value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
          </Field>
          <Field label="District" icon={MapPin}>
            <input className={inputCls} value={form.district} onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))} placeholder="District" />
          </Field>
          <Field label="Zip Code" icon={MapPin}>
            <input className={inputCls} value={form.zipCode} onChange={(e) => setForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="Zip Code" />
          </Field>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-[#111]">Password</h2>
          <button onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="text-xs font-display text-[#66a80f] hover:underline"
          >
            {showPasswordSection ? "Cancel" : "Change Password"}
          </button>
        </div>
        {showPasswordSection && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
            <Field label="Current Password" icon={Lock}>
              <div className="relative">
                <input className={inputCls} type={showCurrent ? "text" : "password"} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password"
                />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="New Password" icon={Lock}>
                <div className="relative">
                  <input className={inputCls} type={showNew ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password" icon={Lock}>
                <input className={inputCls} type={showNew ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password"
                />
              </Field>
            </div>
          </motion.div>
        )}
        {!showPasswordSection && (
          <p className="text-xs text-[#a1a1aa] font-display">Click &quot;Change Password&quot; to update your password.</p>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#111] text-white px-7 py-3 rounded-xl font-display text-sm font-medium hover:bg-[#222] transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
