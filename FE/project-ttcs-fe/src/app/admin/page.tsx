"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Package,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { orderApi, productApi, userApi } from "@/lib/api-endpoints";
import { formatCurrency, getOrderStatusLabel } from "@/lib/format";
import type { DashboardStats, Order, User } from "@/types/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    successfulOrders: 0,
    revenueByStatus: {},
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const [statsResponse, ordersResponse, productsResponse, usersResponse] =
          await Promise.all([
            orderApi.getDashboardStats(),
            orderApi.getAllAdmin({ size: 5, page: 0 }),
            productApi.getAllAdmin({ size: 1, page: 0 }),
            userApi.getAll(),
          ]);

        setStats(statsResponse);
        setRecentOrders(ordersResponse.content || []);
        setTotalProducts(productsResponse.totalElements || 0);
        setTotalUsers(usersResponse.length);
        setRecentUsers(usersResponse.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: "Tổng đơn hàng",
      val: stats.totalOrders || 0,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
    },
    {
      name: "Sản phẩm",
      val: totalProducts,
      icon: <Package className="w-6 h-6 text-emerald-600" />,
    },
    {
      name: "Người dùng",
      val: totalUsers,
      icon: <Users className="w-6 h-6 text-amber-600" />,
    },
    {
      name: "Doanh thu",
      val: formatCurrency(stats.totalRevenue),
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Dashboard đang đọc số liệu thật từ backend admin thay vì tự suy luận từ
            field cũ của frontend.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 text-xs font-black uppercase tracking-widest">
          <Activity className="w-4 h-4" />
          Live backend sync
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-slate-900 transition-colors duration-300">
                {card.icon}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Live
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              {card.name}
            </p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
              {isLoading ? "---" : card.val}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Đơn hàng gần đây
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100">
              Admin orders
            </span>
          </div>

          <div className="p-8 flex-1">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-12 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">
                  Chưa có đơn hàng nào được ghi nhận
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 leading-snug">
                        <span className="font-black text-blue-600">Đơn #{order.id}</span> của
                        người dùng <span className="font-bold">#{order.userId}</span> đang ở
                        trạng thái <span className="font-black">{getOrderStatusLabel(order.status)}</span>
                        , tổng giá trị{" "}
                        <span className="font-black">{formatCurrency(order.totalPrice)}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("vi-VN")
                          : "vừa xong"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h3 className="text-lg font-black tracking-tighter mb-8 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              Thống kê doanh thu
            </h3>
            <div className="space-y-4 relative z-10">
              {Object.entries(stats.revenueByStatus || {}).length > 0 ? (
                Object.entries(stats.revenueByStatus || {}).map(([status, revenue]) => (
                  <div key={status} className="flex items-center justify-between py-1">
                    <span className="text-sm font-bold text-slate-400">
                      {getOrderStatusLabel(status)}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Chưa có dữ liệu doanh thu theo trạng thái.</p>
              )}
            </div>
            <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Đơn thành công
                </p>
                <p className="text-xs font-bold">{stats.successfulOrders || 0} đơn</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter mb-6">
              Người dùng mới nhất
            </h3>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
              {!isLoading && recentUsers.length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có người dùng để hiển thị.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
