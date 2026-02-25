import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { slugify } from "@/lib/utils";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-token";
import { deleteFromCloudinary } from "@/lib/cloudinary";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session")?.value;
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminSession || !adminId) return false;
  const secret = process.env.AUTH_SECRET || "";
  return verifyAdminToken(adminSession, secret);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: { ...product, id: product._id.toString() } });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { name, description, price, originalPrice, images, category, tags, inStock, featured, isNew, isBestSeller, colors, sizes, sku, stock } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
      // Check slug collision
      const existing = await Product.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        updateData.slug = `${updateData.slug}-${Date.now().toString(36)}`;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (images !== undefined) updateData.images = images;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (featured !== undefined) updateData.featured = featured;
    if (isNew !== undefined) updateData.isNew = isNew;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;
    if (colors !== undefined) updateData.colors = colors;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (sku !== undefined) updateData.sku = sku;
    if (stock !== undefined) updateData.stock = Number(stock);

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: { ...product, id: product._id.toString() } });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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

    const { id } = await params;
    await connectDB();

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.allSettled(
        product.images
          .filter((url: string) => url.includes("cloudinary.com"))
          .map((url: string) => deleteFromCloudinary(url))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
