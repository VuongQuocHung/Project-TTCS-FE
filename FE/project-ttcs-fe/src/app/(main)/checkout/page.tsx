"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  Ticket,
  User,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { branchApi, orderApi, voucherApi } from "@/lib/api-endpoints";
import type { ApiError } from "@/lib/api";
import type { BranchFulfillment, PaymentMethod, Voucher } from "@/types/api";
import { calculateVoucherDiscount, formatCurrency, formatVoucherValue } from "@/lib/format";

function CheckoutForm() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [branches, setBranches] = useState<BranchFulfillment[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [paymentMethod] = useState<PaymentMethod>("COD");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderItems = useMemo(
    () =>
      cart
        .filter((item) => item.variantId && item.quantity)
        .map((item) => ({
          variantId: item.variantId as number,
          quantity: item.quantity as number,
        })),
    [cart]
  );

  const voucherDiscount = useMemo(
    () => calculateVoucherDiscount(appliedVoucher, totalPrice),
    [appliedVoucher, totalPrice]
  );
  const finalTotal = Math.max(totalPrice - voucherDiscount, 0);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await voucherApi.getMine();
        setMyVouchers(response);
      } catch {
        setMyVouchers([]);
      }
    };

    void fetchVouchers();
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("voucher");
    if (code) setVoucherCode(code);
  }, []);

  useEffect(() => {
    if (orderItems.length === 0) {
      setBranches([]);
      setSelectedBranchId(null);
      return;
    }

    const fetchBranches = async () => {
      setIsLoadingBranches(true);
      setError(null);

      try {
        const availability = await branchApi.checkAvailability({ items: orderItems });
        setBranches(availability);

        const preferredBranch =
          availability.find((branch) => branch.branchId === user?.branchId) ||
          availability.find((branch) => branch.status === "FULLY_AVAILABLE") ||
          availability.find((branch) => branch.status === "PARTIALLY_AVAILABLE") ||
          availability[0];

        setSelectedBranchId(preferredBranch?.branchId ?? null);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.message || "Không thể tải danh sách chi nhánh.");
      } finally {
        setIsLoadingBranches(false);
      }
    };

    void fetchBranches();
  }, [orderItems, user?.branchId]);

  const selectedBranch = branches.find((branch) => branch.branchId === selectedBranchId);

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setAppliedVoucher(null);
      setVoucherMessage("Vui lòng nhập mã voucher.");
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherMessage(null);

    try {
      const voucher = await voucherApi.validate(code, totalPrice);
      if (voucher.status && voucher.status !== "ACTIVE") {
        setAppliedVoucher(null);
        setVoucherMessage("Voucher này hiện không còn hoạt động.");
        return;
      }
      if (voucher.minOrderValue && totalPrice < voucher.minOrderValue) {
        setAppliedVoucher(null);
        setVoucherMessage(`Đơn hàng cần tối thiểu ${formatCurrency(voucher.minOrderValue)}.`);
        return;
      }

      setVoucherCode(voucher.code || code);
      setAppliedVoucher(voucher);
      setVoucherMessage("Đã áp dụng voucher.");
    } catch (err) {
      const apiError = err as ApiError;
      setAppliedVoucher(null);
      setVoucherMessage(apiError?.message || "Voucher không hợp lệ.");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0 || !selectedBranchId) {
      setError("Vui lòng chọn chi nhánh khả dụng trước khi đặt hàng.");
      return;
    }

    if (selectedBranch?.status === "UNAVAILABLE") {
      setError("Chi nhánh này hiện không đủ hàng cho giỏ hiện tại.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await orderApi.create({
        branchId: selectedBranchId,
        items: orderItems,
        paymentMethod,
        voucherCode: voucherCode.trim() || undefined,
      });
      await clearCart();
      setIsSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100 ring-8 ring-green-50">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
          Đặt hàng thành công!
        </h1>
        <p className="text-slate-500 mb-10 max-w-sm leading-relaxed">
          Đơn hàng đã được tạo theo đúng payload của backend. Bạn có thể theo dõi
          trạng thái trong lịch sử đơn hàng của mình.
        </p>
        <div className="flex gap-4">
          <Link
            href="/user/orders"
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition"
          >
            THEO DÕI ĐƠN HÀNG
          </Link>
          <Link
            href="/"
            className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition"
          >
            QUAY LẠI TRANG CHỦ
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tighter">
          Giỏ hàng đang trống
        </h1>
        <Link href="/" className="text-blue-600 font-bold hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter">
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tighter">
                <User className="w-6 h-6 text-blue-600" />
                Thông tin tài khoản
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <User className="w-3 h-3" /> Họ và tên
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {user?.fullName || user?.username || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm font-bold text-slate-900 break-all">
                    {user?.email || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Phone className="w-3 h-3" /> Số điện thoại
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {user?.phoneNumber || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3" /> Địa chỉ
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {user?.address || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <Link
                href="/user/profile"
                className="inline-flex items-center gap-2 text-blue-600 font-bold mt-6 hover:underline"
              >
                Cập nhật hồ sơ trước khi đặt hàng
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tighter">
                <Store className="w-6 h-6 text-blue-600" />
                Chọn chi nhánh xử lý đơn
              </h2>

              {isLoadingBranches ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {branches.map((branch) => {
                    const branchId = branch.branchId ?? branch.id;
                    const selected = branchId === selectedBranchId;
                    const disabled = branch.status === "UNAVAILABLE";

                    return (
                      <button
                        key={branchId}
                        type="button"
                        onClick={() => !disabled && setSelectedBranchId(branchId ?? null)}
                        className={`w-full text-left p-5 rounded-2xl border transition ${
                          selected
                            ? "border-blue-600 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-blue-200"
                        } ${disabled ? "opacity-60" : ""}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-black text-slate-900">
                              {branch.branchName || branch.name}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {branch.address || "Chưa có địa chỉ"}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {branch.phone || "Chưa có số điện thoại"}
                            </p>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-2">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${
                                branch.status === "FULLY_AVAILABLE"
                                  ? "bg-green-50 text-green-700 border-green-100"
                                  : branch.status === "PARTIALLY_AVAILABLE"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                  : "bg-red-50 text-red-700 border-red-100"
                              }`}
                            >
                              {branch.status === "FULLY_AVAILABLE"
                                ? "Đủ hàng"
                                : branch.status === "PARTIALLY_AVAILABLE"
                                ? "Có thể xử lý một phần"
                                : "Không khả dụng"}
                            </span>
                            <p className="text-xs text-slate-400 font-medium">
                              {branch.items?.filter((item) => item.isAvailable).length || 0}/
                              {branch.items?.length || 0} biến thể đáp ứng
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tighter">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Voucher và thanh toán
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Mã giảm giá
                  </label>
                  {myVouchers.length > 0 ? (
                    <select
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(event.target.value);
                        setAppliedVoucher(null);
                        setVoucherMessage(null);
                      }}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600"
                    >
                      <option value="">Chọn voucher của bạn</option>
                      {myVouchers.map((voucher) => (
                        <option key={voucher.id || voucher.code} value={voucher.code}>
                          {voucher.code} - {formatVoucherValue(voucher)}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(event.target.value);
                        setAppliedVoucher(null);
                        setVoucherMessage(null);
                      }}
                      placeholder="Nhập voucher nếu có"
                      className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher}
                      className="px-5 py-3.5 bg-blue-600 text-white rounded-2xl font-black disabled:opacity-60"
                    >
                      {isApplyingVoucher ? "Đang áp..." : "Áp mã"}
                    </button>
                  </div>

                  {voucherMessage ? (
                    <p
                      className={`text-sm font-bold ${
                        appliedVoucher ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {voucherMessage}
                    </p>
                  ) : null}

                  {appliedVoucher ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      Giảm dự kiến {formatCurrency(voucherDiscount)}
                    </div>
                  ) : null}
                </div>

                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
                  <h3 className="text-slate-900 font-black text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Phương thức thanh toán
                  </h3>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border-2 border-blue-600 shadow-sm">
                    <div className="w-4 h-4 rounded-full border-4 border-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    Payload đặt hàng hiện hỗ trợ branchId, items, voucherCode và paymentMethod
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-32">
              <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tighter">
                Chi tiết đơn hàng
              </h2>

              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-400">
                        SKU: {item.variantSku || "---"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {formatCurrency((item.snapshotPrice || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 py-8 border-t border-slate-100">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính ({totalItems} sản phẩm):</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Voucher:</span>
                  <span className="font-bold text-slate-900">
                    {appliedVoucher?.code || "Chưa áp dụng"}
                  </span>
                </div>
                {voucherDiscount > 0 ? (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Giảm giá:</span>
                    <span className="font-bold">-{formatCurrency(voucherDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Chi nhánh chọn:</span>
                  <span className="font-bold text-slate-900">
                    {selectedBranch?.branchName || selectedBranch?.name || "Chưa chọn"}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-end mb-10">
                <span className="text-slate-900 font-black">TỔNG CỘNG:</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              {error ? (
                <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                onClick={handleSubmit}
                disabled={isLoading || isLoadingBranches || !selectedBranchId}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 ring-8 ring-blue-50 group disabled:opacity-70 disabled:grayscale disabled:ring-0"
              >
                {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                {!isLoading ? (
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                ) : null}
              </button>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-4 grayscale opacity-50">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Giỏ hàng và tổng tiền đang bám theo `CartDTO` từ backend,
                  dùng `snapshotPrice` cho đơn hiện tại.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}
