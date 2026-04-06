"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts, type Product } from "@/lib/api";

function formatVnd(value: unknown): string {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function pickPrimaryImage(p: Product): string {
  const images = p.images ?? [];
  const primary = images.find((i) => i.isPrimary) ?? images[0];
  return primary?.imageUrl || "/assets/images/loq.jpg";
}

function buildSpecs(p: Product): string[] {
  const s = p.specification;
  const items = [s?.cpu, s?.ram, s?.vga, s?.screen].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0
  );
  return items;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getProducts()
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
      })
      .catch((e: any) => {
        if (!isMounted) return;
        setError(e?.message || "Không tải được danh sách sản phẩm");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const productCountLabel = useMemo(() => {
    if (isLoading) return "Đang tải...";
    if (error) return "0 Products Found";
    return `${products.length} Products Found`;
  }, [isLoading, error, products.length]);

  return (
    <div className="bg-[#f5f7fa] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-[20px] py-[24px]">
        {/* TITLE */}
        <h1 className="text-[32px] font-bold mb-[8px]">Laptop Gaming</h1>
        <p className="text-[14px] text-gray-500 mb-[24px]">
          Hiệu năng cực cao, chuyên dành cho game thủ đam mê tốc độ và đồ họa.
        </p>

        <div className="flex gap-[24px]">
          {/* FILTER */}
          <div className="w-[260px] bg-white rounded-[12px] p-[16px] border">
            <h3 className="font-semibold mb-[16px] text-[14px]">Bộ lọc</h3>
            {/* Price */}
            <div className="mb-[20px]">
              <p className="font-medium text-[13px] mb-[8px]">Khoảng giá</p>
              <div className="h-[4px] bg-gray-200 rounded" />
              <div className="flex justify-between text-[12px] mt-[4px] text-gray-400">
                <span>$999</span>
                <span>$4999+</span>
              </div>
            </div>

            {/* Brand */}
            <div className="mb-[20px]">
              <p className="font-medium text-[13px] mb-[8px]">Brand</p>
              {["Lenovo", "Acer", "Dell", "Asus"].map((b) => (
                <label key={b} className="flex gap-[8px] text-[13px] mb-[4px]">
                  <input type="checkbox" />
                  {b}
                </label>
              ))}
            </div>

            {/* CPU */}
            <div className="mb-[20px]">
              <p className="font-medium text-[13px] mb-[8px]">CPU</p>
              {["Intel i5", "Intel i7", "AMD Ryzen 5", "AMD Ryzen 7"].map((c) => (
                <label key={c} className="flex gap-[8px] text-[13px] mb-[4px]">
                  <input type="checkbox" />
                  {c}
                </label>
              ))}
            </div>

            {/* RAM */}
            <div className="mb-[20px]">
              <p className="font-medium text-[13px] mb-[8px]">RAM</p>
              {["8 GB", "16 GB", "32 GB", "64 GB"].map((r) => (
                <label key={r} className="flex gap-[8px] text-[13px] mb-[4px]">
                  <input type="checkbox" />
                  {r}
                </label>
              ))}
            </div>
          </div>

          {/* PRODUCT LIST */}
          <div className="flex-1">

            {/* SORT */}
            <div className="flex justify-between items-center mb-[16px]">
              <span className="text-[14px] text-gray-500">
                {productCountLabel}
              </span>

              <select className="border px-[12px] py-[6px] rounded-[8px] text-[13px]">
                <option>Mới nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
              </select>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-3 gap-[20px]">

              {error ? (
                <div className="col-span-3 bg-white rounded-[12px] border p-[16px] text-[14px] text-red-600 font-[600]">
                  {error}
                </div>
              ) : null}

              {products.map((p) => {
                const specs = buildSpecs(p);
                const price = formatVnd((p as any).price);
                const image = pickPrimaryImage(p);

                return (
                <div
                  key={p.id}
                  className="bg-white rounded-[12px] border p-[16px] hover:shadow-md transition"
                >
                  <div className="relative">
                    <img
                      src={image}
                      className="w-full h-[180px] object-contain"
                    />
                    <span className="absolute top-[8px] left-[8px] bg-blue-600 text-white text-[12px] px-[6px] py-[2px] rounded">
                      GIẢM 5%
                    </span>
                  </div>

                  <p className="font-semibold text-[14px] mt-[8px] mb-[4px]">
                    {p.name}
                  </p>

                  {/* specs */}
                  <div className="text-[12px] text-gray-500 mb-[8px]">
                    {specs.length ? (
                      specs.map((s) => <div key={s}>• {s}</div>)
                    ) : (
                      <div>• (Chưa có cấu hình)</div>
                    )}
                  </div>

                  {/* price */}
                  <p className="text-[18px] font-bold mb-[8px]">
                    {price || ""}
                  </p>

                  <button className="w-full bg-blue-600 text-white py-[8px] rounded-[8px] text-[14px]">
                    Add to Cart
                  </button>
                </div>
                );
              })}

            </div>

            {/* PAGINATION */}
            <div className="flex justify-center mt-[24px] gap-[8px]">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className="w-[32px] h-[32px] border rounded-[8px] text-[14px]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

