import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { StoreDataProvider, type StoreSettings } from "@/lib/store-data-context";
import { connectDB } from "@/lib/mongodb";
import { StoreSettings as StoreSettingsModel } from "@/models/StoreSettings";
import { Category as CategoryModel } from "@/models/Category";
import { Product } from "@/models/Product";
import type { Category } from "@/lib/data";

async function getStoreData(): Promise<{
  settings: StoreSettings;
  categories: Category[];
}> {
  try {
    await connectDB();

    const [settingsDoc, categoryDocs] = await Promise.all([
      StoreSettingsModel.findOne().lean(),
      CategoryModel.find().sort({ name: 1 }).lean(),
    ]);

    const s = (settingsDoc || {}) as Record<string, unknown>;
    const settings: StoreSettings = {
      storeName: (s.storeName as string) || "UrbanNest",
      logo: (s.logo as string) || "",
      storeEmail: (s.storeEmail as string) || "",
      phone: (s.phone as string) || "",
      address: (s.address as string) || "",
      instagram: (s.instagram as string) || "",
      facebook: (s.facebook as string) || "",
      twitter: (s.twitter as string) || "",
      currency: (s.currency as string) || "BDT",
      shippingFee: (s.shippingFee as number) ?? 120,
      freeShippingMin: (s.freeShippingMin as number) ?? 7500,
    };

    const categories: Category[] = await Promise.all(
      categoryDocs.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat.slug });
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

    return { settings, categories };
  } catch (error) {
    console.error("Failed to fetch store data:", error);
    return {
      settings: {
        storeName: "UrbanNest", logo: "", storeEmail: "", phone: "",
        address: "", instagram: "", facebook: "", twitter: "",
        currency: "BDT", shippingFee: 120, freeShippingMin: 7500,
      },
      categories: [],
    };
  }
}

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, categories } = await getStoreData();

  return (
    <StoreDataProvider settings={settings} categories={categories}>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col bg-[#ffffff]">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </StoreDataProvider>
  );
}
