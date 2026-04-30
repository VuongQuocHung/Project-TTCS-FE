"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  Clock,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { orderApi } from "@/lib/api-endpoints";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Order } from "@/types/api";
import type { ApiError } from "@/lib/api";
import { formatCurrency, getOrderStatusClasses, getOrderStatusLabel } from "@/lib/format";

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await orderApi.getMyOrderById(Number(id));
      setOrder(response);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải thông tin đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order?.id) return;

    try {
      setIsCancelling(true);
      await orderApi.cancelMyOrder(order.id);
      await fetchOrder();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể hủy đơn hàng.");
    } finally {
      setIsCancelling(false);
    }
  };

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
        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">
          Lỗi tải đơn hàng
        </h1>
        <p className="text-slate-500 mb-8 max-w-sm">
          {error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}
        </p>
        <button
          onClick={() => router.back()}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition"
        >
          QUAY LẠI
        </button>
      </div>
    );
  }

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
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Chi tiết đơn hàng
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Mã đơn hàng:{" "}
              <span className="text-blue-600">
                #VPH-{order.id?.toString().padStart(6, "0")}
              </span>
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest shadow-sm ${getOrderStatusClasses(
              order.status
            )}`}
          >
            {order.status === "PENDING" ? (
              <Clock className="w-5 h-5" />
            ) : order.status === "CONFIRMED" || order.status === "SHIPPING" ? (
              <Truck className="w-5 h-5" />
            ) : order.status === "DELIVERED" ? (
              <Package className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {getOrderStatusLabel(order.status)}
          </div>
        </div>

        {error ? (
          <div className="mb-6 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Sản phẩm đã chọn
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-8 flex gap-6 items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">
                        {item.productName || `Biến thể #${item.variantId}`}
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        SKU: <span className="text-slate-900 font-bold">{item.sku || "---"}</span>
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Số lượng: <span className="text-slate-900 font-bold">x{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">
                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {formatCurrency(item.price)} / đơn vị
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-50/50 flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  Tổng cộng thanh toán:
                </span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                Thông tin đơn hàng
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Package className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Chi nhánh xử lý
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      #{order.branchId || "---"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Ngày đặt hàng
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CircleDollarSign className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Giảm giá
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(order.discountAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Package className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Voucher
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {order.voucherCode || "Không áp dụng"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                Thanh toán
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CircleDollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Phương thức
                  </p>
                  <p className="text-sm font-black">Thanh toán khi nhận hàng (COD)</p>
                </div>
              </div>

              {order.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full mt-8 bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition disabled:opacity-70"
                >
                  {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                </button>
              ) : null}

              <Link
                href="/user/orders"
                className="w-full mt-4 inline-flex items-center justify-center bg-white/10 text-white py-4 rounded-2xl font-black hover:bg-white/20 transition"
              >
                Quay lại danh sách
              </Link>
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
