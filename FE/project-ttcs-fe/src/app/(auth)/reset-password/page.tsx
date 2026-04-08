"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api-endpoints";
import { type ApiError } from "@/lib/api";
import { 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Key,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Đặt lại mật khẩu thất bại. Liên kết có thể đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-red-100 text-center space-y-6 max-w-lg w-full">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Liên kết không hợp lệ</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Chúng tôi không tìm thấy mã xác thực trong đường dẫn này. Vui lòng kiểm tra lại email hoặc yêu cầu mã mới.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-3xl font-black hover:bg-blue-600 transition shadow-xl shadow-slate-200"
        >
          YÊU CẦU MÃ MỚI
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden max-w-xl w-full">
      <div className="p-12">
        {success ? (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100 ring-8 ring-green-50">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Thành công!</h1>
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
            </div>

            <button
              onClick={() => router.push("/user/login")}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black hover:bg-slate-900 transition shadow-2xl shadow-blue-100"
            >
              ĐĂNG NHẬP NGAY
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Key className="w-7 h-7" />
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Đặt lại mật khẩu</h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn. Hãy đảm bảo mật khẩu đủ mạnh để bảo mật.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="password" 
                    required 
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-100 transition font-bold"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="password" 
                    required 
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-100 transition font-bold"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-3xl text-sm font-bold text-red-600">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 ring-8 ring-blue-50 group disabled:opacity-70 disabled:grayscale"
              >
                {isLoading ? "ĐANG XỬ LÝ..." : "ĐẶT LẠI MẬT KHẨU"}
                {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="flex items-center justify-center gap-3 grayscale opacity-30">
               <ShieldCheck className="w-6 h-6 text-blue-600" />
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-tight">
                 Bảo mật thông tin <br/> Tuyệt đối 100%
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] -ml-96 -mb-96" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <Link 
          href="/user/login" 
          className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-10 hover:text-blue-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại đăng nhập
        </Link>

        <Suspense fallback={
          <div className="flex flex-col items-center p-20 bg-white rounded-[40px] shadow-xl border border-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
            <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Đang khởi tạo...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p className="mt-10 text-center text-slate-400 font-bold text-sm">
          © 2026 VPH STORE - Secure Authentication
        </p>
      </div>
    </div>
  );
}
