"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/user/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Truy cập bị từ chối</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Bạn không có quyền quản trị viên để truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
        <Link 
          href="/"
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl"
        >
          QUAY LẠI TRANG CHỦ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
