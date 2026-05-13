"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { brandApi, productApi } from "@/lib/api-endpoints";
import type { Brand, Product } from "@/types/api";
import { 
  Zap, 
  ShoppingBag, 
  ArrowRight, 
  Star,
  Layers
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CountdownTimer } from "@/app/components/common/CountdownTimer";
import { getPrimaryImage, getSpecValue } from "@/lib/format";

export default function HomePage() {
  const { addToCart } = useCart();
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, brandRes] = await Promise.all([
          productApi.getAll({ size: 8 }),
          brandApi.getAllPublic()
        ]);

        const allProducts = prodRes.content || [];
        setFlashSaleProducts(allProducts.slice(-4));
        setBrands(brandRes || []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const featuredBrandNames = ["Lenovo", "MSI", "Dell"];
  const getBrandByName = (brandName: string) =>
    brands.find((brand) => brand.name?.toLowerCase() === brandName.toLowerCase());
  const getBrandLink = (brandName: string) => {
    const brand = getBrandByName(brandName);
    return brand?.id ? `/product/list?brandId=${brand.id}` : `/product/list?q=${encodeURIComponent(brandName)}`;
  };

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

        {/* BRAND GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {featuredBrandNames.map((brandName) => {
            const brand = getBrandByName(brandName);

            return (
            <Link
              key={brandName}
              href={getBrandLink(brandName)}
              className="group bg-white p-8 rounded-2xl border border-slate-200 cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{brand?.name || brandName}</p>
                <p className="text-sm text-slate-500 line-clamp-1">Xem san pham {brand?.name || brandName}</p>
              </div>
            </Link>
            );
          })}
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
                        src={getPrimaryImage(p)}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 min-h-[32px]">
                      {[getSpecValue(p, "cpu"), getSpecValue(p, "ram"), getSpecValue(p, "vga")]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </Link>

                  <div className="flex justify-between items-end mt-auto">
                    <Link href={`/product/${p.id}`}>
                      <p className="text-lg font-black text-blue-600 tracking-tight">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(p.variants?.[0]?.price || 0)}
                      </p>
                      <p className="text-xs line-through text-slate-400 font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format((p.variants?.[0]?.price || 0) * 1.2)}
                      </p>
                    </Link>

                    <button 
                      onClick={() => {
                        if (p.variants && p.variants.length > 0 && p.variants[0].id) {
                          addToCart(p.variants[0].id, 1);
                        } else {
                          alert("Sản phẩm chưa có biến thể");
                        }
                      }}
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

      </div>
    </div>
  );
}
