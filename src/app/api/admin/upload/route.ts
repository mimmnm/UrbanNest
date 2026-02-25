import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-token";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    const adminId = cookieStore.get("admin_id")?.value;

    if (!adminSession || !adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET || "";
    const isValid = await verifyAdminToken(adminSession, secret);
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      // Allow images and videos
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        continue;
      }

      // Max 10MB per file (Cloudinary supports larger files)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(buffer, "urbannest/products");
      urls.push(cloudinaryUrl);
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "No valid files were uploaded (max 10MB, images & videos only)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
