"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck
} from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-slate-300" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Giỏ hàng đang trống</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Hãy khám phá thêm hàng ngàn sản phẩm tuyệt vời khác từ VPH STORE nhé!</p>
        <Link 
          href="/product/list" 
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition flex items-center gap-2"
        >
          TIẾP TỤC MUA SẮM
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 mb-10 flex items-center gap-4 tracking-tighter">
          Giỏ hàng của bạn
          <span className="text-lg font-medium text-slate-400 bg-slate-200/50 px-3 py-1 rounded-lg">
            {totalItems} sản phẩm
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ITEMS LIST */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6 group hover:border-blue-200 transition shadow-sm"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                  <img 
                    src={item.product.images?.[0]?.imageUrl || "/assets/images/loq.jpg"} 
                    alt={item.product.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>

                <div className="flex-1 min-w-0 py-2">
                  <Link 
                    href={`/product/${item.id}`} 
                    className="text-lg font-bold text-slate-900 hover:text-blue-600 transition truncate block mb-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-slate-400 uppercase font-black text-[10px] tracking-widest mb-4">
                    {item.product.brand?.name || "LAPTOP"}
                  </p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-slate-50 text-slate-500 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-slate-50 text-slate-500 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-300 hover:text-red-500 text-sm font-bold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>

                <div className="text-right sm:ml-auto">
                  <p className="text-xl font-black text-blue-600 tracking-tighter">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format((item.product.price || 0) * item.quantity)}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.product.price || 0)} / sản phẩm
                  </p>
                </div>
              </div>
            ))}

            <Link 
              href="/product/list" 
              className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline py-4 px-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua thêm sản phẩm khác
            </Link>
          </div>

          {/* SUMMARY SECTION */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tighter">Tổng chi phí</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Số lượng sản phẩm:</span>
                  <span className="font-bold text-slate-900">{totalItems}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính:</span>
                  <span className="font-bold text-slate-900">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Phí giao hàng:</span>
                  <span className="text-green-600 font-bold">Miễn phí</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-end mb-10">
                <span className="text-slate-900 font-black">TỔNG CỘNG:</span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalPrice)}
                </span>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-300 ring-4 ring-slate-100 group"
              >
                TIẾN HÀNH THANH TOÁN
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 mb-0.5">Thanh toán an toàn</p>
                  <p className="text-slate-400">Bảo mật thông tin 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 mb-0.5">Giao hàng miễn phí</p>
                  <p className="text-slate-400">Nội thành Hà Nội & HCM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
