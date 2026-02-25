"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Store,
  Tag,
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/mehedimnm", icon: LayoutDashboard },
  { name: "Products", href: "/mehedimnm/products", icon: Package },
  { name: "Orders", href: "/mehedimnm/orders", icon: ShoppingCart },
  { name: "Customers", href: "/mehedimnm/customers", icon: Users },
  { name: "Categories", href: "/mehedimnm/categories", icon: FolderTree },
  { name: "Coupons", href: "/mehedimnm/coupons", icon: Tag },
  { name: "Settings", href: "/mehedimnm/settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIMEOUT = 15 * 60 * 1000;

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/mehedimnm/login");
    router.refresh();
  }, [router]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => handleLogout(), IDLE_TIMEOUT);
  }, [handleLogout, IDLE_TIMEOUT]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const onActivity = () => resetIdleTimer();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [pathname, resetIdleTimer]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const currentPageName = sidebarLinks.find(
    (l) => pathname === l.href || (l.href !== "/mehedimnm" && pathname.startsWith(l.href))
  )?.name || "Dashboard";

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white border-r border-stone-200 fixed inset-y-0 left-0 z-50">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-stone-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-stone-900 tracking-wide block truncate">UrbanNest</span>
            <p className="text-[10px] text-stone-400 tracking-wider uppercase">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/mehedimnm" && pathname.startsWith(link.href));
            return (
              <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}>
                <link.icon size={18} />
                <span className="truncate">{link.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-50 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-stone-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors">
            <Store size={18} /><span>View Store</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-5 h-16 border-b border-stone-100 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center flex-shrink-0">
                    <Store size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-stone-900 truncate">UrbanNest</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 flex-shrink-0"><X size={18} /></button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/mehedimnm" && pathname.startsWith(link.href));
                  return (
                    <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"}`}>
                      <link.icon size={18} /><span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-stone-100 flex-shrink-0">
                <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                  <Store size={18} /><span>View Store</span>
                </Link>
                <button onClick={() => { setSidebarOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                  <LogOut size={18} /><span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 xl:ml-72 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/50 h-14 sm:h-16 flex items-center px-3 sm:px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-1 text-stone-600 hover:text-stone-900 flex-shrink-0">
            <Menu size={20} />
          </button>
          <div className="flex-1 flex items-center justify-between ml-1 lg:ml-0 min-w-0">
            <h1 className="text-sm font-medium text-stone-900 truncate">{currentPageName}</h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                <span className="text-xs font-medium text-stone-600">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content — with proper padding and overflow handling */}
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
