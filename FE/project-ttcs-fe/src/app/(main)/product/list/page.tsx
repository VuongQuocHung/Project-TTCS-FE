"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Product, type ProductQueryParams } from "@/types/api";
import { productApi } from "@/lib/api-endpoints";
import {
  ShoppingBag,
  Filter,
  ChevronRight,
  LayoutGrid,
  Star,
  Search as SearchIcon,
  X,
  Scale,
  Check,
  ChevronDown
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { categoryApi, brandApi } from "@/lib/api-endpoints";
import type { Category, Brand } from "@/types/api";
import { Pagination } from "@/app/components/common/Pagination";
import { AutoRefresh } from "@/app/components/common/AutoRefresh";
import { getPrimaryImage, getSpecValue } from "@/lib/format";
import type { ApiError } from "@/lib/api";
import {
  canAddCompare,
  clearCompareIds,
  getMaxCompare,
  readCompareIds,
  toggleCompareId,
  writeCompareIds
} from "@/lib/compare";

const PAGE_SIZE = 9;
const SPEC_FILTERS = [
  {
    key: "cpu",
    label: "CPU",
    options: ["i3", "i5", "i7", "i9", "Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9", "Ultra 5", "Ultra 7"],
  },
  {
    key: "ram",
    label: "RAM",
    options: ["8GB", "16GB", "32GB", "64GB"],
  },
  {
    key: "storage",
    label: "ROM / O cung",
    options: ["256GB", "512GB", "1TB", "2TB"],
  },
] as const;

function ProductListContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  // Filter states
  const q = searchParams.get("q") || "";
  const brandId = searchParams.get("brandId");
  const categoryId = searchParams.get("categoryId");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const cpu = searchParams.get("cpu") || "";
  const ram = searchParams.get("ram") || "";
  const storage = searchParams.get("storage") || "";
  const pageParam = Number(searchParams.get("page") || "1");
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam - 1 : 0;
  const minPrice = minPriceParam && !Number.isNaN(Number(minPriceParam)) ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam && !Number.isNaN(Number(maxPriceParam)) ? Number(maxPriceParam) : undefined;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";

  const MAX_PRICE_LIMIT = 200000000;
  const [localMinPrice, setLocalMinPrice] = useState<number>(0);
  const [localMaxPrice, setLocalMaxPrice] = useState<number>(MAX_PRICE_LIMIT);
  const [minFocused, setMinFocused] = useState(false);
  const [maxFocused, setMaxFocused] = useState(false);

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);

    const isPriceSort = sortBy === "price";
    const params: ProductQueryParams = {
      keyword: q || undefined,
      brandId: brandId ? Number(brandId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice,
      maxPrice,
      cpu: cpu || undefined,
      ram: ram || undefined,
      storage: storage || undefined,
      page: isPriceSort ? 0 : currentPage,
      size: isPriceSort ? 1000 : PAGE_SIZE,
      sortBy: isPriceSort ? "createdAt" : sortBy,
      sortDir: sortDir
    };

    try {
      const res = await productApi.getAll(params);
      let content = res.content || [];

      if (isPriceSort) {
        content = [...content].sort((a, b) => {
          const priceA = a.variants?.[0]?.price || 0;
          const priceB = b.variants?.[0]?.price || 0;
          return sortDir === "asc" ? priceA - priceB : priceB - priceA;
        });
        
        const startIndex = currentPage * PAGE_SIZE;
        const pagedContent = content.slice(startIndex, startIndex + PAGE_SIZE);
        
        setProducts(pagedContent);
        setTotalPages(Math.ceil(content.length / PAGE_SIZE));
        setTotalElements(content.length);
        setNumberOfElements(pagedContent.length);
      } else {
        setProducts(content);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        setNumberOfElements(content.length);
      }
    } catch (e) {
      const apiError = e as ApiError;
        setError(apiError?.message || "Không tải được danh sách sản phẩm");
      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);
      setNumberOfElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [q, brandId, categoryId, minPrice, maxPrice, cpu, ram, storage, currentPage, sortBy, sortDir]);

  useEffect(() => {
    void fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    setCompareIds(readCompareIds());
  }, []);

  useEffect(() => {
    writeCompareIds(compareIds);
  }, [compareIds]);

  useEffect(() => {
    setLocalMinPrice(minPriceParam && !Number.isNaN(Number(minPriceParam)) ? Number(minPriceParam) : 0);
    setLocalMaxPrice(maxPriceParam && !Number.isNaN(Number(maxPriceParam)) ? Number(maxPriceParam) : MAX_PRICE_LIMIT);
  }, [minPriceParam, maxPriceParam]);

  const handleApplyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localMinPrice > 0) {
      params.set("minPrice", String(localMinPrice));
    } else {
      params.delete("minPrice");
    }
    
    if (localMaxPrice < MAX_PRICE_LIMIT) {
      params.set("maxPrice", String(localMaxPrice));
    } else {
      params.delete("maxPrice");
    }
    
    params.delete("page");
    router.push(`/product/list?${params.toString()}`);
  };

  const handleClearPrice = () => {
    setLocalMinPrice(0);
    setLocalMaxPrice(MAX_PRICE_LIMIT);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`/product/list?${params.toString()}`);
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getAllPublic(),
          brandApi.getAllPublic()
        ]);
        setCategories(catRes || []);
        setBrands(brandRes || []);
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/product/list?${query}` : "/product/list");
  };

  const updatePage = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage + 1));
    const query = params.toString();
    router.push(query ? `/product/list?${query}` : "/product/list");
  };

  const formatVnd = (value: number | undefined) => {
    if (value === undefined) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleToggleCompare = (productId?: number) => {
    if (!productId) return;
    setCompareNotice(null);
    setCompareIds((prev) => {
      if (!canAddCompare(prev) && !prev.includes(productId)) {
        setCompareNotice(`Chi duoc chon toi da ${getMaxCompare()} san pham de so sanh.`);
        return prev;
      }
      return toggleCompareId(prev, productId);
    });
  };

  const handleResetCompare = () => {
    setCompareIds([]);
    clearCompareIds();
    setCompareNotice(null);
  };

  const productGridStyle = {
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 pb-20">
      <AutoRefresh intervalMs={30000} onRefresh={fetchProducts} enabled={!isLoading} />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">Tất cả sản phẩm</span>
            </nav>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              {q ? `Kết quả cho "${q}"` : "Laptop Gaming & Office"}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Khám phá bộ sưu tập laptop đỉnh cao phù hợp với mọi nhu cầu.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm">
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              <span>{totalElements || products.length} Sản phẩm</span>
            </div>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split("-");
                const params = new URLSearchParams(searchParams.toString());
                params.set("sortBy", sb);
                params.set("sortDir", sd);
                params.delete("page");
                router.push(`/product/list?${params.toString()}`);
              }}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 shadow-sm outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>

            {(q || brandId || categoryId || minPriceParam || maxPriceParam || cpu || ram || storage || sortBy !== "createdAt" || sortDir !== "desc") && (
              <button
                onClick={() => router.push('/product/list')}
                className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition shadow-sm"
              >
                <X className="w-4 h-4" />
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <aside className="w-full shrink-0 space-y-6 lg:w-64 xl:w-72">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-slate-900">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-black tracking-tighter">Bộ lọc tìm kiếm</h3>
              </div>

              <div className="space-y-4">
                <details className="group border border-slate-200 rounded-2xl p-5 bg-slate-50/50 transition-all hover:border-blue-200 hover:bg-blue-50/30 shadow-sm" open={!!categoryId}>
                  <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-black text-slate-400 uppercase tracking-widest outline-none [&::-webkit-details-marker]:hidden">
                    Danh mục
                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="space-y-3 mt-5">
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 cursor-pointer group/label">
                        <input
                          type="checkbox"
                          checked={categoryId === String(c.id)}
                          onChange={(e) => updateFilter("categoryId", e.target.checked ? String(c.id) : null)}
                          className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 transition"
                        />
                        <span className={`text-sm font-medium transition-colors ${categoryId === String(c.id) ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover/label:text-blue-600'}`}>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="group border border-slate-200 rounded-2xl p-5 bg-slate-50/50 transition-all hover:border-blue-200 hover:bg-blue-50/30 shadow-sm" open={!!brandId}>
                  <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-black text-slate-400 uppercase tracking-widest outline-none [&::-webkit-details-marker]:hidden">
                    Thương hiệu
                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="space-y-3 mt-5">
                    {brands.map((b) => (
                      <label key={b.id} className="flex items-center gap-3 cursor-pointer group/label">
                        <input
                          type="checkbox"
                          checked={brandId === String(b.id)}
                          onChange={(e) => updateFilter("brandId", e.target.checked ? String(b.id) : null)}
                          className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 transition"
                        />
                        <span className={`text-sm font-medium transition-colors ${brandId === String(b.id) ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover/label:text-blue-600'}`}>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </details>

                {SPEC_FILTERS.map((filter) => {
                  const selectedValue = searchParams.get(filter.key) || "";

                  return (
                    <details key={filter.key} className="group border border-slate-200 rounded-2xl p-5 bg-slate-50/50 transition-all hover:border-blue-200 hover:bg-blue-50/30 shadow-sm" open={!!selectedValue}>
                      <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-black text-slate-400 uppercase tracking-widest outline-none [&::-webkit-details-marker]:hidden">
                        {filter.label}
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="space-y-3 mt-5">
                        {filter.options.map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer group/label">
                            <input
                              type="checkbox"
                              checked={selectedValue === option}
                              onChange={(e) => updateFilter(filter.key, e.target.checked ? option : null)}
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 transition"
                            />
                            <span className={`text-sm font-medium transition-colors ${selectedValue === option ? "text-blue-600 font-bold" : "text-slate-600 group-hover/label:text-blue-600"}`}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </details>
                  );
                })}

                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 transition-all hover:border-blue-200 hover:bg-blue-50/30 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Khoảng giá</p>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-2">
                      <input 
                        type="text"
                        value={minFocused ? (localMinPrice === 0 ? "0" : localMinPrice) : `${new Intl.NumberFormat("vi-VN").format(localMinPrice)}đ`}
                        onFocus={() => setMinFocused(true)}
                        onBlur={() => {
                          setMinFocused(false);
                          if (localMinPrice > localMaxPrice) setLocalMinPrice(localMaxPrice);
                        }}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          setLocalMinPrice(raw ? Number(raw) : 0);
                        }}
                        className="flex-1 w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-center text-sm font-medium text-slate-700 outline-none focus:border-blue-600 transition"
                      />
                      <div className="w-2 h-[1px] bg-slate-300 shrink-0"></div>
                      <input 
                        type="text"
                        value={maxFocused ? (localMaxPrice === 0 ? "0" : localMaxPrice) : `${new Intl.NumberFormat("vi-VN").format(localMaxPrice)}đ`}
                        onFocus={() => setMaxFocused(true)}
                        onBlur={() => {
                          setMaxFocused(false);
                          if (localMaxPrice < localMinPrice) setLocalMaxPrice(localMinPrice);
                          if (localMaxPrice > MAX_PRICE_LIMIT) setLocalMaxPrice(MAX_PRICE_LIMIT);
                        }}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          setLocalMaxPrice(raw ? Number(raw) : 0);
                        }}
                        className="flex-1 w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-center text-sm font-medium text-slate-700 outline-none focus:border-blue-600 transition"
                      />
                    </div>

                    <div className="relative w-full h-1.5 bg-slate-200 rounded-full my-4">
                      <div 
                        className="absolute h-full bg-green-500 rounded-full pointer-events-none"
                        style={{
                          left: `${(localMinPrice / MAX_PRICE_LIMIT) * 100}%`,
                          right: `${100 - (localMaxPrice / MAX_PRICE_LIMIT) * 100}%`
                        }}
                      />
                      <input 
                        type="range" 
                        min={0} 
                        max={MAX_PRICE_LIMIT} 
                        step={100000} 
                        value={localMinPrice} 
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), localMaxPrice - 100000);
                          setLocalMinPrice(val);
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-green-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <input 
                        type="range" 
                        min={0} 
                        max={MAX_PRICE_LIMIT} 
                        step={100000} 
                        value={localMaxPrice} 
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), localMinPrice + 100000);
                          setLocalMaxPrice(val);
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-green-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={handleClearPrice}
                        className="flex-1 bg-white text-red-500 border border-red-500 rounded-lg py-2 text-sm font-medium hover:bg-red-50 transition"
                      >
                        Bỏ chọn
                      </button>
                      <button 
                        onClick={handleApplyPrice}
                        className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-600 transition"
                      >
                        Xem kết quả
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Ưu đãi tháng 4</p>
                <h4 className="text-xl font-black mb-4 tracking-tighter">TRẢ GÓP 0% <br /> CHO SINH VIÊN</h4>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition">Tìm hiểu thêm</button>
              </div>
              <Star className="absolute top-[-10px] right-[-10px] w-20 h-20 text-white/10 rotate-12" />
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            {error ? (
              <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
                <p className="text-red-600 font-bold">{error}</p>
                <button onClick={() => router.push('/product/list')} className="mt-4 text-sm font-bold text-red-500 hover:underline underline-offset-4">Tải lại danh sách</button>
              </div>
            ) : isLoading ? (
              <div className="grid gap-5" style={productGridStyle}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="h-[340px] rounded-2xl border border-slate-100 bg-white animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-5" style={productGridStyle}>
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <SearchIcon className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tighter">Không tìm thấy sản phẩm</h3>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto">Chúng tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.</p>
                    <button
                      onClick={() => router.push('/product/list')}
                      className="mt-8 text-blue-600 font-bold hover:underline"
                    >
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
                      <div className="relative aspect-square mb-4 shrink-0 overflow-hidden rounded-xl bg-slate-50 p-4">
                        <Link href={`/product/${p.id}`}>
                          <img
                            src={getPrimaryImage(p)}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            alt={p.name}
                          />
                        </Link>
                        <div className="absolute left-2 top-2 rounded-md border border-white bg-white/80 px-2 py-1 text-[9px] font-black text-slate-800 backdrop-blur-md">
                          <span>HOT</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCompare(p.id)}
                          className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide transition ${
                            compareIds.includes(p.id || -1)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white/80 text-slate-700 border-white hover:border-emerald-300"
                          }`}
                        >
                          {compareIds.includes(p.id || -1) ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Scale className="w-3 h-3" />
                          )}
                          {compareIds.includes(p.id || -1) ? "Đã chọn" : "So sánh"}
                        </button>
                      </div>

                      <h3 className="mb-2 min-h-[38px] break-words text-[13px] font-bold leading-5 text-slate-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                        <Link href={`/product/${p.id}`}>{p.name}</Link>
                      </h3>

                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {getSpecValue(p, "cpu") && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 lowercase">
                            {getSpecValue(p, "cpu").split(" ").slice(0, 2).join(" ")}
                          </span>
                        )}
                        {getSpecValue(p, "ram") && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase">
                            {getSpecValue(p, "ram")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs text-slate-400 line-through font-medium mb-0.5">
                            {formatVnd((p.variants?.[0]?.price || 0) * 1.1)}
                          </p>
                          <p className="text-lg font-black text-blue-600 tracking-tighter">
                            {formatVnd(p.variants?.[0]?.price)}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (p.variants && p.variants.length > 0 && p.variants[0].id) {
                              addToCart(p.variants[0].id, 1, {
                                productName: p.name,
                                variantSku: p.variants[0].sku,
                                imageUrl: getPrimaryImage(p),
                                price: p.variants[0].price,
                                snapshotPrice: p.variants[0].price,
                              });
                            } else {
                              alert("Sản phẩm chưa có biến thể");
                            }
                          }}
                          className="group/btn relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 transition-all hover:bg-blue-600"
                        >
                          <ShoppingBag className="w-5 h-5 relative z-10" />
                          <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!isLoading && !error && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                numberOfElements={numberOfElements}
                onPageChange={updatePage}
              />
            )}
          </main>
        </div>
      </div>

      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(960px,92vw)]">
          <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur shadow-2xl shadow-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Danh sách so sánh</p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                Đã chọn {compareIds.length}/{getMaxCompare()} sản phẩm
              </p>
              {compareNotice && (
                <p className="text-xs font-bold text-amber-600 mt-1">{compareNotice}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetCompare}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800"
              >
                Đặt lại
              </button>
              <button
                type="button"
                disabled={compareIds.length < 2}
                onClick={() => router.push("/product/compare")}
                className="rounded-full bg-slate-900 px-5 py-2 text-xs font-black text-white shadow-lg shadow-slate-200 disabled:opacity-50 hover:bg-blue-600"
              >
                So sánh ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
