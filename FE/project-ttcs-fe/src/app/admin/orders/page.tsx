"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  RefreshCw,
  ShoppingBag,
  User,
} from "lucide-react";
import { orderApi } from "@/lib/api-endpoints";
import { formatCurrency, getOrderStatusClasses, getOrderStatusLabel } from "@/lib/format";
import type { ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/api";

const PAGE_SIZE = 10;
const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await orderApi.getAllAdmin({
        page,
        size: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setOrders(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải danh sách đơn hàng.");
      setOrders([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    setBusyOrderId(orderId);
    setError(null);

    try {
      await orderApi.updateStatus(orderId, status);
      await fetchOrders();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Quản lý đơn hàng
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Danh sách và cập nhật trạng thái theo endpoint admin orders của backend.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm">
        <div className="flex items-center gap-3 text-slate-500 font-bold">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <span>Trạng thái</span>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(0);
            setStatusFilter(event.target.value as OrderStatus | "");
          }}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600"
        >
          <option value="">Tất cả đơn hàng</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getOrderStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      ) : null}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Đơn hàng
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Người dùng
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tổng tiền
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Trạng thái
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Cập nhật
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-12 bg-slate-100 rounded-2xl w-44" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-28" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-32" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-36" /></td>
                    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl w-44" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Không có đơn hàng phù hợp</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-black text-blue-600">#{order.id}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        #{order.userId || "---"}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Chi nhánh #{order.branchId || "---"}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-lg font-black text-slate-900">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      {order.discountAmount ? (
                        <p className="text-xs text-green-600 font-bold">
                          Giảm {formatCurrency(order.discountAmount)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getOrderStatusClasses(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <select
                        value={order.status || "PENDING"}
                        onChange={(event) => order.id && handleUpdateStatus(order.id, event.target.value as OrderStatus)}
                        disabled={!order.id || busyOrderId === order.id}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium disabled:opacity-60"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {getOrderStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">
            Trang <span className="text-slate-900">{page + 1}</span> / {Math.max(totalPages, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
