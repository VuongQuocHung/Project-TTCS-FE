"use client";

import Link from "next/link";
import { FaShoppingCart , FaSearch, FaUser} from "react-icons/fa";
import { LuGrid2X2X } from "react-icons/lu";
import { FiMapPin } from "react-icons/fi";

export const Header = () => {
  return (
    <header className="w-full h-[72px] px-[40px] flex items-center gap-[16px] 
    bg-gradient-to-r from-[#d70018] to-[#ff3b3b] text-white">

      {/* LOGO */}
      <Link href="/" className="text-[22px] font-bold flex items-center gap-[4px]">
        <span>VPH STORE</span>
      </Link>

      {/* DANH MỤC */}
      <button className="flex items-center gap-[6px] bg-white/20 px-[12px] py-[8px] rounded-[8px] text-[14px]">
        <LuGrid2X2X size={16} />
        Danh mục
      </button>

      {/* LOCATION */}
      <select className="flex items-center gap-[6px] bg-white/20 px-[12px] py-[8px] rounded-[8px] text-[14px]">
        <option value="">
          <FiMapPin size={16} /> Hà Nội
        </option>
        <option value="">
          <FiMapPin size={16} /> Hồ Chí Minh
        </option>
      </select>

      {/* SEARCH */}
      <div className="flex-1 flex items-center bg-white rounded-[999px] h-[40px] px-[16px]">
        <FaSearch size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Bạn muốn mua gì hôm nay?"
          className="flex-1 ml-[8px] outline-none text-[14px] text-black"
        />
      </div>

      {/* CART */}
      <button className="relative flex items-center gap-[6px] text-[14px]">
        <FaShoppingCart size={20} />
        Giỏ hàng

        {/* badge */}
        <span className="absolute top-[-6px] right-[-10px] bg-yellow-400 
        text-black text-[12px] px-[5px] rounded-full">
          0
        </span>
      </button>

      {/* LOGIN */}
      <button className="flex items-center gap-[6px] bg-white/20 px-[12px] py-[8px] rounded-[8px] text-[14px]">
        <FaUser size={16} />
        Đăng nhập
      </button>

    </header>
  );
};