"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, X, Trash2, ChevronRight } from "lucide-react";

export const MiniCart = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { cart, removeFromCart, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-[100] flex flex-col text-slate-900 border-l animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold">Giỏ hàng của bạn ({totalItems})</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
            <p>Giỏ hàng đang trống</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              <div className="w-20 h-20 bg-slate-50 border rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.product.images?.[0]?.imageUrl || "/assets/images/loq.jpg"}
                  alt={item.product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate hover:text-blue-600">
                  <Link href={`/product/${item.id}`} onClick={onClose}>
                    {item.product.name}
                  </Link>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Số lượng: {item.quantity}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.product.price || 0)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-6 border-t bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-600 font-medium">Tổng tiền:</span>
            <span className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition"
            >
              Xem giỏ hàng
            </Link>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200"
            >
              Thanh toán
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
