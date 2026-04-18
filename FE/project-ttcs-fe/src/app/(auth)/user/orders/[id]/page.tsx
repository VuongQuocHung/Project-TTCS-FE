"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderApi } from "@/lib/api-endpoints";
import { Order } from "@/types/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Package, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Phone,
  CircleDollarSign
} from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";

function OrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await orderApi.getById(Number(id));
        setOrder(res);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError(apiError?.message || "Không thể tải thông tin đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Lỗi tải đơn hàng</h1>
        <p className="text-slate-500 mb-8 max-w-sm">{error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}</p>
        <button 
          onClick={() => router.back()}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition"
        >
          QUAY LẠI
        </button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "PENDING": return <Clock className="w-6 h-6 text-yellow-500" />;
      case "APPROVED": return <Truck className="w-6 h-6 text-blue-500" />;
      case "CANCELLED": return <AlertCircle className="w-6 h-6 text-red-500" />;
      default: return <Package className="w-6 h-6 text-slate-400" />;
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
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Chi tiết đơn hàng</h1>
            <p className="text-slate-500 font-medium mt-1">Mã đơn hàng: <span className="text-blue-600">#VPH-{order.id?.toString().padStart(6, '0')}</span></p>
          </div>
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest shadow-sm ${getStatusColor(order.status || "PENDING")}`}>
             {getStatusIcon(order.status || "PENDING")}
             {getStatusLabel(order.status || "PENDING")}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Sản phẩm đã chọn
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {order.orderDetails?.map((item) => (
                  <div key={item.id} className="p-8 flex gap-6 items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl p-2 border border-slate-100 shrink-0">
                      <img 
                        src={item.product?.images?.[0]?.imageUrl || "/assets/images/loq.jpg"} 
                        alt={item.product?.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate hover:text-blue-600 transition-colors">
                        <Link href={`/product/${item.product?.id}`}>{item.product?.name}</Link>
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">Số lượng: <span className="text-slate-900 font-bold">x{item.quantity}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format((item.unitPrice || 0) * (item.quantity || 0))}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.unitPrice || 0)} / đơn vị
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-50/50 flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tổng cộng thanh toán:</span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Thông tin nhận hàng</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa chỉ</p>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed">{order.shippingAddress}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                      <p className="text-sm font-bold text-slate-900">{order.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ngày đặt hàng</p>
                      <p className="text-sm font-bold text-slate-900">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Thanh toán</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CircleDollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phương thức</p>
                   <p className="text-sm font-black">Thanh toán khi nhận hàng (COD)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetail />
    </ProtectedRoute>
  );
}
