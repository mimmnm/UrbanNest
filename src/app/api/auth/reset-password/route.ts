import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      type: "forgot-password",
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 404 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return NextResponse.json(
        { error: `Invalid OTP. ${remaining} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // OTP is correct — update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword, loginAttempts: 0, lockUntil: undefined }
    );

    // Delete OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      message: "Password reset successfully! You can now sign in.",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
