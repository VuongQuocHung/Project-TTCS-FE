"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Layers, ShoppingBag, Star, Zap } from "lucide-react";
import { brandApi, productApi } from "@/lib/api-endpoints";
import { useCart } from "@/context/CartContext";
import { CountdownTimer } from "@/app/components/common/CountdownTimer";
import { getPrimaryImage, getSpecValue } from "@/lib/format";
import type { Brand, Product } from "@/types/api";

const FEATURED_BRANDS = ["Lenovo", "MSI", "Dell"];

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

function ProductCard({
  product,
  badge = "Bán chạy",
  badgeClassName = "bg-blue-600",
  onAddToCart,
}: {
  product: Product;
  badge?: string;
  badgeClassName?: string;
  onAddToCart: (product: Product) => void;
}) {
  const price = product.variants?.[0]?.price || 0;
  const specs = [getSpecValue(product, "cpu"), getSpecValue(product, "ram"), getSpecValue(product, "storage")]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-xl">
      <Link href={`/product/${product.id}`} className="flex-1">
        <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-slate-50">
          <span className={`absolute left-3 top-3 z-10 rounded-md px-2 py-1 text-[10px] font-bold uppercase text-white ${badgeClassName}`}>
            {badge}
          </span>
          <img
            src={getPrimaryImage(product)}
            alt={product.name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
          />
        </div>

        <h3 className="mb-2 truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">
          {product.name}
        </h3>
        <p className="mb-6 min-h-[32px] text-xs text-slate-500 line-clamp-2">
          {specs || "Laptop chính hãng, bảo hành đầy đủ"}
        </p>
      </Link>

      <div className="mt-auto flex items-end justify-between">
        <Link href={`/product/${product.id}`}>
          <p className="text-lg font-black text-blue-600">{formatCurrency(price)}</p>
          <p className="text-xs font-medium text-slate-400 line-through">
            {formatCurrency(price * 1.1)}
          </p>
        </Link>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="rounded-xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 transition hover:bg-slate-900"
        >
          <ShoppingBag className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { addToCart } = useCart();
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bestSelling, flashSale, brandList] = await Promise.all([
          productApi.getBestSelling(4),
          productApi.getAll({ page: 0, size: 4, sortBy: "id", sortDir: "desc" }),
          brandApi.getAllPublic(),
        ]);

        setBestSellingProducts(bestSelling || []);
        setFlashSaleProducts(flashSale.content || []);
        setBrands(brandList || []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHomeData();
  }, []);

  const getBrandLink = (brandName: string) => {
    const brand = brands.find((item) => item.name?.toLowerCase() === brandName.toLowerCase());
    return brand?.id ? `/product/list?brandId=${brand.id}` : `/product/list?q=${encodeURIComponent(brandName)}`;
  };

  const handleAddToCart = (product: Product) => {
    const variantId = product.variants?.[0]?.id;

    if (!variantId) {
      alert("Sản phẩm chưa có biến thể");
      return;
    }

    addToCart(variantId, 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="mx-auto max-w-[1200px] px-6 pt-10">
        <section className="relative mb-12 flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-slate-900 p-12 text-white shadow-2xl shadow-blue-200/50 md:flex-row">
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-600/30 px-3 py-1.5 text-xs font-bold text-blue-300">
              <Star className="h-3.5 w-3.5 fill-blue-300" />
              Sản phẩm mới 2026
            </span>

            <h1 className="mb-6 mt-6 text-5xl font-black leading-tight tracking-tighter">
              Laptop cao cấp <br />
              <span className="text-blue-500">ưu đãi khủng</span>
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-slate-300">
              Trải nghiệm hiệu năng vượt trội với các dòng laptop thế hệ mới nhất.
            </p>

            <Link
              href="/product/list"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-bold shadow-lg shadow-blue-900/40 transition hover:bg-blue-700"
            >
              Mua ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative z-10 flex w-full max-w-md flex-col gap-4">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-6 shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20 blur-3xl transition-all group-hover:bg-white/30"></div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-white drop-shadow-sm">Chào Tân Sinh Viên</h3>
              <p className="mb-4 text-sm font-medium text-blue-100">
                Giảm ngay đến 30% khi mua laptop. Tặng kèm balo và chuột không dây cao cấp!
              </p>
              <Link href="/product/list" className="inline-flex items-center text-sm font-bold text-white transition hover:text-blue-200">
                Khám phá ngay <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-6 shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-yellow-400/20 blur-3xl transition-all group-hover:bg-yellow-400/30"></div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-white drop-shadow-sm">Black Friday</h3>
              <p className="mb-4 text-sm font-medium text-rose-100">
                Cơ hội lớn nhất năm. Săn sale sập sàn, mua 1 tặng 1 cùng hàng ngàn voucher hấp dẫn.
              </p>
              <Link href="/product/list" className="inline-flex items-center text-sm font-bold text-white transition hover:text-rose-200">
                Săn sale ngay <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURED_BRANDS.map((brandName) => (
            <Link
              key={brandName}
              href={getBrandLink(brandName)}
              className="group flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-200 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold uppercase tracking-tight text-slate-900 group-hover:text-blue-600">
                  {brandName}
                </p>
                <p className="text-sm text-slate-500">Xem sản phẩm {brandName}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mb-16">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white">
                <Zap className="h-5 w-5 fill-white" />
                Flash Sale
              </div>
              <div className="flex items-center gap-2 text-slate-900">
                <span className="text-sm font-semibold text-slate-500">Kết thúc trong:</span>
                <CountdownTimer />
              </div>
            </div>

            <Link href="/product/list" className="group flex items-center text-sm font-bold text-blue-600">
              Xem tất cả sản phẩm
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[380px] animate-pulse rounded-2xl border border-slate-100 bg-white p-6" />
                ))
              : flashSaleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge="Sale 20%"
                    badgeClassName="bg-red-600"
                    onAddToCart={handleAddToCart}
                  />
                ))}
          </div>
        </section>

        <section>
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Được khách hàng chọn nhiều
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tighter text-slate-900">
                4 sản phẩm bán chạy nhất
              </h2>
            </div>

            <Link href="/product/list" className="group flex items-center text-sm font-bold text-blue-600">
              Xem tất cả sản phẩm
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[380px] animate-pulse rounded-2xl border border-slate-100 bg-white p-6" />
                ))
              : bestSellingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
