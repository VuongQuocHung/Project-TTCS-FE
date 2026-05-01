"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  Building2,
  Edit3,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { branchApi, orderApi } from "@/lib/api-endpoints";
import { formatCurrency } from "@/lib/format";
import type { ApiError } from "@/lib/api";
import type { Branch, Order } from "@/types/api";

interface BranchStats {
  totalOrders: number;
  totalRevenue: number;
  deliveredOrders: number;
  pendingOrders: number;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStatsMap, setBranchStatsMap] = useState<Record<number, BranchStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await branchApi.getAllAdmin();
      setBranches(data || []);
      // Fetch orders statistics for all branches
      await fetchBranchStats(data || []);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải danh sách chi nhánh.");
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBranchStats = async (branchList: Branch[]) => {
    try {
      // Fetch all orders (using large page size to get as many as possible)
      const ordersResponse = await orderApi.getAllAdmin({ size: 1000, page: 0 });
      const allOrders: Order[] = ordersResponse.content || [];

      const statsMap: Record<number, BranchStats> = {};

      for (const branch of branchList) {
        if (branch.id === undefined) continue;
        const branchOrders = allOrders.filter((o) => o.branchId === branch.id);
        statsMap[branch.id] = {
          totalOrders: branchOrders.length,
          totalRevenue: branchOrders
            .filter((o) => o.status === "DELIVERED")
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          deliveredOrders: branchOrders.filter((o) => o.status === "DELIVERED").length,
          pendingOrders: branchOrders.filter(
            (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "SHIPPING"
          ).length,
        };
      }

      setBranchStatsMap(statsMap);
    } catch {
      // Stats are optional, don't block the page
      console.error("Không thể tải thống kê đơn hàng.");
    }
  };

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({ name: "", address: "", phone: "" });
    setShowModal(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || "",
      address: branch.address || "",
      phone: branch.phone || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Tên chi nhánh không được để trống.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const branchData: Branch = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      };

      if (editingBranch?.id) {
        await branchApi.update(editingBranch.id, branchData);
      } else {
        await branchApi.create(branchData);
      }

      setShowModal(false);
      await fetchBranches();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể lưu chi nhánh.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!branch.id) return;
    if (!confirm(`Bạn có chắc muốn xoá chi nhánh "${branch.name}"?`)) return;

    setError(null);
    try {
      await branchApi.delete(branch.id);
      await fetchBranches();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể xoá chi nhánh.");
    }
  };

  // Summary stats
  const totalBranches = branches.length;
  const totalAllOrders = Object.values(branchStatsMap).reduce((s, b) => s + b.totalOrders, 0);
  const totalAllRevenue = Object.values(branchStatsMap).reduce((s, b) => s + b.totalRevenue, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Quản lý chi nhánh
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Danh sách chi nhánh, thống kê doanh thu và số đơn hàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBranches}
            className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-2xl font-bold border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm chi nhánh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-blue-50">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Tổng chi nhánh
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {isLoading ? "---" : totalBranches}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-50">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Tổng đơn hàng
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {isLoading ? "---" : totalAllOrders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-indigo-50">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Tổng doanh thu
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {isLoading ? "---" : formatCurrency(totalAllRevenue)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      ) : null}

      {/* Branch list with stats */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Chi nhánh
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Địa chỉ
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  SĐT
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Đơn hàng
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Doanh thu
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl w-40" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-48" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-28" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-20 mx-auto" /></td>
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-32 ml-auto" /></td>
                    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl w-24 mx-auto" /></td>
                  </tr>
                ))
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Chưa có chi nhánh nào</p>
                  </td>
                </tr>
              ) : (
                branches.map((branch) => {
                  const stats = branch.id !== undefined ? branchStatsMap[branch.id] : undefined;
                  return (
                    <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{branch.name}</p>
                            <p className="text-xs text-slate-400">ID: {branch.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{branch.address || "---"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {branch.phone || "---"}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <p className="text-lg font-black text-slate-900">
                          {stats?.totalOrders ?? 0}
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-green-600">
                            {stats?.deliveredOrders ?? 0} giao
                          </span>
                          <span className="text-[10px] font-bold text-amber-600">
                            {stats?.pendingOrders ?? 0} chờ
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p className="text-lg font-black text-slate-900">
                          {formatCurrency(stats?.totalRevenue ?? 0)}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(branch)}
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition"
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(branch)}
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition"
                            title="Xoá"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">
                {editingBranch ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Tên chi nhánh *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Chi nhánh Hà Nội"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: 123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="VD: 0912345678"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl font-black bg-slate-900 text-white hover:bg-blue-600 transition disabled:opacity-60"
              >
                {isSaving ? "Đang lưu..." : editingBranch ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
