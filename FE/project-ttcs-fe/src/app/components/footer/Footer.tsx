import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold tracking-tighter">VPH STORE</h3>
            <p className="text-sm leading-relaxed opacity-70">
              Hệ thống bán lẻ laptop uy tín hàng đầu Việt Nam. Cam kết chất lượng dịch vụ tốt nhất.
            </p>
            <div className="flex gap-4 pt-2">
              <FaFacebook className="w-5 h-5 cursor-pointer hover:text-blue-500 transition" />
              <FaInstagram className="w-5 h-5 cursor-pointer hover:text-pink-500 transition" />
              <FaTwitter className="w-5 h-5 cursor-pointer hover:text-sky-400 transition" />
              <FaYoutube className="w-5 h-5 cursor-pointer hover:text-red-500 transition" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Sản phẩm</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition">Laptop Gaming</a></li>
              <li><a href="#" className="hover:text-white transition">Laptop Văn phòng</a></li>
              <li><a href="#" className="hover:text-white transition">MacBook</a></li>
              <li><a href="#" className="hover:text-white transition">Linh kiện & Phụ kiện</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-white transition">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-white transition">Liên hệ: 1900 xxxx</a></li>
              <li><a href="#" className="hover:text-white transition">Hệ thống cửa hàng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Liên hệ</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>contact@vphstore.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs opacity-50">
          © {new Date().getFullYear()} VPH STORE - Build by Vũ, Phúc, Hưng. All rights reserved.
        </div>
      </div>
    </footer>
  );
}