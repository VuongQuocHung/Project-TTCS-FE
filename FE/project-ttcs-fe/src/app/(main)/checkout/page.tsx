"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderApi } from "@/lib/api-endpoints";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  CreditCard,
  MapPin,
  Phone,
  User,
  Mail,
  FileText,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";

function CheckoutForm() {
  const router = useRouter();
  const { cart, totalPrice, clearCart, totalItems } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    note: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsLoading(true);
    setError(null);

    // Đổi payload orderDetails sang dạng backend cần: product: { id }, quantity, unitPrice.
    // fix tạo đơn lỗi do sai cấu trúc dữ liệu
    const orderDetails = cart.map((item) => ({
      product: { id: item.id },
      quantity: item.quantity,
      unitPrice: item.product.price || 0,
    }));

    try {
      await orderApi.create({
        phoneNumber: formData.phone,
        shippingAddress: formData.address,
        totalAmount: totalPrice,
        orderDetails,
      });
      setIsSuccess(true);
      clearCart();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100 ring-8 ring-green-50">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Đặt hàng thành công!</h1>
        <p className="text-slate-500 mb-10 max-w-sm leading-relaxed">
          Cảm ơn bạn đã tin tưởng VPH STORE. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao tới bạn.
        </p>
        <div className="flex gap-4">
          <Link
            href="/user/orders"
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition"
          >
            THEO DÕI ĐƠN HÀNG
          </Link>
          <Link
            href="/"
            className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition"
          >
            QUAY LẠI TRANG CHỦ
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tighter">Giỏ hàng đang trống</h1>
        <Link href="/" className="text-blue-600 font-bold hover:underline">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <Link href="/cart" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition">
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SHIPPING FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tighter">
                <MapPin className="w-6 h-6 text-blue-600" />
                Thông tin giao hàng
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="fullName"
                        type="text"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="phone"
                        type="tel"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium"
                        placeholder="09xx xxx xxx"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email nhận thông báo</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Địa chỉ nhận hàng</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="address"
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium"
                      placeholder="Số nhà, tên đường, phường/xã..."
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="note" className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ghi chú thêm (không bắt buộc)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      id="note"
                      rows={4}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium resize-none"
                      placeholder="Chỉ dẫn giao hàng, thời gian nhận hàng..."
                      value={formData.note}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
                  <h3 className="text-slate-900 font-black text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Phương thức thanh toán
                  </h3>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border-2 border-blue-600 shadow-sm">
                    <div className="w-4 h-4 rounded-full border-4 border-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    Mọi thông tin đều được bảo mật tuyệt đối
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-32">
              <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tighter">Chi tiết đơn hàng</h2>

              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-2">
                      <img src={item.product.images?.[0]?.imageUrl || "/assets/images/loq.jpg"} className="w-full h-full object-contain" alt={item.product.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-400">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format((item.product.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 py-8 border-t border-slate-100">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính ({totalItems} sản phẩm):</span>
                  <span className="font-bold text-slate-900">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Phí giao hàng:</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Miễn phí</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-end mb-10">
                <span className="text-slate-900 font-black">TỔNG CỘNG:</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 ring-8 ring-blue-50 group disabled:opacity-70 disabled:grayscale"
              >
                {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-4 grayscale opacity-50">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Chính sách hoàn tiền 100% khi phát hiện hàng giả.<br /> Bảo hành chính hãng trên toàn quốc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}
