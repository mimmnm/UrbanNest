import { connectDB } from "@/lib/mongodb";
import { Product as ProductModel } from "@/models/Product";
import type { Product } from "@/lib/data";
import ProductsPageClient from "./ProductsPageClient";

export const dynamic = "force-dynamic";

async function getAllProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const docs = await ProductModel.find().sort({ createdAt: -1 }).limit(200).lean();
    return (docs as Record<string, unknown>[]).map((p) => ({
      id: (p._id as object).toString(),
      name: p.name as string,
      slug: (p.slug as string) || "",
      description: (p.description as string) || "",
      price: p.price as number,
      originalPrice: (p.originalPrice as number) || (p.price as number),
      image: ((p.images as string[]) || [])[0] || "",
      images: (p.images as string[]) || [],
      category: (p.category as string) || "",
      rating: (p.rating as number) || 0,
      reviews: (p.reviews as number) || 0,
      inStock: (p.inStock as boolean) ?? true,
      isNew: (p.isNew as boolean) || false,
      isBestSeller: (p.isBestSeller as boolean) || false,
      featured: (p.featured as boolean) || false,
      colors: (p.colors as string[]) || [],
      sizes: (p.sizes as string[]) || [],
    }));
  } catch (error) {
    console.error("Products page data error:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getAllProducts();
  return <ProductsPageClient initialProducts={products} />;
}
