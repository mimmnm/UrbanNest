import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { customer, email, phone, shippingAddress, items, paymentMethod } = body;

    if (!customer || !email || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer name, email, and at least one item are required" },
        { status: 400 }
      );
    }

    // Generate order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(4, "0")}`;

    // Calculate totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) continue;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "",
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    const shipping = subtotal >= 7500 ? 0 : 120;
    const total = subtotal + shipping;

    const order = await Order.create({
      orderId,
      customer,
      email: email.toLowerCase(),
      phone: phone || "",
      shippingAddress: shippingAddress || "",
      items: orderItems,
      subtotal,
      shipping,
      total,
      status: "pending",
      paymentMethod: paymentMethod || "cod",
      paymentStatus: "unpaid",
    });

    return NextResponse.json(
      {
        order: {
          id: order._id.toString(),
          orderId: order.orderId,
          total: order.total,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
