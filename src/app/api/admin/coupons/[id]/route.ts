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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "code", "description", "discountType", "discountValue",
      "minOrderAmount", "maxDiscount", "usageLimit", "startDate",
      "endDate", "isActive",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "code") updates[key] = String(body[key]).toUpperCase().trim();
        else if (key === "startDate" || key === "endDate") updates[key] = new Date(body[key]);
        else if (["discountValue", "minOrderAmount", "maxDiscount", "usageLimit"].includes(key)) updates[key] = Number(body[key]);
        else updates[key] = body[key];
      }
    }

    // If code is being updated, check for duplicates
    if (updates.code) {
      const existing = await Coupon.findOne({ code: updates.code, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const c = coupon as Record<string, unknown>;
    return NextResponse.json({
      coupon: {
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
      },
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
