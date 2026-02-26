import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { sendOtpEmail, generateOtp } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If the user exists but is NOT verified, allow re-signup (resend OTP)
      if (!existingUser.isVerified) {
        const otp = generateOtp();
        await Otp.findOneAndUpdate(
          { email: email.toLowerCase(), type: "signup" },
          {
            otp,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            attempts: 0,
            lastSentAt: new Date(),
            resendCount: 0,
          },
          { upsert: true }
        );
        // Update user info in case they changed name/password
        existingUser.name = name;
        existingUser.password = await bcrypt.hash(password, 12);
        existingUser.phone = phone || "";
        await existingUser.save();

        await sendOtpEmail(email.toLowerCase(), otp, "signup");
        return NextResponse.json(
          { message: "OTP sent to your email", requiresVerification: true },
          { status: 201 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      isVerified: false,
    });

    // Generate OTP and send email
    const otp = generateOtp();
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      type: "signup",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    await sendOtpEmail(email.toLowerCase(), otp, "signup");

    return NextResponse.json(
      { message: "OTP sent to your email", requiresVerification: true },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
