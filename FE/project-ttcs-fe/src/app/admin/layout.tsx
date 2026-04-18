"use client";

import React from "react";
import { AdminRoute } from "@/components/AdminRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  Settings,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin" },
  { name: "Sản phẩm", icon: <Package className="w-5 h-5" />, href: "/admin/products" },
  { name: "Đơn hàng", icon: <ShoppingBag className="w-5 h-5" />, href: "/admin/orders" },
  { name: "Người dùng", icon: <Users className="w-5 h-5" />, href: "/admin/users" },
  { name: "Danh mục", icon: <Tag className="w-5 h-5" />, href: "/admin/categories" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900 text-white shrink-0 hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-8 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-xl font-black tracking-tighter">VPH ADMIN</span>
            </Link>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-black text-sm uppercase tracking-widest">{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-white/10">
            <Link href="/user/profile" className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Thiết lập</p>
                <p className="text-sm font-bold truncate">Cài đặt hệ thống</p>
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
