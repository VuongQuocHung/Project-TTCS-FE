"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";
import { login, writeAuthToken, type ApiError } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi gửi yêu cầu đăng nhập
  const [error, setError] = useState<string | null>(null); // Lỗi khi đăng nhập thất bại
  const [success, setSuccess] = useState<string | null>(null); // Thông báo thành công khi đăng nhập thành công

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const form = event.currentTarget; 
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    login({ email, password })
      .then((res) => {
        writeAuthToken(res.token);
        setSuccess(`Đăng nhập thành công: ${res.fullName}`);
        router.push("/");
      })
      .catch((e: ApiError) => {
        setError(e?.message || "Đăng nhập thất bại");
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <>
      <div className="py-[60px]">
        <div className="container">
          <div className="border border-[#DEDEDE] rounded-[8px] overflow-hidden 
          max-w-[900px] mx-auto flex min-h-[520px] shadow-lg">
            <div className="relative hidden md:flex w-[45%] p-[40px]">
              <div className="relative z-10 w-full rounded-[10px] overflow-hidden">
                <img
                  src="/assets/images/laptop-1.png"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-white font-[800] text-[28px] leading-tight mb-[10px]">
                    Cơ hội sở hữu <br /> chiếc laptop tốt nhất<br /> trong tầm tay.
                  </h2>
                  <p className="text-[#00A2FF] font-[500] text-[14px] leading-relaxed">
                    Đăng nhập để khám phá hàng nghìn<br /> sản phẩm hấp dẫn.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-[50px] px-[40px] bg-white">
              <h1 className="font-[700] text-[22px] text-black mb-[4px]">
                Đăng nhập
              </h1>
              <p className="text-[13px] text-[#888] mb-[28px]">
                Chào mừng khách hàng quay trở lại.
              </p>

              <div className="flex rounded-[6px] border border-[#DEDEDE] overflow-hidden mb-[28px]">
                <button className="flex-1 py-[11px] text-[12px] font-[700] bg-[#1A1A2E] 
                text-white transition-all">
                  Đăng nhập
                </button>
                <div className="flex-1 py-[11px] text-[12px] font-[700] tracking-widest uppercase 
                bg-white text-[#999] hover:bg-slate-50 transition-all">
                  <Link href="/user/register" className="text-[#0088FF] hover:underline items-center justify-center flex gap-[4px]">
                    Đăng ký
                  </Link>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-[16px]">
                <div>
                  <label htmlFor="email" className="block font-[500] text-[13px] text-black mb-[6px]">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    className="w-full h-[46px] border border-[#DEDEDE] rounded-[4px] py-[14px] px-[16px] font-[500] text-[14px] text-black bg-[#FAFAFA] focus:outline-none focus:border-[#0088FF] 
                    focus:ring-2 focus:ring-[#0088FF]/20 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-[6px]">
                    <label htmlFor="password" className="block font-[500] text-[13px] text-black">
                      Mật khẩu *
                    </label>
                    <a href="#" className="text-[12px] text-[#0088FF] hover:underline font-[500]">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full h-[46px] border border-[#DEDEDE] rounded-[4px] py-[14px] px-[16px] font-[500] text-[14px] text-black bg-[#FAFAFA] focus:outline-none focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/20 transition"
                  />
                </div>

                {error ? (
                  <p className="text-[12px] text-red-600 font-[600]">{error}</p>
                ) : null}
                {success ? (
                  <p className="text-[12px] text-green-700 font-[600]">{success}</p>
                ) : null}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#0088FF] hover:bg-[#006FD6] active:bg-[#005BBF] 
                    rounded-[4px] w-full h-[48px] px-[20px] font-[700] text-[15px] 
                    text-white flex items-center justify-center gap-[8px] mt-[4px] disabled:opacity-70"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-[12px] my-[20px]">
                <div className="flex-1 h-px bg-[#EFEFEF]" />
                <span className="text-[11px] font-[600] tracking-widest text-[#BDBDBD] uppercase">
                  Hoặc đăng nhập với
                </span>
                <div className="flex-1 h-px bg-[#EFEFEF]" />
              </div>

              <div className="flex justify-center gap-[10px]">
                <button>
                  <FcGoogle size={30} />
                </button>
                <button>
                  <FaApple size={30} />
                </button>
                <button>
                  <FaFacebook size={30} color="#1877F2" />
                </button>
            
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}