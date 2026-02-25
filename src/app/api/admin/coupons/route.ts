import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-token";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session")?.value;
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminSession || !adminId) return false;
  const secret = process.env.AUTH_SECRET || "";
  return verifyAdminToken(adminSession, secret);
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    const formatted = coupons.map((c: Record<string, unknown>) => ({
      id: (c._id as object).toString(),
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
      startDate: c.startDate,
      endDate: c.endDate,
      isActive: c.isActive,
      createdAt: c.createdAt,
    }));
    return NextResponse.json({ coupons: formatted });
  } catch (error) {
    console.error("Fetch coupons error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = body;

    if (!code || !discountValue || !endDate) {
      return NextResponse.json({ error: "Code, discount value, and end date are required" }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description: description || "",
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      usageLimit: Number(usageLimit) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      isActive: isActive !== false,
    });

    return NextResponse.json({
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
