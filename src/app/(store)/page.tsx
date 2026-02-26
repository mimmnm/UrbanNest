import { connectDB } from "@/lib/mongodb";
import { Product as ProductModel } from "@/models/Product";
import { Category as CategoryModel } from "@/models/Category";
import type { Product, Category } from "@/lib/data";
import HomePageClient from "./HomePageClient";

export const dynamic = "force-dynamic";

async function getHomeData(): Promise<{
  categories: Category[];
  bestSellers: Product[];
  newArrivals: Product[];
}> {
  try {
    await connectDB();

    const [categoryDocs, bsDocs, naDocs] = await Promise.all([
      CategoryModel.find().sort({ name: 1 }).lean(),
      ProductModel.find({ inStock: true, isBestSeller: true }).sort({ rating: -1 }).limit(8).lean(),
      ProductModel.find({ inStock: true, isNew: true }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    // Count products per category
    const categories: Category[] = await Promise.all(
      categoryDocs.map(async (cat) => {
        const productCount = await ProductModel.countDocuments({ category: cat.slug });
        return {
          id: cat._id.toString(),
          name: cat.name as string,
          slug: cat.slug as string,
          description: (cat.description as string) || "",
          image: (cat.image as string) || "",
          productCount,
        };
      })
    );

    const mapProduct = (p: Record<string, unknown>): Product => ({
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
    });

    return {
      categories,
      bestSellers: (bsDocs as Record<string, unknown>[]).map(mapProduct),
      newArrivals: (naDocs as Record<string, unknown>[]).map(mapProduct),
    };
  } catch (error) {
    console.error("Home page data error:", error);
    return { categories: [], bestSellers: [], newArrivals: [] };
  }
}

export default async function HomePage() {
  const { categories, bestSellers, newArrivals } = await getHomeData();
  return (
    <HomePageClient
      initialCategories={categories}
      initialBestSellers={bestSellers}
      initialNewArrivals={newArrivals}
    />
  );
}