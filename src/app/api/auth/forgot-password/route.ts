import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { sendOtpEmail, generateOtp } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({
        message: "If an account exists with this email, you will receive an OTP.",
      });
    }

    // Check if user signed up with social login (no password)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google or Facebook login. Password reset is not available." },
        { status: 400 }
      );
    }

    // Check existing OTP cooldown
    const existingOtp = await Otp.findOne({
      email: email.toLowerCase(),
      type: "forgot-password",
    });

    if (existingOtp) {
      const timeSinceLastSent = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      const resendCount = existingOtp.resendCount || 0;
      const cooldown = resendCount === 0 ? 60 * 1000 : 5 * 60 * 1000;

      if (timeSinceLastSent < cooldown) {
        const remaining = Math.ceil((cooldown - timeSinceLastSent) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remaining} seconds before resending.`, remainingSeconds: remaining },
          { status: 429 }
        );
      }

      // Update existing
      const otp = generateOtp();
      existingOtp.otp = otp;
      existingOtp.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      existingOtp.attempts = 0;
      existingOtp.lastSentAt = new Date();
      existingOtp.resendCount = resendCount + 1;
      await existingOtp.save();

      await sendOtpEmail(email.toLowerCase(), otp, "forgot-password");
      return NextResponse.json({
        message: "OTP sent to your email.",
        nextResendSeconds: 5 * 60,
      });
    }

    // Create new OTP
    const otp = generateOtp();
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      type: "forgot-password",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendOtpEmail(email.toLowerCase(), otp, "forgot-password");

    return NextResponse.json({
      message: "OTP sent to your email.",
      nextResendSeconds: 60,
    });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
