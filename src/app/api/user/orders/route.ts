import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export const dynamic = "force-dynamic";

// GET orders for logged-in user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const email = session.user.email.toLowerCase();

    await connectDB();

    // Query by userId first (reliable), fall back to email for older orders
    let orders;
    if (userId) {
      orders = await Order.find({
        $or: [{ userId }, { email, userId: { $exists: false } }],
      })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      orders = await Order.find({ email })
        .sort({ createdAt: -1 })
        .lean();
    }

    const mapped = orders.map((o) => ({
      id: o._id.toString(),
      orderId: o.orderId,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      shippingAddress: o.shippingAddress,
      phone: o.phone,
      createdAt: o.createdAt,
    }));

    const response = NextResponse.json({ orders: mapped });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (error) {
    console.error("Get user orders error:", error);
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 });
  }
}
