"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { profileApi } from "@/lib/api-endpoints";
import type { UpdateProfileRequest } from "@/types/api";
import type { ApiError } from "@/lib/api";

function ProfileContent() {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      fullName: user?.fullName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
    });
  }, [user?.fullName, user?.phoneNumber, user?.address]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await profileApi.updateProfile(formData);
      await refreshProfile();
      setMessage("Thông tin cá nhân đã được cập nhật.");
      setIsEditing(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[860px] mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>

        <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter">
          Thông tin cá nhân
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl mx-auto mb-6 flex items-center justify-center text-blue-600 relative z-10">
                <User className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter break-words px-2">
                {user?.fullName || user?.username || "Người dùng"}
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-1 break-all">
                {user?.email || "Chưa có email"}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  {user?.enabled === false ? "Tạm khóa" : "Đang hoạt động"}
                </div>
              </div>

              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full translate-x-12 translate-y-[-12px]" />
            </div>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tighter">
                    Chi tiết tài khoản
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Dữ liệu đang được lấy trực tiếp từ `GET /api/v1/me/profile`.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/user/change-password"
                    title="Đổi mật khẩu"
                    className="text-blue-600 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm text-sm font-bold"
                  >
                    Đổi mật khẩu
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing((current) => !current);
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-slate-900 text-xs font-black uppercase tracking-widest hover:underline"
                  >
                    {isEditing ? "Đóng" : "Chỉnh sửa"}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-all">
                      {user?.email || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Vai trò
                    </p>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                      {user?.role || "CUSTOMER"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <User className="w-3 h-3" /> Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.fullName || ""}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber || ""}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          phoneNumber: event.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Địa chỉ
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address || ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition resize-none disabled:opacity-70"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Username
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user?.username || "---"}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Branch ID
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {user?.branchId ?? "Chưa gán chi nhánh"}
                    </p>
                  </div>
                </div>

                {error ? (
                  <div className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    {error}
                  </div>
                ) : null}
                {message ? (
                  <div className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                    {message}
                  </div>
                ) : null}

                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 ring-8 ring-blue-50 disabled:opacity-70 disabled:ring-0"
                  >
                    {isSaving ? "Đang cập nhật..." : "Lưu thay đổi"}
                    {!isSaving ? <Check className="w-5 h-5" /> : null}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 group overflow-hidden relative">
              <div className="flex items-center justify-between relative z-10 gap-4">
                <div>
                  <h3 className="text-xl font-black tracking-tighter mb-2">
                    Đơn hàng của bạn
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Kiểm tra lịch sử mua hàng và trạng thái xử lý theo dữ liệu thật
                    từ `GET /api/v1/me/orders`.
                  </p>
                </div>
                <Link
                  href="/user/orders"
                  className="bg-blue-600 p-3 rounded-2xl hover:bg-white hover:text-blue-600 transition-all shadow-lg group-hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </div>
              <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
