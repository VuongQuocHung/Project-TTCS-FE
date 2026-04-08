"use client";

import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Camera, 
  Calendar,
  Phone,
  MapPin,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

function ProfileContent() {
  const { user } = useAuth();

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-[800px] mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-slate-600 transition">
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>

        <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter">Thông tin cá nhân</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* PROFILE CARD */}
          <div className="md:col-span-4">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden group">
                <div className="w-24 h-24 bg-blue-50 rounded-3xl mx-auto mb-6 flex items-center justify-center text-blue-600 relative z-10">
                   <User className="w-12 h-12" />
                   <button className="absolute bottom-[-4px] right-[-4px] bg-slate-900 p-2 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4" />
                   </button>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter break-words px-2">{user?.fullName || "Người dùng VPH"}</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">{user?.email}</p>
                
                <div className="mt-8 pt-8 border-t border-slate-50 space-y-3">
                   <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" />
                      Đã xác thực
                   </div>
                </div>
                
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full translate-x-12 translate-y-[-12px]" />
             </div>
          </div>

          {/* DETAILS */}
          <div className="md:col-span-8 space-y-6">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-slate-900 tracking-tighter">Chi tiết tài khoản</h2>
                    <div className="flex items-center gap-4">
                      <Link href="/user/change-password" title="Đổi mật khẩu" className="text-blue-600 p-2 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Settings className="w-4 h-4" />
                      </Link>
                      <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">Chỉnh sửa</button>
                    </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email
                         </p>
                         <p className="text-sm font-bold text-slate-900">{user?.email || "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Số điện thoại
                         </p>
                         <p className="text-sm font-bold text-slate-900">09xx xxx xxx</p>
                      </div>
                   </div>

                   <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <MapPin className="w-3 h-3" /> Địa chỉ giao hàng mặc định
                      </p>
                      <p className="text-sm font-bold text-slate-900">Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Ngày tham gia
                         </p>
                         <p className="text-sm font-bold text-slate-900">07/04/2026</p>
                      </div>
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Vai trò
                         </p>
                         <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Premium Member</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 group overflow-hidden relative">
                <div className="flex items-center justify-between relative z-10">
                   <div>
                      <h3 className="text-xl font-black tracking-tighter mb-2">Đơn hàng của bạn</h3>
                      <p className="text-slate-400 text-sm">Kiểm tra lịch sử mua hàng và cập nhật trạng thái đơn hàng.</p>
                   </div>
                   <Link href="/user/orders" className="bg-blue-600 p-3 rounded-2xl hover:bg-white hover:text-blue-600 transition-all shadow-lg group-hover:scale-110">
                      <ChevronRight className="w-6 h-6" />
                   </Link>
                </div>
                {/* Decorative */}
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
