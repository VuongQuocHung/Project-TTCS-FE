"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  RefreshCw,
  Search,
  Save,
  X,
  Edit2,
  Eye,
} from "lucide-react";
import { productApi, managerDashboardApi } from "@/lib/api-endpoints";
import { getPrimaryImage, formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { ApiError } from "@/lib/api";
import type { Product } from "@/types/api";

const PAGE_SIZE = 10;

export default function ManagerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Inline inventory editing
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productApi.getAll({
        page,
        size: PAGE_SIZE,
        keyword: searchTerm || undefined,
      });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, [page, searchTerm]);

  const getBranchQuantity = (product: Product): number => {
    const variant = product.variants?.[0];
    if (!variant?.inventories || !user?.branchId) return variant?.quantity ?? 0;
    const inv = variant.inventories.find((i) => i.branchId === user.branchId);
    return inv?.quantity ?? 0;
  };

  const startEdit = (variantId: number, currentQty: number) => {
    setEditingVariantId(variantId);
    setEditQuantity(String(currentQty));
    setSuccessMsg(null);
  };

  const cancelEdit = () => {
    setEditingVariantId(null);
    setEditQuantity("");
  };

  const saveInventory = async (variantId: number) => {
    const qty = Number(editQuantity);
    if (!Number.isFinite(qty) || qty < 0) {
      setError("Số lượng không hợp lệ.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await managerDashboardApi.updateInventory(variantId, qty);
      setEditingVariantId(null);
      setSuccessMsg("Cập nhật tồn kho thành công!");
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchProducts();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Cập nhật tồn kho thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Sản phẩm chi nhánh
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Xem danh sách sản phẩm và quản lý tồn kho chi nhánh của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProducts}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition font-medium"
            value={searchTerm}
            onChange={(e) => {
              setPage(0);
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest shrink-0">
          {products.length} Sản phẩm
        </p>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-3">
          <Save className="w-5 h-5" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Sản phẩm
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Danh mục
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Giá bán
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tồn kho CN
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6">
                      <div className="h-10 bg-slate-100 rounded-xl w-48" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-6 bg-slate-100 rounded-lg w-24" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-6 bg-slate-100 rounded-lg w-32" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-6 bg-slate-100 rounded-lg w-16" />
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-10 bg-slate-100 rounded-xl ml-auto w-24" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">
                      Không tìm thấy sản phẩm nào
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const variant = p.variants?.[0];
                  const variantId = variant?.id;
                  const branchQty = getBranchQuantity(p);
                  const isEditing = editingVariantId === variantId;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
                            <img
                              src={getPrimaryImage(p)}
                              className="w-full h-full object-contain"
                              alt=""
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[200px]">
                              {p.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">
                              {p.brandName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-black text-blue-600 text-lg tracking-tighter">
                          {formatCurrency(variant?.price)}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-20 px-3 py-2 border border-blue-300 rounded-xl font-bold outline-none focus:border-blue-600 bg-blue-50"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && variantId) {
                                  void saveInventory(variantId);
                                }
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => variantId && saveInventory(variantId)}
                              disabled={isSaving}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition"
                              title="Lưu"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                branchQty > 5 ? "bg-green-500" : "bg-red-500"
                              } animate-pulse`}
                            />
                            <span className="font-bold text-slate-900">
                              {branchQty}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/manager/products/${p.id}`}
                            className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition shadow-sm bg-white"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        {!isEditing && variantId && (
                          <button
                            type="button"
                            onClick={() => startEdit(variantId, branchQty)}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm bg-white"
                            title="Sửa tồn kho"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">
            Trang <span className="text-slate-900">{page + 1}</span> /{" "}
            {Math.max(totalPages, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((c) => c - 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 transition shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((c) => c + 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 transition shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
