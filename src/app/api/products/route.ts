import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const filter = searchParams.get("filter") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");

    const query: Record<string, unknown> = { inStock: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }
    if (filter === "new") {
      query.isNew = true;
    } else if (filter === "bestseller") {
      query.isBestSeller = true;
    } else if (filter === "featured") {
      query.featured = true;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(filter === "new" ? { createdAt: -1 } : { rating: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.images?.[0] || "",
        images: p.images,
        category: p.category,
        rating: p.rating,
        reviews: p.reviews,
        inStock: p.inStock,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        featured: p.featured || false,
        tags: p.tags || [],
        colors: p.colors,
        sizes: p.sizes,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
