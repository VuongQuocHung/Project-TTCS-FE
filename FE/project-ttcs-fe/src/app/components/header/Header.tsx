"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Search,
  ShieldAlert,
  ShoppingCart,
  Ticket,
  User,
} from "lucide-react";
import { brandApi, categoryApi } from "@/lib/api-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Brand, Category } from "@/types/api";
import { MiniCart } from "./MiniCart";

type CatalogItem = {
  id?: number;
  name?: string;
};

const styles = {
  header: "sticky top-0 z-[60] flex h-[72px] w-full items-center gap-4 bg-red-600 px-10 text-white shadow-md",
  logo: "text-[22px] font-bold tracking-tighter",
  navButton: "flex h-10 items-center gap-2 rounded-lg bg-white/20 px-3 text-sm font-medium hover:bg-white/30",
  dropdown: "absolute left-0 top-full mt-2 w-64 rounded-xl border bg-white p-2 text-slate-700 shadow-xl",
  dropdownLink: "block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 hover:text-red-600",
  search: "flex h-10 flex-1 items-center rounded-full bg-white px-4 text-black shadow-sm",
  actionButton: "relative flex h-10 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm hover:bg-white/20",
  userMenu: "absolute right-0 top-full mt-2 w-52 rounded-xl border bg-white p-2 text-slate-700 shadow-xl",
};

function CatalogDropdown({
  title,
  allLabel,
  emptyLabel,
  items,
  filterKey,
  isOpen,
  onToggle,
  onClose,
}: {
  title: string;
  allLabel: string;
  emptyLabel: string;
  items: CatalogItem[];
  filterKey: "brandId" | "categoryId";
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button type="button" onClick={onToggle} className={styles.navButton}>
        <LayoutGrid size={16} />
        <span>{title}</span>
        <ChevronDown size={14} className={isOpen ? "rotate-180" : ""} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <Link href="/product/list" onClick={onClose} className={`${styles.dropdownLink} font-bold`}>
            {allLabel}
          </Link>
          <div className="my-1 h-px bg-slate-100" />

          {items.length ? (
            items.map((item) => (
              <Link
                key={`${filterKey}-${item.id}`}
                href={`/product/list?${filterKey}=${item.id}`}
                onClick={onClose}
                className={styles.dropdownLink}
              >
                {item.name}
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">{emptyLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

export const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openCatalogMenu, setOpenCatalogMenu] = useState<"category" | "brand" | null>(null);

  const catalogMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [brandList, categoryList] = await Promise.all([
          brandApi.getAllPublic(),
          categoryApi.getAllPublic(),
        ]);

        setBrands(brandList || []);
        setCategories(categoryList || []);
      } catch (error) {
        console.error("Failed to fetch header data:", error);
      }
    };

    void fetchHeaderData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!catalogMenuRef.current?.contains(event.target as Node)) {
        setOpenCatalogMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchQuery.trim();

    if (keyword) {
      router.push(`/product/list?q=${encodeURIComponent(keyword)}`);
    }
  };

  const closeCatalogMenu = () => setOpenCatalogMenu(null);
  const closeUserMenu = () => setIsUserMenuOpen(false);

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          HĐP STORE
        </Link>

        <div ref={catalogMenuRef} className="flex items-center gap-2">
          <CatalogDropdown
            title="Danh mục"
            allLabel="Tất cả danh mục"
            emptyLabel="Chưa có danh mục"
            filterKey="categoryId"
            items={categories}
            isOpen={openCatalogMenu === "category"}
            onToggle={() => setOpenCatalogMenu(openCatalogMenu === "category" ? null : "category")}
            onClose={closeCatalogMenu}
          />

          <CatalogDropdown
            title="Thương hiệu"
            allLabel="Tất cả thương hiệu"
            emptyLabel="Chưa có thương hiệu"
            filterKey="brandId"
            items={brands}
            isOpen={openCatalogMenu === "brand"}
            onToggle={() => setOpenCatalogMenu(openCatalogMenu === "brand" ? null : "brand")}
            onClose={closeCatalogMenu}
          />
        </div>

        <form onSubmit={handleSearch} className={styles.search}>
          <button type="submit" className="text-gray-400 hover:text-blue-500">
            <Search size={18} />
          </button>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Bạn muốn mua gì hôm nay?"
            className="ml-2 flex-1 text-sm outline-none placeholder:text-gray-400"
          />
        </form>

        <button onClick={() => setIsMiniCartOpen(true)} className={styles.actionButton}>
          <ShoppingCart size={20} />
          <span>Giỏ hàng</span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-2 rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-black">
              {totalItems}
            </span>
          )}
        </button>

        <div className="relative">
          {user ? (
            <>
              <button onClick={() => setIsUserMenuOpen((open) => !open)} className={styles.actionButton}>
                <User size={18} />
                <span className="max-w-28 truncate">{user.fullName || user.username || "User"}</span>
                <ChevronDown size={14} className={isUserMenuOpen ? "rotate-180" : ""} />
              </button>

              {isUserMenuOpen && (
                <div className={styles.userMenu}>
                  <Link href="/user/profile" onClick={closeUserMenu} className={styles.dropdownLink}>
                    Trang cá nhân
                  </Link>
                  <Link href="/user/orders" onClick={closeUserMenu} className={styles.dropdownLink}>
                    Đơn hàng của tôi
                  </Link>
                  <Link href="/user/vouchers" onClick={closeUserMenu} className={styles.dropdownLink}>
                    <span className="inline-flex items-center gap-2">
                      <Ticket size={16} />
                      Voucher của tôi
                    </span>
                  </Link>

                  {(user.role === "ADMIN" || user.role === "MANAGER") && (
                    <Link
                      href={user.role === "ADMIN" ? "/admin" : "/manager"}
                      onClick={closeUserMenu}
                      className={`${styles.dropdownLink} font-bold text-blue-600 hover:bg-blue-50`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <ShieldAlert size={16} />
                        {user.role === "ADMIN" ? "Quản trị hệ thống" : "Quản lý chi nhánh"}
                      </span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      closeUserMenu();
                    }}
                    className={`${styles.dropdownLink} w-full text-left text-red-600 hover:bg-red-50`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOut size={16} />
                      Đăng xuất
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-10 items-center gap-2 rounded-lg bg-white/20 px-3 text-sm">
              <User size={16} />
              <Link href="/user/login" className="hover:underline">
                Đăng nhập
              </Link>
              <span className="opacity-60">/</span>
              <Link href="/user/register" className="hover:underline">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {isMiniCartOpen && (
        <div className="fixed inset-0 z-[90] bg-black/40" onClick={() => setIsMiniCartOpen(false)} />
      )}

      <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
    </>
  );
};
