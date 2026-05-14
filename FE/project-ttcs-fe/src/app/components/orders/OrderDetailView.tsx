"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import type { Order } from "@/types/api";
import { formatCurrency, getOrderStatusClasses, getOrderStatusLabel } from "@/lib/format";

type OrderDetailViewProps = {
  order: Order;
  backHref: string;
};

export function OrderDetailView({ order, backHref }: OrderDetailViewProps) {
  return (
    <div className="space-y-8">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            Chi tiết đơn hàng
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Mã đơn hàng: <span className="font-black text-blue-600">#VPH-{order.id?.toString().padStart(6, "0")}</span>
          </p>
        </div>

        <span className={`inline-flex rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-widest ${getOrderStatusClasses(order.status)}`}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
          <div className="border-b border-slate-100 p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              Sản phẩm trong đơn
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-5 p-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName || ""} className="h-full w-full object-contain" />
                  ) : (
                    <Package className="h-7 w-7 text-slate-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">
                    {item.productName || `Biến thể #${item.variantId}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    SKU: <span className="font-bold text-slate-700">{item.sku || "---"}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Số lượng: <span className="font-bold text-slate-700">x{item.quantity}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-black text-slate-900">
                    {formatCurrency((item.price || 0) * (item.quantity || 0))}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    {formatCurrency(item.price)} / sản phẩm
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-b-3xl bg-slate-50 p-6">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Tổng thanh toán
            </span>
            <span className="text-3xl font-black text-blue-600">
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">
              Thông tin đơn hàng
            </h2>

            <div className="space-y-5">
              <InfoRow icon={<User className="h-5 w-5" />} label="Khách hàng" value={`#${order.userId || "---"}`} />
              <InfoRow icon={<Package className="h-5 w-5" />} label="Chi nhánh" value={`#${order.branchId || "---"}`} />
              <InfoRow
                icon={<Calendar className="h-5 w-5" />}
                label="Ngày đặt"
                value={order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}
              />
              <InfoRow icon={<CircleDollarSign className="h-5 w-5" />} label="Giảm giá" value={formatCurrency(order.discountAmount)} />
              <InfoRow icon={<Package className="h-5 w-5" />} label="Voucher" value={order.voucherCode || "Không áp dụng"} />
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">
              Thanh toán
            </h2>
            <p className="text-sm font-bold">
              Phương thức: {order.paymentMethod || "COD"}
            </p>
            <p className="mt-2 text-sm font-bold">
              Trạng thái: {order.paymentStatus || "---"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
