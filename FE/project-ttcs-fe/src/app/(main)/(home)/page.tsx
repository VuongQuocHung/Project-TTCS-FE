"use client";
import Link from "next/link";

import { useState, useEffect } from "react";

const flashSaleProducts = [
  { 
    id: 1, discount: "-40% OFF", 
    name: "ThinkPad X1 Carbon Gen 13", 
    image: "/assets/images/thinkpad-x1-carbon-gen-13.jpg",
    desc: "Ultra 5 225H, 14 inch WUXGA IPS", 
    price: "30.000.000₫", 
    oldPrice: "50.000.000₫"
  },
  { 
    id: 2, discount: "-15% OFF", 
    name: "ASUS Vivobook 15 X1504VA", 
    image: "/assets/images/asus-vivobook-x1504.webp",
    desc: "Core i5-1335U", 
    price: "14.490.000₫", 
    oldPrice: "17.000.000₫" 
  },
  { 
    id: 3, discount: "-20% OFF", 
    name: "Dell Inspiron 15 3530", 
    image: "/assets/images/dell.jpg",
    desc: "Core i7-1355U", 
    price: "18.990.000₫", 
    oldPrice: "23.000.000₫" 
  },
  { 
    id: 4, discount: "-10% OFF", 
    name: "HP Pavilion 15", 
    image: "/assets/images/hp-pavilion-15.jpg",

    desc: "Core i5-1335U", 
    price: "15.490.000₫", 
    oldPrice: "17.200.000₫" 
  },
];

const trendingProducts = [
  { id: 1, name: "Lenovo LOQ Gaming", price: "35.790.000₫" },
  { id: 2, name: "MacBook Air M3", price: "34.990.000₫" },
  { id: 3, name: "ASUS ROG Strix", price: "45.990.000₫" },
];

function useCountdown() {
  const [time, setTime] = useState({ h: 4, m: 22, s: 58 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function HomePage() {
  const { h, m, s } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const categories = [
    { name: "Gaming", desc: "Hiệu năng cao" },
    { name: "Văn phòng", desc: "Hiệu quả và đáng tin cậy" },
    { name: "Đồ họa", desc: "Mạnh mẽ cho người sáng tạo" },
  ];
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="max-w-[1152px] mx-auto p-[24px]">
        <div className="rounded-[16px] bg-gradient-to-br from-black via-slate-800 to-slate-900 
        text-white p-[48px] mb-[24px]">
          <span className="bg-blue-600 text-[12px] px-[12px] py-[4px] rounded-full font-semibold">
            NEW
          </span>

          <h1 className="text-[36px] font-extrabold mt-[16px] mb-[12px]">
            LAPTOP GIÁ RẺ <br /> NHƯ CHO
          </h1>

          <p className="text-gray-400 mb-[24px]">Mua 1 laptop – Tặng 3 phụ kiện</p>

          <div className="flex gap-[12px]">
            <button className="bg-blue-600 px-[20px] py-[8px] rounded-[18px] font-semibold hover:bg-blue-700">
              Mua ngay
            </button>
            <button className="border border-white/30 px-[20px] py-[8px] rounded-[18px]">
              Xem thêm
            </button>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="grid grid-cols-3 gap-[16px] mb-[40px]">
          {categories.map((c) => (
            <div key={c.name} className="bg-gray-900 text-white p-[24px] rounded-[12px] cursor-pointer hover:opacity-90">
              <p className="font-semibold">{c.name}</p>
              <p className="text-[12px] text-gray-400">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* FLASH SALE */}
        <div className="mb-[40px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div className="flex items-center gap-[12px]">
              <h2 className="text-[20px] font-bold">Flash Sale</h2>

              <div className="flex gap-[4px]">
                {[pad(h), pad(m), pad(s)].map((t, i) => (
                  <span key={i} className="bg-blue-700 text-white px-[8px] rounded text-[14px] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <a href="#" className="text-blue-600 text-[14px]">Xem tất cả</a>
          </div>

          <div className="grid grid-cols-4 gap-[16px]">
            {flashSaleProducts.map((p) => (
              <div key={p.id} className="bg-white p-[16px] rounded-[12px] border hover:shadow">
                <span className="bg-red-500 text-white text-[12px] px-[8px] py-[4px] rounded">
                  {p.discount}
                </span>

                <img
                  src={p.image}
                  alt={p.name}
                  className="h-[128px] w-full object-cover rounded my-[12px]"
                />

                <p className="text-[14px] font-semibold">{p.name}</p>
                <p className="text-[12px] text-gray-400">{p.desc}</p>

                <div className="flex justify-between items-center mt-[12px]">
                  <div>
                    <p className="font-bold">{p.price}</p>
                    <p className="text-[12px] line-through text-gray-400">{p.oldPrice}</p>
                  </div>

                  <button className="bg-blue-600 text-white px-[12px] py-[4px] rounded">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRENDING */}
        <div className="mb-[40px]">
          <h2 className="text-[20px] font-bold mb-[16px]">Trending</h2>

          <div className="grid grid-cols-3 gap-[16px]">
            {trendingProducts.map((p) => (
              <div key={p.id} className="bg-white p-[16px] rounded-[12px] border flex gap-[16px] hover:shadow">
                <div className="w-[80px] h-[80px] bg-gray-900 rounded" />

                <div>
                  <p className="font-semibold text-[14px]">{p.name}</p>
                  <p className="text-blue-600 font-bold">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}