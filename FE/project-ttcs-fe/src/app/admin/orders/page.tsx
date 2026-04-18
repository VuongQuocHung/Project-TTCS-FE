"use client";

import React, { useEffect, useState } from "react";
import { orderApi } from "@/lib/api-endpoints";
import { Order } from "@/types/api";
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Check,
  X,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await orderApi.getAll({ size: 50 });
      setOrders(res.content || []);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Lỗi khi tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await orderApi.updateStatus(id, status);
      fetchOrders(); // Refresh
    } catch (err: unknown) {
      alert("Cập nhật trạng thái thất bại");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "PENDING": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "APPROVED": return <Truck className="w-4 h-4 text-blue-500" />;
      case "CANCELLED": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <ShoppingBag className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return "bg-green-50 text-green-700 border-green-100";
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "APPROVED": return "bg-blue-50 text-blue-700 border-blue-100";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === "ALL" || o.status === filter;
    const matchesSearch = o.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id?.toString().includes(searchTerm) ||
                          o.phoneNumber?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Quản lý Đơn hàng</h1>
          <p className="text-slate-500 font-medium mt-1">Theo dõi và cập nhật trạng thái đơn hàng của hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-400 tracking-widest uppercase">
             {filteredOrders.length} Đơn hàng
           </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo mã, địa chỉ, số điện thoại..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
           {["ALL", "PENDING", "APPROVED", "DELIVERED", "CANCELLED"].map(s => (
             <button 
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === s 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                : "bg-white text-slate-500 border border-slate-200 hover:border-blue-600 hover:text-blue-600"
              }`}
             >
               {s === "ALL" ? "Tất cả" : s}
             </button>
           ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đơn</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                       <div className="h-4 bg-slate-50 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                     <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-400 font-bold">Không tìm thấy đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6 font-black text-slate-900">#VPH-{order.id}</td>
                    <td className="px-6 py-6">
                       <p className="text-sm font-bold text-slate-900">{order.user?.fullName || "Khách hàng lẻ"}</p>
                       <p className="text-xs text-slate-400">{order.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-6 max-w-[200px]">
                       <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-300 mt-0.5" />
                          <p className="text-xs font-medium text-slate-500 leading-relaxed truncate" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </p>
                       </div>
                       <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-slate-300" />
                          <p className="text-[10px] font-bold text-slate-400">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : "---"}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-900">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-widest ${getStatusColor(order.status || "PENDING")}`}>
                         {getStatusIcon(order.status || "PENDING")}
                         {order.status || "PENDING"}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <p className="font-black text-blue-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount || 0)}
                       </p>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex items-center gap-2">
                          <Link 
                            href={`/user/orders/${order.id}`}
                            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {/* Quick Edit Actions */}
                          {order.status === "PENDING" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id!, "APPROVED")}
                              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Duyệt đơn"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(order.status === "APPROVED" || order.status === "PENDING") && (
                             <button 
                              onClick={() => handleUpdateStatus(order.id!, "CANCELLED")}
                              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Hủy đơn"
                             >
                               <X className="w-4 h-4" />
                             </button>
                          )}
                          {order.status === "APPROVED" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id!, "DELIVERED")}
                              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Hoàn thành"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
