import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find by email OR username
    const isEmail = identifier.includes("@");
    const user = isEmail
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ username: identifier.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: isEmail
            ? "No account found with this email"
            : "No account found with this username" },
        { status: 404 }
      );
    }

    // Check if account is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "UNVERIFIED", email: user.email },
        { status: 403 }
      );
    }

    // Check if account is locked (brute force protection)
    if (user.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Account locked. Try again in ${mins} minute(s)` },
        { status: 423 }
      );
    }

    // Check if user signed up via social login (no password set)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google or Facebook login. Please sign in with your social account instead." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      // Lock after 5 failed attempts for 15 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }
      await user.save();

      const remaining = 5 - (user.loginAttempts || 0);
      return NextResponse.json(
        { error: remaining > 0 && remaining < 3
            ? `Incorrect password. ${remaining} attempt(s) left before account lock`
            : "Incorrect password" },
        { status: 401 }
      );
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Login validation error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
