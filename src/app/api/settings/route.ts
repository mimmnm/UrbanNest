import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { StoreSettings } from "@/models/StoreSettings";

// Public route — no auth required
// Store frontend fetches settings from here
export async function GET() {
  try {
    await connectDB();

    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      settings = (await StoreSettings.create({})).toObject();
    }

    // Return only public-safe fields
    return NextResponse.json({
      storeName: settings.storeName || "UrbanNest",
      logo: settings.logo || "",
      storeEmail: settings.storeEmail || "",
      phone: settings.phone || "",
      address: settings.address || "",
      metaTitle: settings.metaTitle || "",
      metaDescription: settings.metaDescription || "",
      instagram: settings.instagram || "",
      facebook: settings.facebook || "",
      twitter: settings.twitter || "",
      currency: settings.currency || "BDT",
      shippingFee: settings.shippingFee ?? 120,
      freeShippingMin: settings.freeShippingMin ?? 7500,
    });
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json({
      storeName: "UrbanNest",
      logo: "",
      storeEmail: "hello@urbannest.com.bd",
      phone: "+880 1700-000000",
      address: "Gulshan 2, Dhaka 1212",
      currency: "BDT",
      shippingFee: 120,
      freeShippingMin: 7500,
    });
  }
}
