import { connectDB } from "@/lib/mongodb";
import { Product as ProductModel } from "@/models/Product";
import type { Product } from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function mapProduct(p: Record<string, unknown>): Product {
  return {
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
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await connectDB();
  const doc = await ProductModel.findOne({ slug }).lean();

  if (!doc) {
    notFound();
  }

  const product = mapProduct(doc as Record<string, unknown>);

  // Fetch related products
  let relatedProducts: Product[] = [];
  if (product.category) {
    const relDocs = await ProductModel.find({
      category: product.category,
      slug: { $ne: slug },
    })
      .limit(4)
      .lean();
    relatedProducts = (relDocs as Record<string, unknown>[]).map(mapProduct);
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
