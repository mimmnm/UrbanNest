import mongoose, { Schema, type Document } from "mongoose";

export interface IStoreSettings extends Document {
  storeName: string;
  storeEmail: string;
  phone: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  instagram: string;
  facebook: string;
  twitter: string;
  currency: string;
  shippingFee: number;
  freeShippingMin: number;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  customerSignupNotifications: boolean;
  weeklyReportEmail: boolean;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, default: "UrbanNest" },
    storeEmail: { type: String, default: "hello@urbannest.com.bd" },
    phone: { type: String, default: "+880 1700-000000" },
    address: { type: String, default: "Gulshan 2, Dhaka 1212" },
    metaTitle: { type: String, default: "UrbanNest — Premium Beauty & Fashion" },
    metaDescription: { type: String, default: "Curated beauty, skincare, and fashion essentials for the modern woman." },
    instagram: { type: String, default: "@urbannest" },
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    currency: { type: String, default: "BDT" },
    shippingFee: { type: Number, default: 120 },
    freeShippingMin: { type: Number, default: 7500 },
    orderNotifications: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    customerSignupNotifications: { type: Boolean, default: false },
    weeklyReportEmail: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
