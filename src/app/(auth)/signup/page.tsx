"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, User, Phone } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      const signInRes = await signIn("credentials", {
        identifier: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white flex">
      {/* Left: Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111111] items-center justify-center overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#66a80f]/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#66a80f]/5 blur-3xl" />
        <div className="relative z-10 text-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-4xl font-semibold text-white mb-4">
              Join UrbanNest
            </h2>
            <p className="font-accent text-[#66a80f] text-xl mb-6">your beauty journey starts here</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              Create your free account and unlock exclusive deals, early access to new arrivals, and a curated shopping experience just for you.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Link href="/" className="font-display text-3xl font-semibold text-white">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-5 sm:py-6 lg:py-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md my-auto"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-4 text-center">
            <Link href="/" className="font-display text-2xl font-semibold text-[#111111]">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#111111] transition-colors mb-4 font-display"
          >
            <ArrowLeft size={16} /> Back to store
          </Link>

          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[#111111] mb-1">
            Create Account
          </h1>
          <p className="text-sm text-[#a1a1aa] mb-4">
            Fill in your details to get started
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-display"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Name & Phone — side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Phone <span className="text-[#a1a1aa] normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                />
              </div>
            </div>

            {/* Password & Confirm — side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Password */}
              <div>
                <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 chars"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#111111] transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 rounded border-[#d4e8c2] text-[#66a80f] focus:ring-[#66a80f]/20"
              />
              <span className="text-xs text-[#a1a1aa] leading-relaxed">
                I agree to the{" "}
                <Link href="/terms-of-service" className="text-[#66a80f] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-[#66a80f] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-[#111111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[#d4e8c2]" />
            <span className="text-xs text-[#a1a1aa] font-display">or sign up with</span>
            <div className="flex-1 h-px bg-[#d4e8c2]" />
          </div>

          {/* Social Signup */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex-1 flex items-center justify-center gap-2.5 py-2.5 sm:py-3 border-2 border-[#d4e8c2] rounded-full font-display text-sm font-medium text-[#111111] hover:border-[#66a80f] hover:bg-[#66a80f]/5 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn("facebook", { callbackUrl: "/" })}
              className="flex-1 flex items-center justify-center gap-2.5 py-2.5 sm:py-3 border-2 border-[#d4e8c2] rounded-full font-display text-sm font-medium text-[#111111] hover:border-[#66a80f] hover:bg-[#66a80f]/5 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Already have account */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-px bg-[#d4e8c2]" />
            <span className="text-xs text-[#a1a1aa] font-display">Already have an account?</span>
            <div className="flex-1 h-px bg-[#d4e8c2]" />
          </div>

          <Link
            href="/login"
            className="block w-full py-2.5 sm:py-3 text-center border-2 border-[#d4e8c2] text-[#111111] rounded-full font-display text-sm font-medium tracking-wide hover:border-[#66a80f] hover:bg-[#66a80f]/5 transition-all duration-300"
          >
            Sign In Instead
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
