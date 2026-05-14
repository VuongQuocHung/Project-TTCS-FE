"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Building2,
  Image as ImageIcon,
  Package,
  Tag,
  Ticket,
  UserRound,
} from "lucide-react";
import {
  brandApi,
  branchApi,
  categoryApi,
  productApi,
  userApi,
  voucherApi,
} from "@/lib/api-endpoints";
import { resolveApiAssetUrl } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import type { Brand, Branch, Category, Product, User, Voucher } from "@/types/api";
import {
  formatCurrency,
  formatVoucherDate,
  formatVoucherValue,
  getDiscountTypeLabel,
  getPrimaryImage,
  getVoucherStatusClasses,
  getVoucherStatusLabel,
  getVoucherUsageText,
} from "@/lib/format";

type DetailMode = "admin" | "manager";

function useDetail<T>(fetcher: (id: number) => Promise<T>, fallbackError: string) {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setData(await fetcher(Number(id)));
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.message || fallbackError);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [fallbackError, fetcher, id]);

  return { data, isLoading, error };
}

function DetailShell({
  title,
  subtitle,
  backHref,
  icon,
  isLoading,
  error,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  icon: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  if (isLoading) {
    return <div className="rounded-3xl bg-white p-10 font-bold text-slate-500">Đang tải chi tiết...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-1 font-medium text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      {children}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="break-words text-sm font-bold text-slate-800">{value || "---"}</div>
    </div>
  );
}

export function ProductDetailPageContent({ mode }: { mode: DetailMode }) {
  const fetcher = mode === "admin" ? productApi.getAdminById : productApi.getById;
  const backHref = mode === "admin" ? "/admin/products" : "/manager/products";
  const { data: product, isLoading, error } = useDetail<Product>(fetcher, "Không thể tải chi tiết sản phẩm.");
  const variant = product?.variants?.[0];
  const images = variant?.images || [];
  const specs = variant?.specsJson ? Object.entries(variant.specsJson) : [];

  return (
    <DetailShell
      title={product?.name || "Chi tiết sản phẩm"}
      subtitle={product ? `ID: ${product.id || "---"} | ${product.brandName || "Chưa có thương hiệu"}` : undefined}
      backHref={backHref}
      icon={<Package className="h-6 w-6" />}
      isLoading={isLoading}
      error={error || (!product && !isLoading ? "Không tìm thấy sản phẩm." : null)}
    >
      {product ? (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <InfoCard title="Hình ảnh">
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-slate-50 p-6">
              <img src={getPrimaryImage(product)} alt={product.name || ""} className="max-h-full max-w-full object-contain" />
            </div>
            {images.length > 0 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div key={`${image.id}-${image.imageUrl}`} className="aspect-square rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    <img src={resolveApiAssetUrl(image.imageUrl)} alt={`Ảnh ${index + 1}`} className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            ) : null}
          </InfoCard>

          <div className="space-y-6">
            <InfoCard title="Thông tin chung">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên sản phẩm" value={product.name} />
                <Field
                  label="Danh mục"
                  value={
                    product.categoryId ? (
                      <Link className="text-blue-600 hover:underline" href={`/${mode}/categories/${product.categoryId}`}>
                        {product.categoryName || `Danh mục #${product.categoryId}`}
                      </Link>
                    ) : (
                      product.categoryName
                    )
                  }
                />
                <Field
                  label="Thương hiệu"
                  value={
                    product.brandId ? (
                      <Link className="text-blue-600 hover:underline" href={`/${mode}/brands/${product.brandId}`}>
                        {product.brandName || `Thương hiệu #${product.brandId}`}
                      </Link>
                    ) : (
                      product.brandName
                    )
                  }
                />
                <Field label="SKU" value={variant?.sku} />
                <Field label="Giá bán" value={formatCurrency(variant?.price)} />
                <Field label="Tổng tồn kho" value={variant?.quantity ?? 0} />
              </div>
            </InfoCard>

            <InfoCard title="Tồn kho theo chi nhánh">
              <div className="grid gap-3 md:grid-cols-2">
                {(variant?.inventories || []).map((inventory) => (
                  <Field
                    key={`${inventory.branchId}-${inventory.branchName}`}
                    label={inventory.branchName || `Chi nhánh #${inventory.branchId}`}
                    value={
                      mode === "admin" && inventory.branchId ? (
                        <Link className="text-blue-600 hover:underline" href={`/admin/branches/${inventory.branchId}`}>
                          {inventory.quantity ?? 0} sản phẩm
                        </Link>
                      ) : (
                        `${inventory.quantity ?? 0} sản phẩm`
                      )
                    }
                  />
                ))}
                {(variant?.inventories || []).length === 0 ? <Field label="Tồn kho" value="Chưa có dữ liệu" /> : null}
              </div>
            </InfoCard>

            <InfoCard title="Thông số kỹ thuật">
              <div className="grid gap-3 md:grid-cols-2">
                {specs.map(([key, value]) => (
                  <Field key={key} label={key} value={String(value)} />
                ))}
                {specs.length === 0 ? <Field label="Thông số" value="Chưa có dữ liệu" /> : null}
              </div>
            </InfoCard>

            <InfoCard title="Mô tả">
              <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-600">
                {product.description || "Chưa có mô tả."}
              </p>
            </InfoCard>
          </div>
        </div>
      ) : null}
    </DetailShell>
  );
}

export function UserDetailPageContent({ mode }: { mode: DetailMode }) {
  const fetcher = mode === "admin" ? userApi.getById : userApi.getManagerById;
  const backHref = mode === "admin" ? "/admin/users" : "/manager";
  const { data: user, isLoading, error } = useDetail<User>(fetcher, "Không thể tải chi tiết người dùng.");

  return (
    <DetailShell
      title={user?.fullName || user?.username || "Chi tiết người dùng"}
      subtitle={user ? `ID: ${user.id || "---"} | ${user.role || "CUSTOMER"}` : undefined}
      backHref={backHref}
      icon={<UserRound className="h-6 w-6" />}
      isLoading={isLoading}
      error={error || (!user && !isLoading ? "Không tìm thấy người dùng." : null)}
    >
      {user ? (
        <InfoCard title="Thông tin tài khoản">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Username" value={user.username} />
            <Field label="Họ tên" value={user.fullName} />
            <Field label="Email" value={user.email} />
            <Field label="Số điện thoại" value={user.phoneNumber} />
            <Field label="Vai trò" value={user.role} />
            <Field label="Trạng thái" value={user.enabled === false ? "Đã vô hiệu hóa" : "Đang hoạt động"} />
            <Field label="Chi nhánh" value={user.branchId ? `Chi nhánh #${user.branchId}` : "Chưa gán"} />
            <Field label="Ngày tạo" value={user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : "---"} />
            <Field label="Cập nhật" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString("vi-VN") : "---"} />
            <div className="md:col-span-2 xl:col-span-3">
              <Field label="Địa chỉ" value={user.address} />
            </div>
          </div>
        </InfoCard>
      ) : null}
    </DetailShell>
  );
}

export function CategoryDetailPageContent({ mode }: { mode: DetailMode }) {
  const fetcher = mode === "admin" ? categoryApi.getAdminById : categoryApi.getManagerById;
  const backHref = mode === "admin" ? "/admin/categories" : "/manager";
  const { data: category, isLoading, error } = useDetail<Category>(fetcher, "Không thể tải chi tiết danh mục.");

  return (
    <DetailShell
      title={category?.name || "Chi tiết danh mục"}
      subtitle={category ? `ID: ${category.id || "---"}` : undefined}
      backHref={backHref}
      icon={<Tag className="h-6 w-6" />}
      isLoading={isLoading}
      error={error || (!category && !isLoading ? "Không tìm thấy danh mục." : null)}
    >
      {category ? (
        <InfoCard title="Thông tin danh mục">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên danh mục" value={category.name} />
            <Field label="ID" value={category.id} />
            <div className="md:col-span-2">
              <Field label="Mô tả" value={category.description || "Chưa có mô tả."} />
            </div>
          </div>
        </InfoCard>
      ) : null}
    </DetailShell>
  );
}

export function BrandDetailPageContent({ mode }: { mode: DetailMode }) {
  const fetcher = mode === "admin" ? brandApi.getAdminById : brandApi.getManagerById;
  const backHref = mode === "admin" ? "/admin/brands" : "/manager";
  const { data: brand, isLoading, error } = useDetail<Brand>(fetcher, "Không thể tải chi tiết thương hiệu.");

  return (
    <DetailShell
      title={brand?.name || "Chi tiết thương hiệu"}
      subtitle={brand ? `ID: ${brand.id || "---"}` : undefined}
      backHref={backHref}
      icon={<Award className="h-6 w-6" />}
      isLoading={isLoading}
      error={error || (!brand && !isLoading ? "Không tìm thấy thương hiệu." : null)}
    >
      {brand ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <InfoCard title="Logo">
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-slate-50 p-8">
              {brand.logo ? (
                <img src={resolveApiAssetUrl(brand.logo)} alt={brand.name || ""} className="max-h-full max-w-full object-contain" />
              ) : (
                <ImageIcon className="h-16 w-16 text-slate-200" />
              )}
            </div>
          </InfoCard>
          <InfoCard title="Thông tin thương hiệu">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên thương hiệu" value={brand.name} />
              <Field label="Logo URL" value={brand.logo} />
              <div className="md:col-span-2">
                <Field label="Mô tả" value={brand.description || "Chưa có mô tả."} />
              </div>
            </div>
          </InfoCard>
        </div>
      ) : null}
    </DetailShell>
  );
}

