"use client";

import { useCallback, useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { branchApi, productApi, reviewApi } from "@/lib/api-endpoints";
import type { Branch, Product, Review } from "@/types/api";
import { 
  ShoppingCart, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Smartphone, 
  Box, 
  ShieldCheck, 
  Truck, 
  Clock,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Store,
  Scale,
  Check,
  Trash2
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { getPrimaryImage, getSpecValue } from "@/lib/format";
import { resolveApiAssetUrl, getApiBaseUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AutoRefresh } from "@/app/components/common/AutoRefresh";
import {
  canAddCompare,
  clearCompareIds,
  getMaxCompare,
  readCompareIds,
  toggleCompareId,
  writeCompareIds
} from "@/lib/compare";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const fetchProductDetail = useCallback(async () => {
    if (!id) return;

    try {
      const [prod, productReviews, branchList] = await Promise.all([
        productApi.getById(Number(id)),
        reviewApi.getProductReviews(Number(id)),
        branchApi.getAllPublic().catch((error) => {
          console.error("Lỗi kết nối với API chi nhánh:", error);
          return [];
        }),
      ]);

      setProduct(prod);
      setActiveImage(getPrimaryImage(prod));
      setReviews(productReviews);
      setBranches(branchList || []);

      if (prod.categoryName) {
        const related = await productApi.getAll({
          size: 5,
        });
        setRelatedProducts(related.content?.filter((p) => p.id !== prod.id) || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProductDetail();
  }, [fetchProductDetail]);

  useEffect(() => {
    setCompareIds(readCompareIds());
  }, []);

  useEffect(() => {
    writeCompareIds(compareIds);
  }, [compareIds]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + (review.rating || 0), 0) / reviews.length
      : 0;
  const roundedAverageRating = Math.round(averageRating);

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product?.id) return;

    setReviewError(null);
    setReviewMessage(null);

    if (!reviewContent.trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await reviewApi.create({
        productId: product.id,
        rating: reviewRating,
        content: reviewContent.trim(),
      });
      setReviews((current) => [newReview, ...current]);
      setReviewContent("");
      setReviewRating(5);
      setReviewMessage("Cảm ơn bạn đã gửi đánh giá.");
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Không thể gửi đánh giá. Vui lòng thử lại.";
      setReviewError(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 font-medium tracking-tight">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Box className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-slate-500 mb-6">Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/product/list" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleToggleCompare = () => {
    if (!product?.id) return;
    setCompareNotice(null);
    setCompareIds((prev) => {
      if (!canAddCompare(prev) && !prev.includes(product.id as number)) {
        setCompareNotice(`Chi duoc chon toi da ${getMaxCompare()} san pham de so sanh.`);
        return prev;
      }
      return toggleCompareId(prev, product.id as number);
    });
  };

  const handleResetCompare = () => {
    setCompareIds([]);
    clearCompareIds();
    setCompareNotice(null);
  };

  const currentVariant = product.variants?.[0];
  let allSpecs: Record<string, unknown> = {};
  if (currentVariant?.specsJson) {
    if (typeof currentVariant.specsJson === "string") {
      try { allSpecs = JSON.parse(currentVariant.specsJson); } catch {}
    } else {
      allSpecs = currentVariant.specsJson as Record<string, unknown>;
    }
  }

  const specItems: { label: string; val: string; icon: React.ReactNode }[] = [];
  const specsLowerMap = new Map<string, { key: string; val: string }>();
  Object.entries(allSpecs).forEach(([k, v]) => {
    if (v) specsLowerMap.set(k.toLowerCase().trim(), { key: k, val: String(v) });
  });

  const predefined = [
    { label: "CPU", keys: ["cpu", "vi xử lý", "chipset"], icon: <Cpu className="w-5 h-5 text-blue-600" /> },
    { label: "RAM", keys: ["ram", "dung lượng ram", "bộ nhớ trong"], icon: <Smartphone className="w-5 h-5 text-blue-600" /> },
    { label: "Ổ CỨNG", keys: ["storage", "ổ cứng", "dung lượng ổ cứng"], icon: <HardDrive className="w-5 h-5 text-blue-600" /> },
    { label: "MÀN HÌNH", keys: ["screen", "màn hình", "kích thước màn hình"], icon: <Monitor className="w-5 h-5 text-blue-600" /> },
    { label: "VGA", keys: ["vga", "card đồ họa", "loại card đồ họa", "card màn hình", "card tích hợp"], icon: <Gamepad2 className="w-5 h-5 text-blue-600" /> },
  ];

  predefined.forEach(p => {
    for (const k of p.keys) {
      if (specsLowerMap.has(k)) {
        specItems.push({ label: p.label, val: specsLowerMap.get(k)!.val, icon: p.icon });
        specsLowerMap.delete(k);
        break;
      }
    }
  });

  const remainingSpecs = Array.from(specsLowerMap.values());
  for (let i = 0; i < remainingSpecs.length && specItems.length < 5; i++) {
    specItems.push({ label: remainingSpecs[i].key.toUpperCase(), val: remainingSpecs[i].val, icon: <Box className="w-5 h-5 text-blue-600" /> });
  }

  const branchById = new Map(
    branches
      .filter((branch) => branch.id !== undefined)
      .map((branch) => [branch.id as number, branch])
  );

  const processHtml = (html?: string | null) => {
    if (!html) return "Thông tin mô tả sản phẩm đang được cập nhật...";
    let processed = html.replace(/data-src=/gi, "src=");
    processed = processed.replace(/((?:src|href)\s*=\s*(["']))\s*\/?(media)\//gi, `$1https://laptop88.vn/$3/`);
    processed = processed.replace(/((?:src|href)\s*=\s*(["']))\s*\/?(uploads)\//gi, `$1${getApiBaseUrl()}/$3/`);
    
    // Xử lý chuỗi JSON thô nếu có (loại bỏ ngoặc kép bọc ngoài và unescape \n)
    if (processed.startsWith('"') && processed.endsWith('"')) {
      processed = processed.slice(1, -1);
    }
    processed = processed.replace(/\\n/g, "\n");
    processed = processed.replace(/\\"/g, '"');
    
    return processed;
  };
  const branchStocks = Object.values(
    (currentVariant?.inventories || [])
      .filter((inventory) => Number(inventory.quantity ?? 0) > 0)
      .reduce<Record<string, { branchId?: number; branchName: string; address?: string; phone?: string; quantity: number }>>((result, inventory) => {
        const branch = inventory.branchId ? branchById.get(inventory.branchId) : undefined;
        const key = String(inventory.branchId || inventory.branchName || "unknown");
        const quantity = Number(inventory.quantity ?? 0);
        const current = result[key] || {
          branchId: inventory.branchId,
          branchName: branch?.name || inventory.branchName || "Chi nhánh",
          address: branch?.address || inventory.address,
          phone: branch?.phone || inventory.phone,
          quantity: 0,
        };

        result[key] = {
          branchId: current.branchId,
          branchName: branch?.name || current.branchName,
          address: branch?.address || current.address || inventory.address,
          phone: branch?.phone || current.phone || inventory.phone,
          quantity: current.quantity + quantity,
        };
        return result;
      }, {})
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <AutoRefresh intervalMs={3000} onRefresh={fetchProductDetail} enabled={!isLoading} />
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 whitespace-nowrap overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href="/product/list" className="hover:text-blue-600 transition">Sản phẩm</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* IMAGE SECTION */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 overflow-hidden shadow-sm group">
              <img 
                src={activeImage} 
                className="w-full h-[400px] object-contain group-hover:scale-105 transition-transform duration-500" 
                alt={product.name} 
              />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.variants?.[0]?.images?.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(resolveApiAssetUrl(img.imageUrl) || "/assets/images/loq.jpg")}
                  className={`w-24 h-24 rounded-2xl border-2 shrink-0 transition-all overflow-hidden bg-white p-2 ${
                    activeImage === resolveApiAssetUrl(img.imageUrl) ? "border-blue-600" : "border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <img src={resolveApiAssetUrl(img.imageUrl)} className="w-full h-full object-contain" alt={`${product.name} ${idx}`} />
                </button>
              ))}
            </div>

            {/* DESCRIPTION SECTION */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tighter">
                <Box className="w-5 h-5 text-blue-600" />
                Mô tả sản phẩm
              </h3>
              <div className="relative">
                <div 
                  className={`text-slate-600 leading-relaxed text-sm html-content whitespace-pre-wrap transition-all duration-500 overflow-hidden ${showFullDescription ? 'max-h-[50000px]' : 'max-h-[400px]'}`}
                  dangerouslySetInnerHTML={{ __html: processHtml(product.description) }}
                />
                {!showFullDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="px-6 py-2 border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors"
                >
                  {showFullDescription ? "Thu gọn" : "Xem thêm"}
                </button>
              </div>
            </div>
          </div>

          {/* BUY SECTION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <span className="bg-blue-50 text-blue-600 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest mb-4 inline-block border border-blue-100">
                {product.brandName || "Premium Laptop"}
              </span>

              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tighter">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                {/* <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= roundedAverageRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div> */}
                <span className="text-sm text-slate-400 font-medium">
                  {reviews.length > 0
                    ? `${averageRating.toFixed(1)}/5 · ${reviews.length} đánh giá`
                    : "Chưa có đánh giá"}
                </span>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl mb-8 group overflow-hidden relative">
                <p className="text-4xl font-black text-blue-600 tracking-tighter relative z-10 transition-transform group-hover:scale-105 duration-300">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(currentVariant?.price || 0)}
                </p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-12 translate-y-[-12px]" />
              </div>

              {/* 1. BUY BUTTON */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <button 
                  onClick={() => {
                    if (currentVariant?.id) {
                      addToCart(currentVariant.id, 1);
                    } else {
                      alert("Sản phẩm chưa có biến thể");
                    }
                  }}
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black py-5 rounded-2xl flex flex-col items-center justify-center gap-1 hover:from-red-700 hover:to-orange-600 transition-all shadow-xl shadow-red-200 ring-4 ring-red-50 transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2 text-xl">
                    <ShoppingCart className="w-6 h-6" />
                    ĐẶT MUA NGAY
                  </span>
                  <span className="text-xs font-medium text-white/90">
                    Giao hàng tận nơi hoặc nhận tại cửa hàng
                  </span>
                </button>
                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Hỗ trợ trả góp 0% qua thẻ tín dụng
                </div>
              </div>

              {/* BENEFITS */}
              <div className="space-y-4 pt-2 pb-6 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Bảo hành chính hãng 24 tháng</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span>Miễn phí giao hàng nội thành</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Giao hàng nhanh 2H Hà Nội & HCM</span>
                </div>
              </div>

              {/* 2. SPECS BOX */}
              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200 mb-8">
                <h3 className="font-black text-lg mb-4 flex items-center gap-3 tracking-tighter">
                  <Box className="w-5 h-5 text-blue-500" />
                  Thông số nổi bật
                </h3>
                <div className="space-y-3">
                  {specItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group">
                      <div className="shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">{item.label}</div>
                        <div className="text-sm font-medium leading-tight group-hover:text-blue-200 transition-colors line-clamp-1">{item.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowSpecsModal(true)}
                  className="w-full mt-4 py-3 border border-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  Xem chi tiết thông số
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3. COMPARE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">So sánh sản phẩm</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      Đã chọn {compareIds.length}/{getMaxCompare()} sản phẩm
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleCompare}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide border transition ${
                      compareIds.includes(product.id || -1)
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    {compareIds.includes(product.id || -1) ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Scale className="w-3.5 h-3.5" />
                    )}
                    {compareIds.includes(product.id || -1) ? "Đã chọn" : "So sánh"}
                  </button>
                </div>
                {compareNotice && (
                  <p className="text-xs font-bold text-amber-600 mt-2">{compareNotice}</p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetCompare}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:text-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Đặt lại
                  </button>
                  <button
                    type="button"
                    disabled={compareIds.length < 2}
                    onClick={() => router.push("/product/compare")}
                    className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-black text-white shadow-lg shadow-slate-200 disabled:opacity-50 hover:bg-blue-600"
                  >
                    So sánh ngay
                  </button>
                </div>
              </div>

              {/* 4. BRANCH STOCKS */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Còn hàng tại chi nhánh
                </p>
                {branchStocks.length > 0 ? (
                  <div className="space-y-3">
                    {branchStocks.map((stock) => (
                      <div
                        key={stock.branchId || stock.branchName}
                        className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm"
                      >
                        <p className="flex items-center gap-2 font-black text-green-700">
                          <Store className="w-4 h-4 shrink-0" />
                          {stock.branchName}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 shrink-0 text-green-600" />
                          <span>{stock.phone || "Chưa có số điện thoại"}</span>
                        </p>
                        <p className="mt-2 flex items-start gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                          <span>{stock.address || "Chưa có địa chỉ"}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Chưa có thông tin tồn kho.</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Đánh giá sản phẩm</h2>
              <p className="text-sm text-slate-500 mt-1">
                {reviews.length > 0
                  ? `Điểm trung bình ${averageRating.toFixed(1)}/5 từ ${reviews.length} đánh giá`
                  : "Chưa có đánh giá nào cho sản phẩm này."}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= roundedAverageRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Số sao</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-yellow-400 transition hover:scale-110"
                          aria-label={`${star} sao`}
                        >
                          <Star className={`w-7 h-7 ${star <= reviewRating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reviewContent" className="block text-sm font-bold text-slate-700 mb-2">
                      Nội dung đánh giá
                    </label>
                    <textarea
                      id="reviewContent"
                      value={reviewContent}
                      onChange={(event) => setReviewContent(event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    />
                  </div>

                  {reviewError ? <p className="text-sm font-semibold text-red-600">{reviewError}</p> : null}
                  {reviewMessage ? <p className="text-sm font-semibold text-green-700">{reviewMessage}</p> : null}

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              ) : (
                <div className="text-sm text-slate-600">
                  Vui lòng{" "}
                  <Link href="/user/login" className="font-bold text-blue-600 hover:underline">
                    đăng nhập
                  </Link>{" "}
                  để đánh giá sản phẩm.
                </div>
              )}
            </div>

            <div className="lg:col-span-3 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-black text-slate-900">
                          {review.fullName || review.username || "Khách hàng"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (review.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{review.content}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  Hãy là người đầu tiên đánh giá sản phẩm này.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Sản phẩm tương đương</h2>
              <Link href="/product/list" className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                Xem thêm
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden p-4">
                    <img src={getPrimaryImage(p)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{p.name}</h3>
                  <p className="text-blue-600 font-black mt-2">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(p.variants?.[0]?.price || 0)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SPECS MODAL */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowSpecsModal(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <Box className="w-6 h-6 text-blue-600" />
                Thông số kỹ thuật chi tiết
              </h3>
              <button onClick={() => setShowSpecsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {Object.entries(allSpecs).length > 0 ? (
                    Object.entries(allSpecs).map(([key, val], i) => (
                       <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                         <td className="py-4 px-4 w-1/3 bg-slate-50/50 text-sm font-bold text-slate-700">{key}</td>
                         <td className="py-4 px-4 text-sm text-slate-600 font-medium leading-relaxed">{String(val)}</td>
                       </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-8 px-4 text-sm text-slate-500 font-medium text-center italic" colSpan={2}>
                        Đang cập nhật thông số chi tiết...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Gamepad2(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}
