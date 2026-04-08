"use client";

import React, { useEffect, useState } from "react";
import { orderApi } from "@/lib/api-endpoints";
import { Order } from "@/types/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Package, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ShoppingBag, 
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";

function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getAll();
        setOrders(res.content || []);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError(apiError?.message || "Không thể tải danh sách đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium tracking-tight">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Bạn chưa có đơn hàng nào</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Hãy bắt đầu mua sắm để nhận nhiều ưu đãi hấp dẫn từ VPH STORE!</p>
        <Link 
          href="/product/list" 
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
        >
          MUA SẮM NGAY
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "PENDING": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "APPROVED": return <Truck className="w-4 h-4 text-blue-500" />;
      case "CANCELLED": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-slate-400" />;
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

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return "Đã giao hàng";
      case "PENDING": return "Chờ xử lý";
      case "APPROVED": return "Đang vận chuyển";
      case "CANCELLED": return "Đã hủy";
      default: return "Không xác định";
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[1000px] mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition">
          <ArrowLeft className="w-4 h-4" />
          Tiếp tục mua sắm
        </Link>
        
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Lịch sử đơn hàng</h1>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-400 tracking-widest uppercase">
            {orders.length} Đơn hàng
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mã đơn hàng</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter">#VPH-{order.id?.toString().padStart(6, '0')}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : "---"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4" />
                       <span className="max-w-[200px] truncate">{order.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3">
                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${getStatusColor(order.status || "PENDING")}`}>
                      {getStatusIcon(order.status || "PENDING")}
                      {getStatusLabel(order.status || "PENDING")}
                   </div>
                   <p className="text-3xl font-black text-blue-600 tracking-tighter">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.totalAmount || 0)}
                   </p>
                   <Link 
                    href={`/user/orders/${order.id}`}
                    className="group text-sm font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                   >
                     Xem chi tiết
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </div>
              
              {/* Peek into items if any */}
              {order.orderDetails && order.orderDetails.length > 0 && (
                <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex items-center gap-4 overflow-x-auto scrollbar-hide">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Sản phẩm:</span>
                  {order.orderDetails.map((detail, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                      {detail.product?.name || `Sản phẩm #${detail.product?.id}`} <span className="text-blue-600 ml-1">x{detail.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute>
      <OrdersList />
    </ProtectedRoute>
  );
}
