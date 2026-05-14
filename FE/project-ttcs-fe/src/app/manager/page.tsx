"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  PackageSearch,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { branchApi, managerDashboardApi } from "@/lib/api-endpoints";
import { formatCurrency, getOrderStatusLabel } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { ApiError } from "@/lib/api";
import type { DashboardStats, LowStock } from "@/types/api";

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return "tháng hiện tại";

  return new Date(year, month - 1, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
};

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    successfulOrders: 0,
    revenueByStatus: {},
  });
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [branchInfo, setBranchInfo] = useState<{ name: string; address?: string; phone?: string }>({ name: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);

  // Fetch branch info from user's branchId
  useEffect(() => {
    const fetchBranchInfo = async () => {
      if (!user?.branchId) return;
      try {
        const branches = await branchApi.getAllPublic();
        const found = branches.find((b) => b.id === user.branchId);
        if (found) setBranchInfo({ name: found.name || "", address: found.address, phone: found.phone });
      } catch {
        // ignore
      }
    };
    void fetchBranchInfo();
  }, [user?.branchId]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, lowStockResponse] = await Promise.all([
        managerDashboardApi.getStats(selectedMonth),
        managerDashboardApi.getLowStock(),
      ]);

      setStats(statsResponse);
      setLowStock(lowStockResponse || []);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải dữ liệu quản lý chi nhánh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, [selectedMonth]);

  const deliveredRevenue = stats.revenueByStatus?.["DELIVERED"] ?? 0;
  const selectedMonthLabel = formatMonthLabel(selectedMonth);
  const topProducts = stats.topProductsThisMonth || [];
  const topCustomers = stats.topCustomersThisMonth || [];

  const statCards = [
    {
      name: "Tổng đơn hàng",
      value: stats.totalOrders || 0,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      name: "Đơn thành công",
      value: stats.successfulOrders || 0,
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      name: `Doanh thu ${selectedMonthLabel}`,
      value: formatCurrency(stats.monthlyRevenue || 0),
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      name: "Cảnh báo kho",
      value: lowStock.length,
      icon: <PackageSearch className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Chi nhánh{branchInfo.name ? `: ${branchInfo.name}` : ""}
          </h1>
          {(branchInfo.address || branchInfo.phone) && (
            <p className="text-slate-500 mt-2 font-medium">
              {branchInfo.address ? `📍 ${branchInfo.address}` : ""}
              {branchInfo.address && branchInfo.phone ? " • " : ""}
              {branchInfo.phone ? `📞 ${branchInfo.phone}` : ""}
            </p>
          )}
          <p className="text-slate-400 mt-1 text-sm">
            Theo dõi đơn hàng, doanh thu và tồn kho của chi nhánh được gán.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="manager-dashboard-month">
            Chọn tháng thống kê
          </label>
          <input
            id="manager-dashboard-month"
            type="month"
            value={selectedMonth}
            max={getCurrentMonthValue()}
            onChange={(event) =>
              setSelectedMonth(event.target.value || getCurrentMonthValue())
            }
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />
          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      ) : null}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${card.bg} group-hover:bg-slate-900 transition-colors duration-300`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              {card.name}
            </p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
              {isLoading ? "---" : card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Revenue breakdown + Top products */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Revenue by status */}
        <div className="xl:col-span-5 bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <h3 className="text-lg font-black tracking-tighter mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Doanh thu chi nhánh — {selectedMonthLabel}
          </h3>
          <div className="space-y-4 relative z-10">
            {Object.entries(stats.revenueByStatus || {}).length > 0 ? (
              Object.entries(stats.revenueByStatus || {}).map(
                ([status, revenue]) => (
                  <div key={status} className="flex items-center justify-between py-1">
                    <span className="text-sm font-bold text-slate-400">
                      {getOrderStatusLabel(status)}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-400">
                Chưa có dữ liệu doanh thu theo trạng thái.
              </p>
            )}
          </div>
          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tổng doanh thu (đã giao)
              </p>
              <p className="text-lg font-black tracking-tighter">
                {formatCurrency(deliveredRevenue)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Đơn thành công trong tháng
              </p>
              <p className="text-lg font-black tracking-tighter">
                {stats.monthlyOrders || 0} đơn
              </p>
            </div>
          </div>
        </div>

        {/* Top 5 Best-selling Products */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-black text-slate-900 tracking-tighter mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top 5 sản phẩm bán chạy — {selectedMonthLabel}
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-10 text-center rounded-3xl border-2 border-dashed border-slate-100">
                <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-bold">
                  Chưa có sản phẩm nào được bán trong {selectedMonthLabel}.
                </p>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={`${product.productId}-${product.variantId}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-xs font-black text-amber-600 shadow-sm border border-amber-100">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate">
                      {product.productName}
                    </p>
                    <p className="text-xs text-slate-400 font-bold truncate">
                      SKU: {product.sku || "---"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-blue-600">
                      {product.quantitySold || 0}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">đã bán</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-600">
                      {formatCurrency(product.revenue || 0)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">doanh thu</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Customers */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
          <h3 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <UserRound className="w-5 h-5 text-emerald-600" />
            Top 5 khách hàng chi tiêu nhiều nhất — {selectedMonthLabel}
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            Khách hàng nổi bật
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : topCustomers.length === 0 ? (
          <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-100">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">
              Chưa có dữ liệu chi tiêu trong {selectedMonthLabel}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.userId}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sm font-black text-emerald-600 shadow-sm border border-emerald-100">
                    #{index + 1}
                  </div>
                  <span className="text-[10px] font-black text-slate-400">
                    {customer.orderCount || 0} đơn
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 truncate">
                  {customer.fullName || customer.username || `User #${customer.userId}`}
                </p>
                <p className="text-xs text-slate-400 truncate mt-1">
                  {customer.email}
                </p>
                <p className="text-lg font-black text-blue-600 tracking-tighter mt-4">
                  {formatCurrency(customer.totalSpent || 0)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low stock */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-amber-600" />
            Sắp hết hàng
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 text-sm font-medium text-slate-400">
              Đang tải tồn kho...
            </div>
          ) : lowStock.length === 0 ? (
            <div className="p-6 text-sm font-medium text-slate-400">
              Không có cảnh báo tồn kho.
            </div>
          ) : (
            lowStock.map((item) => (
              <div
                key={`${item.branchId}-${item.variantId}`}
                className="p-6 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {item.productName || `Variant #${item.variantId}`}
                  </p>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    SKU {item.sku || "---"} -{" "}
                    {item.branchName || "Chi nhánh hiện tại"}
                  </p>
                </div>
                <span className="shrink-0 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                  {item.quantity ?? 0}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
