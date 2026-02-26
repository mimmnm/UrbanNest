"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff,
  RefreshCw, CheckCircle, Send,
} from "lucide-react";

type Step = "email" | "otp" | "reset";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSentOnce, setOtpSentOnce] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ─── Step 1: Send OTP ───
  const handleSendOtp = async () => {
    if (!email.includes("@")) { setError("Valid email is required."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.remainingSeconds) setCooldown(data.remainingSeconds);
        setError(data.error);
        return;
      }
      setCooldown(data.nextResendSeconds || 60);
      setOtpSentOnce(true);
      setStep("otp");
    } catch { setError("Something went wrong."); } finally { setLoading(false); }
  };

  // ─── Step 2: Verify OTP → Step 3 ───
  const handleVerifyOtp = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) { setError("Enter 6-digit OTP."); return; }
    setError("");
    setStep("reset");
  };

  // ─── Step 3: Reset Password (requires OTP) ───
  const handleReset = async () => {
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If OTP was invalid, go back to otp step
        if (res.status === 400 || res.status === 404 || res.status === 410 || res.status === 429) {
          setStep("otp");
        }
        setError(data.error);
        return;
      }
      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 2500);
    } catch { setError("Something went wrong."); } finally { setLoading(false); }
  };

  // ─── Resend OTP ───
  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.remainingSeconds) setCooldown(data.remainingSeconds);
        setError(data.error);
        return;
      }
      setCooldown(data.nextResendSeconds || 300);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch { setError("Failed to resend."); } finally { setResending(false); }
  };

  // ─── OTP Input Helpers ───
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const n = [...otp]; for (let i = 0; i < 6; i++) n[i] = data[i] || "";
    setOtp(n);
    inputRefs.current[n.findIndex(d => !d) === -1 ? 5 : n.findIndex(d => !d)]?.focus();
  };

  return (
    <div className="min-h-dvh bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111] items-center justify-center overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#66a80f]/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#66a80f]/5 blur-3xl" />
        <div className="relative z-10 text-center px-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#66a80f]/10 flex items-center justify-center">
              <KeyRound size={40} className="text-[#66a80f]" />
            </div>
            <h2 className="font-display text-4xl font-semibold text-white mb-4">Reset Password</h2>
            <p className="font-accent text-[#66a80f] text-xl mb-6">don&apos;t worry, we got you</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              আপনার ইমেইলে একটি ভেরিফিকেশন কোড পাঠানো হবে। সেই কোড দিয়ে নতুন পাসওয়ার্ড সেট করুন।
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12">
            <Link href="/" className="font-display text-3xl font-semibold text-white">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-semibold text-[#111]">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </div>

          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#111] transition-colors mb-5 font-display">
            <ArrowLeft size={16} /> Back to login
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {["email", "otp", "reset"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? "bg-[#66a80f] text-white" :
                  ["email", "otp", "reset"].indexOf(step) > i ? "bg-[#111] text-white" : "bg-[#f0f0f0] text-[#ccc]"
                }`}>{i + 1}</div>
                {i < 2 && <div className={`w-8 h-[2px] ${["email", "otp", "reset"].indexOf(step) > i ? "bg-[#111]" : "bg-[#eee]"}`} />}
              </div>
            ))}
          </div>

          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3"
            >
              <CheckCircle size={20} className="text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 font-display">{success}</p>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-display"
            >{error}</motion.div>
          )}

          {!success && (
            <>
              {/* ═══ Step 1: Email ═══ */}
              {step === "email" && (
                <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#111] mb-1">পাসওয়ার্ড ভুলে গেছেন?</h1>
                  <p className="text-sm text-[#a1a1aa] mb-5 font-display">আপনার অ্যাকাউন্টের ইমেইল দিন, আমরা একটি OTP পাঠাব।</p>
                  <div className="mb-4">
                    <label className="block text-xs font-display font-semibold text-[#111] uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                      />
                    </div>
                  </div>
                  <button onClick={handleSendOtp} disabled={loading || !email}
                    className="w-full py-3 bg-[#111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send OTP</>}
                  </button>
                </motion.div>
              )}

              {/* ═══ Step 2: OTP ═══ */}
              {step === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#111] mb-1">OTP দিন</h1>
                  <div className="flex items-center gap-2 mb-5">
                    <Mail size={14} className="text-[#66a80f]" />
                    <p className="text-sm text-[#a1a1aa] font-display">{email}</p>
                  </div>
                  <p className="text-sm text-[#555] mb-5 font-display">আপনার ইমেইলে পাঠানো <strong>৬ সংখ্যার কোড</strong> দিন।</p>

                  <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input key={i} ref={(el) => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-display font-bold bg-[#f8f6f3] border-2 border-[#d4e8c2] rounded-xl focus:outline-none focus:border-[#66a80f] focus:ring-2 focus:ring-[#66a80f]/20 transition-all text-[#111]"
                      />
                    ))}
                  </div>

                  <button onClick={handleVerifyOtp} disabled={otp.join("").length !== 6}
                    className="w-full py-3 bg-[#111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
                  >
                    Next
                  </button>

                  <div className="text-center">
                    <button onClick={handleResend} disabled={resending || cooldown > 0}
                      className="inline-flex items-center gap-1.5 text-sm font-display font-medium text-[#66a80f] hover:underline disabled:text-[#ccc] disabled:no-underline transition"
                    >
                      <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                      {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend OTP"}
                    </button>
                    {otpSentOnce && cooldown > 0 && (
                      <p className="text-[10px] text-[#a1a1aa] mt-1 font-display">
                        পরবর্তী রিসেন্ড ৫ মিনিট পর
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ Step 3: New Password ═══ */}
              {step === "reset" && (
                <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#111] mb-1">নতুন পাসওয়ার্ড সেট করুন</h1>
                  <p className="text-sm text-[#a1a1aa] mb-5 font-display">আপনার নতুন পাসওয়ার্ড দিন।</p>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-xs font-display font-semibold text-[#111] uppercase tracking-wider mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                        <input type={showPassword ? "text" : "password"} value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters"
                          className="w-full pl-11 pr-12 py-3 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#111]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-display font-semibold text-[#111] uppercase tracking-wider mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                        <input type={showPassword ? "text" : "password"} value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                          className="w-full pl-11 pr-4 py-3 bg-[#f8f6f3] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]"
                        />
                      </div>
                    </div>
                  </div>
                  <button onClick={handleReset} disabled={loading || !newPassword || !confirmPassword}
                    className="w-full py-3 bg-[#111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={16} /> Reset Password</>}
                  </button>
                </motion.div>
              )}
            </>
          )}

          <p className="text-center mt-6 text-xs text-[#a1a1aa] font-display">
            Remember your password?{" "}
            <Link href="/login" className="text-[#66a80f] hover:underline font-medium">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
