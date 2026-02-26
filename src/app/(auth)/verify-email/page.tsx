"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ShieldCheck, RefreshCw, CheckCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start a 60s cooldown on mount (first OTP was just sent)
  useEffect(() => {
    setCooldown(60);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!email) router.push("/signup");
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = data[i] || "";
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpStr }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "signup" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.remainingSeconds) {
          setCooldown(data.remainingSeconds);
        }
        setError(data.error);
        return;
      }
      setCooldown(data.nextResendSeconds || 60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-dvh bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111111] items-center justify-center overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#66a80f]/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#66a80f]/5 blur-3xl" />
        <div className="relative z-10 text-center px-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#66a80f]/10 flex items-center justify-center">
              <ShieldCheck size={40} className="text-[#66a80f]" />
            </div>
            <h2 className="font-display text-4xl font-semibold text-white mb-4">Verify Your Email</h2>
            <p className="font-accent text-[#66a80f] text-xl mb-6">almost there!</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              Enter the 6-digit code sent to your email to activate your account.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12">
            <Link href="/" className="font-display text-3xl font-semibold text-white">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-semibold text-[#111]">
              Urban<span className="text-[#66a80f]">Nest</span>
            </Link>
          </div>

          <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#111] transition-colors mb-5 font-display">
            <ArrowLeft size={16} /> Back to signup
          </Link>

          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[#111] mb-1">
            Email Verification
          </h1>
          <div className="flex items-center gap-2 mb-6">
            <Mail size={14} className="text-[#66a80f]" />
            <p className="text-sm text-[#a1a1aa]">{email}</p>
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
            >
              {error}
            </motion.div>
          )}

          {!success && (
            <>
              <p className="text-sm text-[#555] mb-5 leading-relaxed font-display">
                A <strong>6-digit code</strong> has been sent to your email. The code will expire in <strong>15 minutes</strong>.
              </p>

              {/* OTP Input */}
              <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-display font-bold bg-[#f8f6f3] border-2 border-[#d4e8c2] rounded-xl focus:outline-none focus:border-[#66a80f] focus:ring-2 focus:ring-[#66a80f]/20 transition-all text-[#111]"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3 bg-[#111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} /> Verify Email
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-[#a1a1aa] mb-2 font-display">Didn&apos;t receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="inline-flex items-center gap-1.5 text-sm font-display font-medium text-[#66a80f] hover:underline disabled:text-[#ccc] disabled:no-underline transition"
                >
                  <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : resending
                    ? "Sending..."
                    : "Resend OTP"
                  }
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
