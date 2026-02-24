import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/admin-token";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import AdminShell from "./AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ═══ Server-side admin verification (admins collection only) ═══
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get("admin_session")?.value;
  const adminId = cookieStore.get("admin_id")?.value;

  if (!adminSessionCookie || !adminId) {
    redirect("/mehedimnm/login");
  }

  // Verify signed admin token
  const secret = process.env.AUTH_SECRET || "";
  const isValid = await verifyAdminToken(adminSessionCookie, secret);

  if (!isValid) {
    redirect("/mehedimnm/login");
  }

  // Verify admin still exists in admins collection
  await connectDB();
  const admin = await Admin.findById(adminId).select("_id").lean();

  if (!admin) {
    redirect("/mehedimnm/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
