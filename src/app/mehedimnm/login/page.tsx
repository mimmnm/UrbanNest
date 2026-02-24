"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserCircle, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/mehedimnm");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0d0d0d] flex items-center justify-center px-5 sm:px-6 py-6 sm:py-8 relative overflow-hidden select-none">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#66a80f]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#66a80f]/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.01] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="font-display text-2xl sm:text-3xl font-semibold text-white inline-block">
            Urban<span className="text-[#66a80f]">Nest</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ShieldCheck size={14} className="text-[#66a80f]" />
            <span className="text-xs font-display uppercase tracking-[0.2em] text-white/40">Admin Panel</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-4 font-display"
          >
            <ArrowLeft size={14} /> Back to store
          </Link>

          <h1 className="font-display text-xl sm:text-2xl font-semibold text-white mb-1">
            Admin Sign In
          </h1>
          <p className="text-sm text-white/40 mb-5">
            Restricted access -- authorized personnel only
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400 font-display"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username */}
            <div>
              <label className="block text-xs font-display font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter admin username"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-display focus:outline-none focus:border-[#66a80f]/50 focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-display font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-display focus:outline-none focus:border-[#66a80f]/50 focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-[#66a80f] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#5a9a0d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} /> Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-white/25 text-center leading-relaxed">
              This area is protected. 5 failed attempts will lock your account for 15 minutes. All login activity is monitored.
            </p>
          </div>
        </div>

        <p className="text-center mt-4 text-xs text-white/25">
          Not an admin?{" "}
          <Link href="/login" className="text-[#66a80f]/70 hover:text-[#66a80f] hover:underline transition-colors">
            User login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
