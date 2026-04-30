"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Ticket } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { voucherApi } from "@/lib/api-endpoints";
import type { ApiError } from "@/lib/api";
import type { Voucher } from "@/types/api";
import {
  formatCurrency,
  formatVoucherDate,
  formatVoucherValue,
  getVoucherUsageText,
} from "@/lib/format";

function UserVouchersContent() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await voucherApi.getMine();
        setVouchers(response);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.message || "Không thể tải voucher của bạn.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVouchers();
  }, []);

  const handleCopy = async (code?: string) => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Voucher của tôi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Chọn một mã phù hợp rồi dùng ở bước thanh toán.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Đang tải voucher...
          </div>
        ) : vouchers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <Ticket className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900">Bạn chưa có voucher</h2>
            <p className="mt-2 text-sm text-slate-500">
              Khi có mã giảm giá mới, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {vouchers.map((voucher) => (
              <div key={voucher.id || voucher.code} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Mã voucher</p>
                    <h2 className="mt-1 text-2xl font-bold text-blue-600">{voucher.code}</h2>
                  </div>
                  <div className="rounded-xl bg-blue-50 px-4 py-2 text-lg font-bold text-blue-600">
                    {formatVoucherValue(voucher)}
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>Đơn tối thiểu: {voucher.minOrderValue ? formatCurrency(voucher.minOrderValue) : "Không có"}</p>
                  <p>Hạn dùng: {formatVoucherDate(voucher.endDate)}</p>
                  <p>Lượt dùng: {getVoucherUsageText(voucher)}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(voucher.code)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedCode === voucher.code ? "Đã copy" : "Copy mã"}
                  </button>
                  <Link
                    href={`/checkout?voucher=${encodeURIComponent(voucher.code || "")}`}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
                  >
                    Dùng ở thanh toán
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserVouchersPage() {
  return (
    <ProtectedRoute>
      <UserVouchersContent />
    </ProtectedRoute>
  );
}
