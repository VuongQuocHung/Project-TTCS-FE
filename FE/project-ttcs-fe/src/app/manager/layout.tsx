"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, LayoutDashboard, Package, ShoppingBag, Ticket } from "lucide-react";
import { ManagerRoute } from "@/components/ManagerRoute";
import { useAuth } from "@/context/AuthContext";
import { branchApi } from "@/lib/api-endpoints";

const sidebarItems = [
  { name: "Tổng quan", icon: <LayoutDashboard className="w-5 h-5" />, href: "/manager" },
  { name: "Sản phẩm", icon: <Package className="w-5 h-5" />, href: "/manager/products" },
  { name: "Đơn hàng", icon: <ShoppingBag className="w-5 h-5" />, href: "/manager/orders" },
  { name: "Voucher", icon: <Ticket className="w-5 h-5" />, href: "/manager/vouchers" },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [branchName, setBranchName] = useState<string>("");

  useEffect(() => {
    const fetchBranch = async () => {
      if (!user?.branchId) return;
      try {
        const branches = await branchApi.getAllPublic();
        const found = branches.find((b) => b.id === user.branchId);
        if (found?.name) setBranchName(found.name);
      } catch {
        // ignore
      }
    };
    void fetchBranch();
  }, [user?.branchId]);

  return (
    <ManagerRoute>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <aside className="w-72 bg-slate-900 text-white shrink-0 hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-8 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-xl font-black tracking-tighter">HĐP MANAGER</span>
            </Link>
            {branchName && (
              <p className="text-sm text-slate-400 mt-2 font-medium">
                Chi nhánh: <span className="text-white">{branchName}</span>
              </p>
            )}
          </div>

          <nav className="flex-1 p-6 space-y-2">
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href));

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
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">{children}</main>
      </div>
    </ManagerRoute>
  );
}
