export const Navbar = () => {
  return (
    <>
      <nav className="bg-white border-b h-14 flex items-center px-8 gap-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center" />
          <span className="font-semibold text-[14px]">VPH STORE</span>
        </div>

        <a href="#" className="text-[14px] text-gray-500 hover:text-black">Danh mục</a>

        <div className="flex-1 max-w-[320px] ml-auto flex items-center gap-2 bg-gray-50 border rounded-lg px-3 h-9">
          <input className="bg-transparent outline-none text-[14px] w-full" placeholder="Search..." />
        </div>

        <div className="flex gap-4">
          <div className="cursor-pointer">🛒</div>
          <div className="cursor-pointer">👤</div>
        </div>
      </nav>
    </>
  )
}