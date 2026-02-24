/**
 * Admin Seed Script
 * Creates the admin account in the separate `admins` collection.
 *
 * Required env variables in .env.local:
 *   MONGODB_URI
 *   ADMIN_USERNAME
 *   ADMIN_PASSWORD
 *   ADMIN_NAME        (optional, defaults to "Admin")
 *   ADMIN_EMAIL       (optional)
 *
 * Usage: npx tsx scripts/seed-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!MONGODB_URI) {
  console.error("[ERROR] MONGODB_URI not found in .env.local");
  process.exit(1);
}
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error("[ERROR] ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env.local");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error("[ERROR] ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  avatar: { type: String, default: "" },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("[OK] Connected to MongoDB");

    const existing = await Admin.findOne({ username: ADMIN_USERNAME!.toLowerCase() });
    if (existing) {
      console.log(`[INFO] Admin '${ADMIN_USERNAME}' already exists. Updating password...`);
      existing.password = await bcrypt.hash(ADMIN_PASSWORD!, 12);
      await existing.save();
      console.log("[OK] Admin password updated");
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD!, 12);
      await Admin.create({
        name: ADMIN_NAME,
        username: ADMIN_USERNAME!.toLowerCase(),
        password: hashedPassword,
        ...(ADMIN_EMAIL && { email: ADMIN_EMAIL }),
      });
      console.log("[OK] Admin account created");
    }

    console.log("[OK] Done. Login at: /mehedimnm/login");
  } catch (error) {
    console.error("[ERROR]", error);
  } finally {
    await mongoose.disconnect();
    console.log("[OK] Disconnected from MongoDB");
  }
}

seedAdmin();
