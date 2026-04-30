"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Plus, Ticket, Trash2, X } from "lucide-react";
import { voucherApi } from "@/lib/api-endpoints";
import type { ApiError } from "@/lib/api";
import type { DiscountType, Voucher, VoucherStatus } from "@/types/api";
import {
  formatCurrency,
  formatVoucherDate,
  formatVoucherValue,
  getDiscountTypeLabel,
  getVoucherStatusClasses,
  getVoucherStatusLabel,
  getVoucherUsageText,
} from "@/lib/format";

const PAGE_SIZE = 10;
const DISCOUNT_TYPES: DiscountType[] = ["PERCENTAGE", "FIXED_AMOUNT"];
const VOUCHER_STATUSES: VoucherStatus[] = ["ACTIVE", "INACTIVE", "EXPIRED", "EXHAUSTED"];

const emptyVoucher: Voucher = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  minOrderValue: undefined,
  maxDiscountValue: undefined,
  startDate: "",
  endDate: "",
  usageLimit: undefined,
  status: "ACTIVE",
  targetUserId: null,
};

function toInputDate(value?: string) {
  return value ? value.slice(0, 16) : "";
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (!value || String(value).trim() === "") return undefined;
  return Number(value);
}

function optionalUserId(value: FormDataEntryValue | null) {
  if (!value || String(value).trim() === "") return null;
  return Number(value);
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await voucherApi.getAllAdmin({ page, size: PAGE_SIZE });
      setVouchers(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải danh sách voucher.");
      setVouchers([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchVouchers();
  }, [fetchVouchers]);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa voucher này?")) return;

    try {
      await voucherApi.delete(id);
      await fetchVouchers();
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError?.message || "Xóa voucher thất bại.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const data: Voucher = {
      code: String(formData.get("code") || "").trim().toUpperCase(),
      discountType: String(formData.get("discountType")) as DiscountType,
      discountValue: Number(formData.get("discountValue") || 0),
      minOrderValue: optionalNumber(formData.get("minOrderValue")),
      maxDiscountValue: optionalNumber(formData.get("maxDiscountValue")),
      startDate: String(formData.get("startDate") || "") || undefined,
      endDate: String(formData.get("endDate") || "") || undefined,
      usageLimit: optionalNumber(formData.get("usageLimit")),
      status: String(formData.get("status")) as VoucherStatus,
      targetUserId: optionalUserId(formData.get("targetUserId")),
    };

    try {
      if (editingVoucher?.id) {
        await voucherApi.update(editingVoucher.id, data);
      } else {
        await voucherApi.create(data);
      }
      setIsModalOpen(false);
      await fetchVouchers();
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError?.message || "Lưu voucher thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const formVoucher = editingVoucher || emptyVoucher;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Voucher</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý mã giảm giá trong hệ thống.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          <Plus className="h-5 w-5" />
          Thêm voucher
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Mã</th>
                <th className="px-5 py-4">Giảm giá</th>
                <th className="px-5 py-4">Đơn tối thiểu</th>
                <th className="px-5 py-4">Thời hạn</th>
                <th className="px-5 py-4">Lượt dùng</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    Đang tải voucher...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    Chưa có voucher nào.
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        {voucher.code}
                      </div>
                      {voucher.targetUserId ? (
                        <p className="mt-1 text-xs text-slate-400">User #{voucher.targetUserId}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{formatVoucherValue(voucher)}</p>
                      <p className="text-xs text-slate-400">
                        {getDiscountTypeLabel(voucher.discountType)}
                        {voucher.maxDiscountValue
                          ? `, tối đa ${formatCurrency(voucher.maxDiscountValue)}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {voucher.minOrderValue ? formatCurrency(voucher.minOrderValue) : "Không có"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatVoucherDate(voucher.startDate)} - {formatVoucherDate(voucher.endDate)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{getVoucherUsageText(voucher)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getVoucherStatusClasses(
                          voucher.status
                        )}`}
                      >
                        {getVoucherStatusLabel(voucher.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(voucher)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600"
                          title="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => voucher.id && handleDelete(voucher.id)}
                          className="rounded-lg border border-slate-200 p-2 text-red-500"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-xl font-bold text-slate-900">
                {editingVoucher ? "Sửa voucher" : "Thêm voucher"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Mã voucher</span>
                <input
                  name="code"
                  required
                  defaultValue={formVoucher.code}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Loại giảm</span>
                <select
                  name="discountType"
                  defaultValue={formVoucher.discountType}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  {DISCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getDiscountTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Giá trị giảm</span>
                <input
                  name="discountValue"
                  type="number"
                  min="0"
                  required
                  defaultValue={formVoucher.discountValue}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Đơn tối thiểu</span>
                <input
                  name="minOrderValue"
                  type="number"
                  min="0"
                  defaultValue={formVoucher.minOrderValue}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Giảm tối đa</span>
                <input
                  name="maxDiscountValue"
                  type="number"
                  min="0"
                  defaultValue={formVoucher.maxDiscountValue}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Giới hạn lượt dùng</span>
                <input
                  name="usageLimit"
                  type="number"
                  min="0"
                  defaultValue={formVoucher.usageLimit}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Ngày bắt đầu</span>
                <input
                  name="startDate"
                  type="datetime-local"
                  defaultValue={toInputDate(formVoucher.startDate)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Ngày kết thúc</span>
                <input
                  name="endDate"
                  type="datetime-local"
                  defaultValue={toInputDate(formVoucher.endDate)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">Trạng thái</span>
                <select
                  name="status"
                  defaultValue={formVoucher.status}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  {VOUCHER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getVoucherStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-600">User ID nhận riêng</span>
                <input
                  name="targetUserId"
                  type="number"
                  min="1"
                  defaultValue={formVoucher.targetUserId ?? ""}
                  placeholder="Bỏ trống nếu dùng chung"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : "Lưu voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
