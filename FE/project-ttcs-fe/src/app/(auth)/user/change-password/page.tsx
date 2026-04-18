"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api-endpoints";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";

function ChangePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.changePassword(formData);
      setIsSuccess(true);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100 ring-8 ring-green-50">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Đã đổi mật khẩu!</h1>
        <p className="text-slate-500 mb-10 max-w-sm leading-relaxed">
          Mật khẩu của bạn đã được cập nhật thành công. Hãy sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo.
        </p>
        <Link 
          href="/user/profile" 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition"
        >
          QUAY LẠI TRANG CÁ NHÂN
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[500px] mx-auto px-6">
        <Link href="/user/profile" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition">
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang cá nhân
        </Link>
        
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center relative z-10 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Đổi mật khẩu</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Bảo mật tài khoản</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-1.5">
              <label htmlFor="oldPassword" tabIndex={-1} className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  id="oldPassword" 
                  type="password" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium" 
                  placeholder="••••••••" 
                  value={formData.oldPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="newPassword" tabIndex={-1} className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu mới</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  id="newPassword" 
                  type="password" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium" 
                  placeholder="••••••••" 
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" tabIndex={-1} className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition font-medium" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 ring-8 ring-blue-50 group disabled:opacity-70 disabled:grayscale disabled:ring-0"
            >
              {isLoading ? "ĐANG XỬ LÝ..." : "CẬP NHẬT MẬT KHẨU"}
              {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Decorative */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-12 translate-y-[-12px]" />
        </div>

        <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">
            Chúng tôi khuyến nghị bạn nên đổi mật khẩu định kỳ 3 - 6 tháng một lần để đảm bảo an toàn tối đa cho tài khoản của mình.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordForm />
    </ProtectedRoute>
  );
}
