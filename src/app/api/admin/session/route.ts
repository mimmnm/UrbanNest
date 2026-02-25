import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    const adminId = cookieStore.get("admin_id")?.value;

    if (!adminSession || !adminId) {
      return NextResponse.json({ authenticated: false });
    }

    const secret = process.env.AUTH_SECRET || "";
    const isValid = await verifyAdminToken(adminSession, secret);
    return NextResponse.json({ authenticated: isValid });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST() {
  // Admin session is now created in /api/admin/login
  // This endpoint kept for compatibility but no longer creates sessions
  return NextResponse.json({ error: "Use /api/admin/login instead" }, { status: 410 });
}

export async function DELETE(req: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  response.cookies.delete("admin_id");

  // Verify the token was valid before confirming logout
  const cookieHeader = req.headers.get("cookie") || "";
  const adminSessionMatch = cookieHeader.match(/admin_session=([^;]+)/);
  if (adminSessionMatch) {
    const secret = process.env.AUTH_SECRET || "";
    const isValid = await verifyAdminToken(adminSessionMatch[1], secret);
    if (isValid) {
      // Valid session was cleared — proper logout
      return response;
    }
  }

  return response;
}
