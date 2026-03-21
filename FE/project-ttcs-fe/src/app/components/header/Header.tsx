
import Link from "next/link";

const nav_links = ["SYSTEMS", "COMPONENTS", "SUPPORT"] as const;

export const Header = () => {
  return (
    <header className="w-full px-10 py-5 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-100 z-10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1 text-lg font-semibold tracking-tight">
        <span className="text-[#00bcd4] font-light">HOME</span>
        <span className="text-slate-800 font-black tracking-widest uppercase ml-1">
          VPH STORE
        </span>
        
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-10">
        {nav_links.map((item) => (
          <Link
            key={item}
            href="#"
            className="text-xs font-bold tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
          >
            {item}
          </Link>
        ))}
      </nav>
    </header>
  );
}