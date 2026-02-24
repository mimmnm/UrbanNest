"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate credentials with our API first for specific error messages
      const validateRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });

      if (!validateRes.ok) {
        const data = await validateRes.json();
        setError(data.error || "Login failed");
        return;
      }

      // Credentials valid — now sign in with NextAuth for session
      const res = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Login failed. Please try again.");
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
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#66a80f]/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#66a80f]/5 blur-3xl" />
        <div className="relative z-10 text-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-4xl font-semibold text-white mb-4">
              Welcome Back
            </h2>
            <p className="font-accent text-[#66a80f] text-xl mb-6">to your happy place</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              Sign in to access your account, track orders, manage your wishlist, and enjoy a personalized shopping experience.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Link
              href="/"
              className="font-display text-3xl font-semibold text-white"
            >
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-6 sm:py-8 lg:py-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-semibold text-[#111111]">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#111111] transition-colors mb-5 font-display"
          >
            <ArrowLeft size={16} /> Back to store
          </Link>

          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[#111111] mb-1">
            Sign In
          </h1>
          <p className="text-sm text-[#a1a1aa] mb-5">
            Enter your credentials to access your account
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-display"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div>
              <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-display font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#d4e8c2] text-[#66a80f] focus:ring-[#66a80f]/20"
                />
                <span className="text-sm text-[#a1a1aa]">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#66a80f] hover:underline font-display font-medium"
              >
                Forgot password?
              </Link>
            </div>

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
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-[#d4e8c2]" />
            <span className="text-xs text-[#a1a1aa] font-display">or continue with</span>
            <div className="flex-1 h-px bg-[#d4e8c2]" />
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-5">
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

          {/* Create Account */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-[#d4e8c2]" />
            <span className="text-xs text-[#a1a1aa] font-display">New here?</span>
            <div className="flex-1 h-px bg-[#d4e8c2]" />
          </div>

          <Link
            href="/signup"
            className="block w-full py-2.5 sm:py-3 text-center border-2 border-[#d4e8c2] text-[#111111] rounded-full font-display text-sm font-medium tracking-wide hover:border-[#66a80f] hover:bg-[#66a80f]/5 transition-all duration-300"
          >
            Create an Account
          </Link>

          {/* Admin link */}
          <p className="text-center mt-4 text-xs text-[#a1a1aa]">
            Admin?{" "}
            <Link href="/mehedimnm/login" className="text-[#66a80f] hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
