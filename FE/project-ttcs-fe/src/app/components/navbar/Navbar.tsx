import Link from "next/link";
import { Search, ShoppingCart, User, Laptop } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="bg-white border-b h-14 flex items-center px-8 gap-6 sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:bg-blue-700 transition">
          <Laptop size={18} />
        </div>
        <span className="font-bold text-[16px] tracking-tight text-slate-800">VPH STORE</span>
      </Link>

      <Link href="/product/list" className="text-[14px] font-medium text-slate-600 hover:text-blue-600 transition">
        Danh mục
      </Link>

      <div className="flex-1 max-w-[400px] ml-auto flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-9 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
        <Search size={16} className="text-slate-400" />
        <input 
          className="bg-transparent outline-none text-[14px] w-full text-slate-700 placeholder:text-slate-400" 
          placeholder="Tìm kiếm sản phẩm..." 
        />
      </div>

      <div className="flex gap-2">
        <Link href="/cart" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
          <ShoppingCart size={20} />
        </Link>
        <Link href="/user/login" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
}