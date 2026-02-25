import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { createAdminToken } from "@/lib/admin-token";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find admin ONLY from admins collection
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

    if (!admin) {
      return NextResponse.json(
        { error: "No admin account found with this username" },
        { status: 401 }
      );
    }

    // Check if account is locked (brute force protection)
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const mins = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${mins} minute(s)` },
        { status: 423 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      // Increment failed attempts
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      // Lock after 5 failed attempts for 15 minutes
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        admin.loginAttempts = 0;
        await admin.save();
        return NextResponse.json(
          { error: "Too many failed attempts. Account locked for 15 minutes." },
          { status: 423 }
        );
      }
      await admin.save();

      const remaining = 5 - (admin.loginAttempts || 0);
      return NextResponse.json(
        { error: remaining > 0 && remaining < 3
            ? `Incorrect password. ${remaining} attempt(s) left before account lock`
            : "Incorrect password" },
        { status: 401 }
      );
    }

    // Reset login attempts on success
    if (admin.loginAttempts > 0) {
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
    }

    // Create signed admin session token
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = await createAdminToken(secret);

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        username: admin.username,
      },
    });

    // Set signed admin session cookie
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 60 * 60, // 4 hours
    });

    // Store admin ID in cookie for server-side verification
    response.cookies.set("admin_id", admin._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
