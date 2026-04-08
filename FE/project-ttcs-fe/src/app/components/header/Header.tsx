"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingCart, 
  Search, 
  User, 
  LogOut, 
  LayoutGrid, 
  MapPin, 
  ChevronDown,
  ShieldAlert
} from "lucide-react";
import { MiniCart } from "./MiniCart";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product/list?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="w-full h-[72px] px-[40px] flex items-center gap-[16px] 
      bg-gradient-to-r from-[#d70018] to-[#ff3b3b] text-white sticky top-0 z-[60] shadow-md">

        {/* LOGO */}
        <Link href="/" className="text-[22px] font-bold flex items-center gap-[4px]">
          <span className="tracking-tighter">VPH STORE</span>
        </Link>

        {/* DANH MỤC */}
        <Link 
          href="/product/list"
          className="flex items-center gap-[6px] bg-white/20 hover:bg-white/30 transition px-[12px] h-[38px] rounded-[8px] text-[14px] font-medium group"
        >
          <LayoutGrid size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Danh mục</span>
        </Link>

        {/* LOCATION */}
        <div className="flex items-center gap-[6px] bg-white/20 hover:bg-white/30 transition px-[12px] h-[38px] rounded-[8px] text-[14px]">
          <MapPin size={16} />
          <div className="flex flex-col text-[10px] leading-tight">
            <span className="opacity-70">Xem giá tại</span>
            <select className="bg-transparent outline-none cursor-pointer font-bold text-[12px]">
              <option value="hn" className="text-black">Hà Nội</option>
              <option value="hcm" className="text-black">Hồ Chí Minh</option>
            </select>
          </div>
        </div>

        {/* SEARCH */}
        <form 
          onSubmit={handleSearch}
          className="flex-1 flex items-center bg-white rounded-full h-[40px] px-[16px] shadow-sm group"
        >
          <button type="submit" className="hover:scale-110 transition active:scale-95">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition" />
          </button>
          <input
            type="text"
            placeholder="Bạn muốn mua gì hôm nay?"
            className="flex-1 ml-[8px] outline-none text-[14px] text-black placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* CART */}
        <button 
          onClick={() => setIsMiniCartOpen(true)}
          className="relative flex items-center gap-[6px] text-[14px] bg-white/10 hover:bg-white/20 h-[38px] px-4 rounded-lg transition"
        >
          <ShoppingCart size={20} />
          <span className="font-medium">Giỏ hàng</span>

          {/* badge */}
          {totalItems > 0 && (
            <span className="absolute top-[-6px] right-[-4px] bg-yellow-400 
            text-black text-[10px] px-[5px] py-[1px] rounded-full font-bold border-2 border-[#d70018]">
              {totalItems}
            </span>
          )}
        </button>

        {/* USER */}
        <div className="relative">
          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-[6px] bg-white/10 hover:bg-white/20 px-[12px] py-[8px] rounded-[8px] text-[14px] transition"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={14} />
                </div>
                <span className="font-medium max-w-[100px] truncate">{user.fullName || user.email}</span>
                <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border p-2 text-slate-700 animate-in fade-in zoom-in-95 duration-200">
                  <Link href="/user/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition text-sm">
                    <User size={16} />
                    Trang cá nhân
                  </Link>
                  <Link href="/user/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition text-sm">
                    <LayoutGrid size={16} />
                    Đơn hàng của tôi
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition text-sm font-bold">
                       <ShieldAlert size={16} />
                       Quản trị hệ thống
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg transition text-sm text-left">
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-[2px] bg-white/20 px-[12px] py-[8px] rounded-[8px] text-[14px]">
              <User size={16} />
              <Link href="/user/login" className="hover:underline font-medium">Đăng nhập</Link>
              <span className="opacity-50 mx-1">/</span>
              <Link href="/user/register" className="hover:underline font-medium">Đăng ký</Link>
            </div>
          )}
        </div>
      </header>

      {/* Mini Cart Slide-over Background Overlay */}
      {isMiniCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
          onClick={() => setIsMiniCartOpen(false)}
        />
      )}
      <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
    </>
  );
};