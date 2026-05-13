"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api-endpoints";
import { type ApiError } from "@/lib/api";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

type VerifyStatus = "idle" | "loading" | "success" | "error";

function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    setStatus("loading");
    setMessage(null);

    authApi
      .verifyEmail({ token })
      .then((res) => {
        setStatus("success");
        setMessage(typeof res === "string" && res ? res : "Xác thực thành công.");
      })
      .catch((err: unknown) => {
        const apiError = err as ApiError;
        setStatus("error");
        setMessage(apiError?.message || "Xác thực thất bại. Liên kết có thể đã hết hạn.");
      });
  }, [token]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden max-w-xl w-full">
        <div className="p-12 text-center space-y-6">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-100 ring-8 ring-blue-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Đang xác thực</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Vui lòng chờ trong giây lát. Hệ thống đang kiểm tra liên kết xác nhận của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-white rounded-[40px] shadow-2xl shadow-red-900/10 border border-red-100 overflow-hidden max-w-xl w-full">
        <div className="p-12 text-center space-y-8">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-100 ring-8 ring-red-50">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Liên kết không hợp lệ</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {message || "Liên kết xác thực không còn hợp lệ. Vui lòng đăng ký lại để nhận email mới."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/user/register"
              className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black hover:bg-blue-600 transition shadow-xl shadow-slate-200"
            >
              ĐĂNG KÝ LẠI
            </Link>
            <Link
              href="/user/login"
              className="flex-1 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-3xl font-black hover:bg-slate-50 transition"
            >
              ĐĂNG NHẬP
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden max-w-xl w-full">
      <div className="p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100 ring-8 ring-green-50">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Xác thực thành công!</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            {message || "Email của bạn đã được xác thực. Giờ bạn có thể đăng nhập để mua sắm."}
          </p>
        </div>
        <button
          onClick={() => router.push("/user/login")}
          className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 ring-8 ring-blue-50 group"
        >
          ĐĂNG NHẬP NGAY
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] -ml-96 -mb-96" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[500px] h-[120px] bg-amber-200/40 blur-[100px] rounded-full" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <Link
          href="/user/login"
          className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-10 hover:text-blue-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại đăng nhập
        </Link>

        <Suspense
          fallback={
            <div className="flex flex-col items-center p-20 bg-white rounded-[40px] shadow-xl border border-slate-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6" />
              <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Đang khởi tạo...</p>
            </div>
          }
        >
          <VerifyEmailCard />
        </Suspense>

        <div className="mt-10 flex items-center gap-3 text-slate-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>© 2026 VPH STORE - Secure Authentication</span>
        </div>
      </div>
    </div>
  );
}
