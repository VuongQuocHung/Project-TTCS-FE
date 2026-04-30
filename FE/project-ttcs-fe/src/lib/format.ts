import type { DiscountType, OrderStatus, Product, ProductVariant, Voucher, VoucherStatus } from "@/types/api";
import { resolveApiAssetUrl } from "@/lib/api";

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);
}

export function getPrimaryVariant(product?: Product | null): ProductVariant | undefined {
  return product?.variants?.[0];
}

export function getPrimaryImage(product?: Product | null) {
  return resolveApiAssetUrl(getPrimaryVariant(product)?.images?.[0]?.imageUrl) || "/assets/images/loq.jpg";
}

export function formatSpecValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(formatSpecValue).filter(Boolean).join(", ");
  }
  return "";
}

export function getSpecValue(product: Product | null | undefined, key: string): string {
  return formatSpecValue(getPrimaryVariant(product)?.specsJson?.[key]);
}

export function getOrderStatusLabel(status?: OrderStatus | string) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPING":
      return "Đang giao";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    case "FAILED":
      return "Thất bại";
    default:
      return "Không xác định";
  }
}

export function getOrderStatusClasses(status?: OrderStatus | string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "SHIPPING":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "DELIVERED":
      return "bg-green-50 text-green-700 border-green-100";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";
    case "FAILED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export function getDiscountTypeLabel(type?: DiscountType | string) {
  return type === "PERCENTAGE" ? "Phần trăm" : "Số tiền";
}

export function formatVoucherValue(voucher?: Voucher | null) {
  if (!voucher) return "---";
  if (voucher.discountType === "PERCENTAGE") return `${voucher.discountValue ?? 0}%`;
  return formatCurrency(voucher.discountValue);
}

export function getVoucherStatusLabel(status?: VoucherStatus | string) {
  switch (status) {
    case "ACTIVE":
      return "Đang dùng";
    case "INACTIVE":
      return "Tạm tắt";
    case "EXPIRED":
      return "Hết hạn";
    case "EXHAUSTED":
      return "Hết lượt";
    default:
      return "Không rõ";
  }
}

export function getVoucherStatusClasses(status?: VoucherStatus | string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 border-green-100";
    case "INACTIVE":
      return "bg-slate-50 text-slate-600 border-slate-200";
    case "EXPIRED":
      return "bg-red-50 text-red-700 border-red-100";
    case "EXHAUSTED":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export function formatVoucherDate(value?: string | null) {
  if (!value) return "Không giới hạn";
  return new Date(value).toLocaleDateString("vi-VN");
}

export function getVoucherUsageText(voucher?: Voucher | null) {
  if (!voucher?.usageLimit) return "Không giới hạn";
  return `${voucher.usedCount ?? 0}/${voucher.usageLimit}`;
}

export function calculateVoucherDiscount(voucher: Voucher | null | undefined, total: number) {
  if (!voucher || total <= 0) return 0;

  if (voucher.minOrderValue && total < voucher.minOrderValue) return 0;

  let discount = 0;
  if (voucher.discountType === "PERCENTAGE") {
    discount = total * ((voucher.discountValue ?? 0) / 100);
    if (voucher.maxDiscountValue) discount = Math.min(discount, voucher.maxDiscountValue);
  } else {
    discount = voucher.discountValue ?? 0;
  }

  return Math.min(discount, total);
}
