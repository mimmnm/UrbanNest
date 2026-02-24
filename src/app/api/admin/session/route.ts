import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-token";

export async function GET() {
  // Return current admin session status (for client-side checks)
  // Actual verification done server-side in layout
  return NextResponse.json({ authenticated: true });
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
