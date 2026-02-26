import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { sendOtpEmail, generateOtp } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingOtp = await Otp.findOne({
      email: email.toLowerCase(),
      type,
    });

    if (existingOtp) {
      const timeSinceLastSent = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      const resendCount = existingOtp.resendCount || 0;

      // First resend: wait 1 minute. After that: wait 5 minutes.
      const cooldown = resendCount === 0 ? 60 * 1000 : 5 * 60 * 1000;

      if (timeSinceLastSent < cooldown) {
        const remaining = Math.ceil((cooldown - timeSinceLastSent) / 1000);
        return NextResponse.json(
          { error: `অনুগ্রহ করে ${remaining} সেকেন্ড অপেক্ষা করুন।`, remainingSeconds: remaining },
          { status: 429 }
        );
      }

      // Generate new OTP
      const otp = generateOtp();
      existingOtp.otp = otp;
      existingOtp.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      existingOtp.attempts = 0;
      existingOtp.lastSentAt = new Date();
      existingOtp.resendCount = resendCount + 1;
      await existingOtp.save();

      await sendOtpEmail(email.toLowerCase(), otp, type);

      return NextResponse.json({
        message: "New OTP sent to your email.",
        nextResendSeconds: 5 * 60,
      });
    }

    // No existing OTP — create a new one
    const otp = generateOtp();
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendOtpEmail(email.toLowerCase(), otp, type);

    return NextResponse.json({
      message: "OTP sent to your email.",
      nextResendSeconds: 60,
    });
  } catch (error: unknown) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP." },
      { status: 500 }
    );
  }
}
