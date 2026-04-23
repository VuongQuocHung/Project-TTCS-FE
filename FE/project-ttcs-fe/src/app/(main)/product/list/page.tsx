"use client";

import { useEffect, useState, Suspense } from "react";
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
  Layers,
  Award
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { categoryApi, brandApi } from "@/lib/api-endpoints";
import { Category, Brand } from "@/types/api";
import { Pagination } from "@/app/components/common/Pagination";

function ProductListContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const PAGE_SIZE = 3;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // Tổng số sản phẩm phù hợp với bộ lọc (không phải số sản phẩm trên trang hiện tại)
  const [numberOfElements, setNumberOfElements] = useState(0); // Số sản phẩm thực tế trên trang hiện tại (có thể nhỏ hơn PAGE_SIZE nếu là trang cuối hoặc không có sản phẩm nào)

  // Filter states
  const q = searchParams.get("q") || "";
  const brandId = searchParams.get("brandId");
  const categoryId = searchParams.get("categoryId");
  const pageParam = Number(searchParams.get("page") || "0");
  const currentPage = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const params: ProductQueryParams = {
      name: q || undefined,
      brandId: brandId ? Number(brandId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: currentPage,
      size: PAGE_SIZE
    };

    productApi.getAll(params)
      .then((res) => {
        if (!isMounted) return;
        setProducts(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        setNumberOfElements(res.numberOfElements || (res.content?.length || 0));
      })
      .catch((e: any) => {
        if (!isMounted) return;
        setError(e?.message || "Không tải được danh sách sản phẩm");
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
        setNumberOfElements(0);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [q, brandId, categoryId, currentPage]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getAll({ size: 100 }),
          brandApi.getAll({ size: 100 })
        ]);
        setCategories(catRes.content || []);
        setBrands(brandRes.content || []);
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
    // Reset to page 1 (index 0) whenever filters change.
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/product/list?${query}` : "/product/list");
  };

  const updatePage = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 0) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
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



  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* HEADER */}
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

          <div className="flex items-center gap-3">
             <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <span>{totalElements || products.length} Sản phẩm</span>
             </div>
             {(q || brandId || categoryId) && (
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

        <div className="flex flex-col lg:flex-row gap-10">
          {/* SIDEBAR FILTERS */}
          <aside className="w-full lg:w-[280px] space-y-8 shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-slate-900">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-black tracking-tighter">Bộ lọc tìm kiếm</h3>
              </div>
              
              <div className="space-y-8">
                {/* Categories */}
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Danh mục</p>
                  <div className="space-y-3">
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={categoryId === String(c.id)}
                          onChange={(e) => updateFilter("categoryId", e.target.checked ? String(c.id) : null)}
                          className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 transition" 
                        />
                        <span className={`text-sm font-medium transition-colors ${categoryId === String(c.id) ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Thương hiệu</p>
                  <div className="space-y-3">
                    {brands.map((b) => (
                      <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={brandId === String(b.id)}
                          onChange={(e) => updateFilter("brandId", e.target.checked ? String(b.id) : null)}
                          className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 transition" 
                        />
                        <span className={`text-sm font-medium transition-colors ${brandId === String(b.id) ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Khoảng giá</p>
                  <div className="space-y-4">
                    <input type="range" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>10.000.000₫</span>
                      <span>100.000.000₫</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Promo Banner */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Ưu đãi tháng 4</p>
                 <h4 className="text-xl font-black mb-4 tracking-tighter">TRẢ GÓP 0% <br/> CHO SINH VIÊN</h4>
                 <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition">Tìm hiểu thêm</button>
               </div>
               <Star className="absolute top-[-10px] right-[-10px] w-20 h-20 text-white/10 rotate-12" />
            </div>
          </aside>

          {/* PRODUCT LIST */}
          <main className="flex-1">
            {error ? (
              <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
                <p className="text-red-600 font-bold">{error}</p>
                <button onClick={() => router.push('/product/list')} className="mt-4 text-sm font-bold text-red-500 hover:underline underline-offset-4">Tải lại danh sách</button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-100 h-[420px] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
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
                    <div key={p.id} className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300 flex flex-col">
                      <div className="relative aspect-square mb-6 bg-slate-50 rounded-2xl overflow-hidden p-6 shrink-0">
                         <Link href={`/product/${p.id}`}>
                           <img 
                            src={p.images?.[0]?.imageUrl || "/assets/images/loq.jpg"} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                            alt={p.name} 
                           />
                         </Link>
                         <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-slate-800 border border-white">
                            <span>HOT</span>
                         </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2 min-h-[40px]">
                        <Link href={`/product/${p.id}`}>{p.name}</Link>
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {p.specification?.cpu && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 lowercase">
                            {p.specification.cpu.split(' ').slice(0, 2).join(' ')}
                          </span>
                        )}
                        {p.specification?.ram && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase">
                            {p.specification.ram}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs text-slate-400 line-through font-medium mb-0.5">
                             {formatVnd((p.price || 0) * 1.1)}
                          </p>
                          <p className="text-xl font-black text-blue-600 tracking-tighter">
                            {formatVnd(p.price)}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => addToCart(p)}
                          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 overflow-hidden relative group/btn"
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
