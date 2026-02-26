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

    await connectDB();
    const orders = await Order.find({ email: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

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

    return NextResponse.json({ orders: mapped });
  } catch (error) {
    console.error("Get user orders error:", error);
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 });
  }
}
