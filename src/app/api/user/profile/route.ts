import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return { ...session.user, email: session.user.email.toLowerCase() };
}

// GET user profile
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: sessionUser.email })
      .select("-password -loginAttempts -lockUntil -__v")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
        zipCode: user.zipCode || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        createdAt: user.createdAt,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
  }
}

// PUT update profile
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const {
      name, phone, avatar, address, city, district, zipCode,
      dateOfBirth, gender, currentPassword, newPassword,
    } = body;

    const user = await User.findOne({ email: sessionUser.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate required fields
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
      }
      user.name = name.trim();
    }

    // Phone is mandatory for profile update
    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (district !== undefined) user.district = district.trim();
    if (zipCode !== undefined) user.zipCode = zipCode.trim();
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }
      // OAuth users may not have password
      if (user.password) {
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
        zipCode: user.zipCode || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
