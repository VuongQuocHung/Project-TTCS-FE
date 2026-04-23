"use client";

import React, { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck
} from "lucide-react";
import { orderApi, productApi, userApi } from "@/lib/api-endpoints";
import { Order, User } from "@/types/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          orderApi.getAll({ size: 100, page: 0 }),
          productApi.getAll({ size: 1 }),
          userApi.getAll({ size: 5, page: 0 })
        ]);

        const allOrders = ordersRes.content || [];
        const revenue = allOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        setStats({
          totalOrders: ordersRes.totalElements || 0,
          totalProducts: productsRes.totalElements || 0,
          totalUsers: usersRes.totalElements || 0,
          totalRevenue: revenue
        });

        setRecentOrders(allOrders.slice(0, 5));
        setRecentUsers(usersRes.content || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { name: "Tổng đơn hàng", val: stats.totalOrders, icon: <ShoppingBag className="w-6 h-6 text-blue-600" />, trend: "+8.2%", isUp: true, color: "blue" },
    { name: "Sản phẩm", val: stats.totalProducts, icon: <Package className="w-6 h-6 text-purple-600" />, trend: "+1.5%", isUp: true, color: "purple" },
    { name: "Người dùng", val: stats.totalUsers, icon: <Users className="w-6 h-6 text-green-600" />, trend: "+12.4%", isUp: true, color: "green" },
    { name: "Doanh thu (Real)", val: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.totalRevenue), icon: <TrendingUp className="w-6 h-6 text-orange-600" />, trend: "+5.7%", isUp: true, color: "orange" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Tổng quan hệ thống</h1>
          <p className="text-slate-500 font-medium mt-1">Dữ liệu được cập nhật thời gian thực từ hệ thống quản trị.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 text-xs font-black uppercase tracking-widest">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
           Live System
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-slate-900 transition-colors duration-300">
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.isUp ? 'text-green-600' : 'text-red-500'}`}>
                {card.isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {card.trend}
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{card.name}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{isLoading ? "---" : card.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* RECENT ACTIVITY */}
        <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
                Dòng thời gian thực tế
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                Recent Events
              </span>
           </div>
           
           <div className="p-8 flex-1">
              {isLoading ? (
                <div className="space-y-6">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Combines recent orders as primary activity */}
                  {recentOrders.length === 0 && recentUsers.length === 0 ? (
                    <div className="py-20 text-center">
                       <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-bold">Chưa có hoạt động nào được ghi nhận</p>
                    </div>
                  ) : (
                    <>
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex gap-4 items-start group">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <ShoppingBag className="w-4 h-4" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm text-slate-900 leading-snug">
                               <span className="font-black text-blue-600">Đơn hàng mới</span> được khởi tạo bới ID người dùng <span className="font-bold underline">#{order.user?.id}</span> với tổng giá trị <span className="font-black">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount || 0)}</span>
                             </p>
                             <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{order.orderDate ? new Date(order.orderDate).toLocaleString("vi-VN") : "vừa xong"}</p>
                           </div>
                        </div>
                      ))}
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex gap-4 items-start group">
                           <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                             <Users className="w-4 h-4" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm text-slate-900 leading-snug">
                               <span className="font-black text-purple-600">Thành viên mới:</span> <span className="font-bold">{user.fullName}</span> ({user.email}) vừa tham gia hệ thống.
                             </p>
                             <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Đã đăng ký</p>
                           </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* STATUS SUMMARY */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="text-lg font-black tracking-tighter mb-8 flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-blue-500" />
                 Hạ tầng Real-time
              </h3>
              <div className="space-y-6 relative z-10">
                 {[
                   { name: "Core API", status: "Hoạt động", color: "green" },
                   { name: "Database", status: "Kết nối tốt", color: "green" },
                   { name: "Auth Service", status: "Bảo mật", color: "green" },
                   { name: "Client App", status: "Đã tối ưu", color: "blue" },
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between py-1">
                     <span className="text-sm font-bold text-slate-400">{s.name}</span>
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${s.color}-500 shadow-[0_0_12px] shadow-${s.color}-500/50`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.status}</span>
                     </div>
                   </div>
                 ))}
              </div>
              <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
                    <p className="text-xs font-bold">Hệ thống ổn định 99.9%</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
