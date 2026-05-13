"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productApi } from "@/lib/api-endpoints";
import { getPrimaryImage, getSpecValue } from "@/lib/format";
import type { Product } from "@/types/api";
import type { ApiError } from "@/lib/api";
import {
  clearCompareIds,
  getMaxCompare,
  readCompareIds,
  writeCompareIds
} from "@/lib/compare";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";

const SPEC_ROWS = [
  { label: "CPU", key: "cpu" },
  { label: "RAM", key: "ram" },
  { label: "Ổ cứng", key: "storage" },
  { label: "Màn hình", key: "screen" },
  { label: "VGA", key: "vga" }
] as const;

export default function CompareProductsPage() {
  const router = useRouter();
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCompareIds(readCompareIds());
  }, []);

  useEffect(() => {
    writeCompareIds(compareIds);
  }, [compareIds]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      if (compareIds.length < 2) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const results = await Promise.all(compareIds.map((id) => productApi.getById(id)));
        setProducts(results.filter(Boolean));
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.message || "Không thể tải sản phẩm để so sánh.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProducts();
  }, [compareIds]);

  const formatVnd = (value: number | undefined) => {
    if (value === undefined) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  };

  const compareTitle = useMemo(() => {
    if (compareIds.length === 0) return "Chưa có sản phẩm";
    return `Đang so sánh ${compareIds.length}/${getMaxCompare()} sản phẩm`;
  }, [compareIds.length]);

  const handleRemove = (id?: number) => {
    if (!id) return;
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const handleReset = () => {
    setCompareIds([]);
    clearCompareIds();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <Link href="/product/list" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mt-3">So sánh sản phẩm</h1>
            <p className="text-sm text-slate-500 mt-2">{compareTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <Trash2 className="w-4 h-4" />
              Đặt lại danh sách
            </button>
            <button
              type="button"
              onClick={() => router.push("/product/list")}
              className="rounded-full bg-slate-900 px-5 py-2 text-xs font-black text-white hover:bg-blue-600"
            >
              Chọn thêm sản phẩm
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Đang tải thông tin so sánh...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-3xl border border-red-100 p-10 text-center">
            <p className="text-red-600 font-bold">{error}</p>
            <button
              onClick={() => router.push("/product/list")}
              className="mt-4 text-sm font-bold text-red-500 hover:underline"
            >
              Quay lại danh sách sản phẩm
            </button>
          </div>
        ) : products.length < 2 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Chưa đủ sản phẩm</h3>
            <p className="text-slate-500 mt-2">
              Hãy chọn ít nhất 2 sản phẩm để bắt đầu so sánh.
            </p>
            <button
              onClick={() => router.push("/product/list")}
              className="mt-6 rounded-full bg-blue-600 px-6 py-2 text-xs font-black text-white hover:bg-blue-700"
            >
              Chọn sản phẩm
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden p-4 mb-4">
                    <img
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-3 right-3 rounded-full bg-white/90 border border-slate-200 px-3 py-1 text-[10px] font-black uppercase text-slate-600"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-blue-600 font-black text-lg">
                    {formatVnd(product.variants?.[0]?.price)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {product.brandName || "Thương hiệu"} · {product.categoryName || "Danh mục"}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px] bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="grid" style={{ gridTemplateColumns: `220px repeat(${products.length}, minmax(200px, 1fr))` }}>
                  <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400">Thông số</div>
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border-b border-slate-100 text-xs font-black text-slate-900">
                      {product.name}
                    </div>
                  ))}

                  <div className="p-4 border-b border-slate-100 text-sm font-bold text-slate-600">Giá</div>
                  {products.map((product) => (
                    <div key={`${product.id}-price`} className="p-4 border-b border-slate-100 text-sm font-black text-blue-600">
                      {formatVnd(product.variants?.[0]?.price)}
                    </div>
                  ))}

                  <div className="p-4 border-b border-slate-100 text-sm font-bold text-slate-600">Thương hiệu</div>
                  {products.map((product) => (
                    <div key={`${product.id}-brand`} className="p-4 border-b border-slate-100 text-sm text-slate-700">
                      {product.brandName || "-"}
                    </div>
                  ))}

                  <div className="p-4 border-b border-slate-100 text-sm font-bold text-slate-600">Danh mục</div>
                  {products.map((product) => (
                    <div key={`${product.id}-category`} className="p-4 border-b border-slate-100 text-sm text-slate-700">
                      {product.categoryName || "-"}
                    </div>
                  ))}

                  {SPEC_ROWS.map((row) => (
                    <Fragment key={row.key}>
                      <div className="p-4 border-b border-slate-100 text-sm font-bold text-slate-600">
                        {row.label}
                      </div>
                      {products.map((product) => (
                        <div key={`${product.id}-${row.key}`} className="p-4 border-b border-slate-100 text-sm text-slate-700">
                          {getSpecValue(product, row.key) || "-"}
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
