import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      type: "signup",
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

    // OTP is valid — activate user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Delete the OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      message: "Email verified successfully! You can now sign in.",
      verified: true,
    });
  } catch (error: unknown) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