export function VoucherDetailPageContent({ mode }: { mode: DetailMode }) {
  const fetcher = mode === "admin" ? voucherApi.getAdminById : voucherApi.getManagerById;
  const backHref = mode === "admin" ? "/admin/vouchers" : "/manager/vouchers";
  const { data: voucher, isLoading, error } = useDetail<Voucher>(fetcher, "Không thể tải chi tiết voucher.");

  return (
    <DetailShell
      title={voucher?.code || "Chi tiết voucher"}
      subtitle={voucher ? `ID: ${voucher.id || "---"} | ${getDiscountTypeLabel(voucher.discountType)}` : undefined}
      backHref={backHref}
      icon={<Ticket className="h-6 w-6" />}
      isLoading={isLoading}
      error={error || (!voucher && !isLoading ? "Không tìm thấy voucher." : null)}
    >
      {voucher ? (
        <InfoCard title="Thông tin voucher">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Mã voucher" value={voucher.code} />
            <Field label="Giá trị giảm" value={formatVoucherValue(voucher)} />
            <Field label="Loại giảm" value={getDiscountTypeLabel(voucher.discountType)} />
            <Field label="Đơn tối thiểu" value={voucher.minOrderValue ? formatCurrency(voucher.minOrderValue) : "Không có"} />
            <Field label="Giảm tối đa" value={voucher.maxDiscountValue ? formatCurrency(voucher.maxDiscountValue) : "Không có"} />
            <Field label="Lượt dùng" value={getVoucherUsageText(voucher)} />
            <Field label="Ngày bắt đầu" value={formatVoucherDate(voucher.startDate)} />
            <Field label="Ngày kết thúc" value={formatVoucherDate(voucher.endDate)} />
            <Field
              label="Trạng thái"
              value={
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${getVoucherStatusClasses(voucher.status)}`}>
                  {getVoucherStatusLabel(voucher.status)}
                </span>
              }
            />
            <Field
              label="Người nhận riêng"
              value={
                voucher.targetUserId ? (
                  <Link className="text-blue-600 hover:underline" href={`/${mode}/users/${voucher.targetUserId}`}>
                    User #{voucher.targetUserId}
                  </Link>
                ) : (
                  "Dùng chung"
                )
              }
            />
          </div>
        </InfoCard>
      ) : null}
    </DetailShell>
  );
}

export function BranchDetailPageContent() {
  const { data: branch, isLoading, error } = useDetail<Branch>(branchApi.getAdminById, "Không thể tải chi tiết chi nhánh.");

  return (
    <DetailShell
      title={branch?.name || "Chi tiết chi nhánh"}
      subtitle={branch ? `ID: ${branch.id || "---"}` : undefined}
      backHref="/admin/branches"
      icon={<Building2 className="h-6 w-6" />}
      isLoading={isLoading}
      error={error || (!branch && !isLoading ? "Không tìm thấy chi nhánh." : null)}
    >
      {branch ? (
        <InfoCard title="Thông tin chi nhánh">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên chi nhánh" value={branch.name} />
            <Field label="Số điện thoại" value={branch.phone} />
            <div className="md:col-span-2">
              <Field label="Địa chỉ" value={branch.address} />
            </div>
          </div>
        </InfoCard>
      ) : null}
    </DetailShell>
  );
}
