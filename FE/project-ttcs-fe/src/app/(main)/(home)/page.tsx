"use client";

import Link from "next/link";
import React, { useState, useEffect, Fragment } from "react";
import { productApi } from "@/lib/api-endpoints";
import { Product } from "@/types/api";
import { 
  Zap, 
  TrendingUp, 
  ShoppingBag, 
  ArrowRight, 
  Star,
  Briefcase,
  Layers
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CountdownTimer } from "@/app/components/common/CountdownTimer";
import { categoryApi } from "@/lib/api-endpoints";
import { Category } from "@/types/api";

export default function HomePage() {
  const { addToCart } = useCart();
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getAll({ size: 8 }),
          categoryApi.getAll({ size: 3 })
        ]);
        
        const allProducts = prodRes.content || [];
        setFlashSaleProducts(allProducts.slice(0, 4));
        setTrendingProducts(allProducts.slice(4, 7));
        setCategories(catRes.content || []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);



  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-6 pt-10">
        {/* HERO BANNER */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 
        text-white p-12 mb-12 overflow-hidden shadow-2xl shadow-blue-200/50">
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 bg-blue-600/30 text-blue-400 text-xs px-3 py-1.5 rounded-full font-bold border border-blue-500/30">
              <Star className="w-3.5 h-3.5 fill-blue-400" />
              NEW ARRIVALS 2026
            </span>

            <h1 className="text-5xl font-black mt-6 mb-6 leading-tight tracking-tighter">
              LAPTOP CAO CẤP <br /> 
              <span className="text-blue-500">ƯU ĐÃI KHỦNG</span>
            </h1>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Trải nghiệm hiệu năng vượt trội với các dòng Laptop thế hệ mới nhất. <br/>
              Tặng ngay bộ quà tặng Gaming trị giá 2.000.000₫.
            </p>

            <div className="flex gap-4">
              <Link href="/product/list" className="bg-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-900/40 flex items-center gap-2">
                Mua ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="bg-white/10 border border-white/20 backdrop-blur-md px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition">
                Xem thêm
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-1/2 right-[-10%] translate-y-[-50%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        {/* CATEGORY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {categories.slice(0, 3).map((c) => (
            // Category card đổi sang Link, click vào chuyển tới list theo categoryId.
            <Link
              key={c.id}
              href={c.id ? `/product/list?categoryId=${c.id}` : "/product/list"}
              className="group bg-white p-8 rounded-2xl border border-slate-200 cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.name}</p>
                <p className="text-sm text-slate-500 line-clamp-1">{c.description || "Khám phá ngay"}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* FLASH SALE SECTION */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold animate-pulse">
                <Zap className="w-5 h-5 fill-white" />
                Flash Sale
              </div>

              <div className="flex items-center gap-2 text-slate-900">
                <span className="text-sm font-semibold opacity-50 ml-2">Kết thúc trong:</span>
                <CountdownTimer />
              </div>
            </div>

            <Link href="/product/list" className="group flex items-center text-blue-600 font-bold text-sm hover:text-blue-700">
              Xem tất cả sản phẩm
              <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 h-[380px] animate-pulse" />
              ))
            ) : (
              flashSaleProducts.map((p) => (
                <div key={p.id} className="group bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-2xl hover:shadow-blue-100 hover:border-blue-100 transition-all duration-300 flex flex-col">
                  <Link href={`/product/${p.id}`} className="flex-1">
                    <div className="relative aspect-square mb-6 overflow-hidden rounded-xl bg-slate-50">
                      <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                        SALE 20%
                      </span>
                      <img
                        src={p.images?.[0]?.imageUrl || "/assets/images/loq.jpg"}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 min-h-[32px]">
                      {p.specification?.cpu} {p.specification?.ram} {p.specification?.vga}
                    </p>
                  </Link>

                  <div className="flex justify-between items-end mt-auto">
                    <Link href={`/product/${p.id}`}>
                      <p className="text-lg font-black text-blue-600 tracking-tight">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(p.price || 0)}
                      </p>
                      <p className="text-xs line-through text-slate-400 font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format((p.price || 0) * 1.2)}
                      </p>
                    </Link>

                    <button 
                      onClick={() => addToCart(p)}
                      className="bg-blue-600 text-white p-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TRENDING BAR */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Xu hướng tìm kiếm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 flex items-center gap-6"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={p.images?.[0]?.imageUrl || "/assets/images/loq.jpg"} 
                    alt={p.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{p.name}</p>
                  <p className="text-blue-600 font-black text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(p.price || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    In Stock
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}