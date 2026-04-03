import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Đăng ký (Khách hàng)",
  description: "Trang đăng ký tài khoản khách hàng...",
}

export default function UserRegisterPage() {
  return (
    <div className="py-[60px]">
      <div className="container">
        <div className="border border-[#DEDEDE] rounded-[8px] overflow-hidden max-w-[900px] mx-auto flex min-h-[520px] shadow-lg">

          {/* Hình ảnh bên trái */}
          <div className="relative hidden md:flex w-[45%] p-[40px]">
            <div className="relative z-10 w-full rounded-[10px] overflow-hidden">
              <img
                src="/images/laptop-1.png"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-white font-[800] text-[28px] leading-tight mb-[10px]">
                  Tạo tài khoản để<br /> nhận ưu đãi hấp dẫn.
                </h2>
                <p className="text-[#00A2FF] font-[500] text-[14px] leading-relaxed">
                  Đăng ký ngay để tích điểm và nhận khuyến mãi.
                </p>
              </div>
            </div>
          </div>

          {/* Form đăng ký */}
          <div className="flex-1 flex flex-col justify-center py-[50px] px-[40px] bg-white">
            <h1 className="font-[700] text-[22px] text-black mb-[4px]">
              Đăng ký
            </h1>
            <p className="text-[13px] text-[#888] mb-[28px]">
              Tạo tài khoản mới để bắt đầu mua sắm.
            </p>

            <form action="" className="grid grid-cols-1 gap-y-[16px]">
              <div>
                <label htmlFor="name" className="block font-[500] text-[13px] text-black mb-[6px]">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-[#DEDEDE] rounded-[6px] px-[12px] py-[10px] text-[14px]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-[500] text-[13px] text-black mb-[6px]">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@gmail.com"
                  className="w-full border border-[#DEDEDE] rounded-[6px] px-[12px] py-[10px] text-[14px]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-[500] text-[13px] text-black mb-[6px]">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="********"
                  className="w-full border border-[#DEDEDE] rounded-[6px] px-[12px] py-[10px] text-[14px]"
                />
              </div>

              <button className="w-full py-[12px] bg-[#1A1A2E] text-white font-[700] rounded-[6px] hover:bg-[#333] transition-all">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
