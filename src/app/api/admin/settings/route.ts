import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { StoreSettings } from "@/models/StoreSettings";
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

    // Get or create default settings
    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      settings = (await StoreSettings.create({})).toObject();
    }

    return NextResponse.json({ settings: { ...settings, id: settings._id.toString() } });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Get or create settings
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }

    // Update all provided fields
    const allowedFields = [
      "storeName", "storeEmail", "phone", "address",
      "metaTitle", "metaDescription", "instagram", "facebook", "twitter",
      "currency", "shippingFee", "freeShippingMin",
      "orderNotifications", "lowStockAlerts", "customerSignupNotifications", "weeklyReportEmail",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (settings as Record<string, unknown>)[field] = body[field];
      }
    }

    await settings.save();

    return NextResponse.json({
      settings: { ...settings.toObject(), id: settings._id.toString() },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
