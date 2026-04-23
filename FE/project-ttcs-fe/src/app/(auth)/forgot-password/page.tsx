"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api-endpoints";
import { type ApiError } from "@/lib/api";
import { 
  ArrowLeft, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] -ml-96 -mb-96" />
      
      <div className="max-w-xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Link 
          href="/user/login" 
          className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-10 hover:text-blue-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại đăng nhập
        </Link>
        
        <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden">
          <div className="p-12">
            {success ? (
              <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100 ring-8 ring-green-50">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Kiểm tra email!</h1>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    Nếu email <strong>{email}</strong> tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới hòm thư của bạn.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Bạn chưa nhận được mail?</p>
                   <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => setSuccess(false)}
                        className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black hover:bg-blue-600 transition shadow-xl shadow-slate-200"
                      >
                         THỬ LẠI
                      </button>
                      <Link 
                        href="/user/login"
                        className="flex-1 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-3xl font-black hover:bg-slate-50 transition"
                      >
                         ĐĂNG NHẬP
                      </Link>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Quên mật khẩu?</h1>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản bằng email.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Địa chỉ email</label>
                    <div className="relative group">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                       <input 
                         id="email" 
                         type="email" 
                         required 
                         placeholder="example@gmail.com"
                         className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-100 transition font-bold"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         disabled={isLoading}
                       />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-3xl text-sm font-bold text-red-600 animate-in shake-in duration-300">
                       <ArrowRight className="w-5 h-5 shrink-0 rotate-180" />
                       {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 ring-8 ring-blue-50 group disabled:opacity-70 disabled:grayscale"
                  >
                    {isLoading ? "ĐANG GỬI..." : "GỬI LIÊN KẾT ĐẶT LẠI"}
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

        <p className="mt-10 text-center text-slate-400 font-bold text-sm">
          © 2026 VPH STORE - Build with passion
        </p>
      </div>
    </div>
  );
}
