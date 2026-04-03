export const Footer = () => {
  return (
    <footer className="bg-white p-[32px] rounded-[16px] border">
      <div className="grid grid-cols-4 gap-[24px] mb-[24px]">

        <div>
          <h3 className="font-bold mb-[8px]">TechPremium</h3>
          <p className="text-[14px] text-gray-500">Premium laptop store</p>
        </div>

        <div>
          <p className="font-bold mb-[8px] text-[14px]">SHOP</p>
          <p className="text-[14px] text-gray-500">Laptops</p>
          <p className="text-[14px] text-gray-500">Accessories</p>
        </div>

        <div>
          <p className="font-bold mb-[8px] text-[14px]">SUPPORT</p>
          <p className="text-[14px] text-gray-500">Warranty</p>
          <p className="text-[14px] text-gray-500">Contact</p>
        </div>

        <div>
          <p className="font-bold mb-[8px] text-[14px]">NEWSLETTER</p>
          <input className="border p-[8px] rounded w-full mb-[8px] text-[14px]" placeholder="Email" />
          <button className="bg-blue-600 text-white px-[12px] py-[8px] rounded w-full">
            Subscribe
          </button>
        </div>

      </div>

      <p className="text-center text-[12px] text-gray-400">
        © 2026 TechPremium
      </p>
    </footer>
  );
}
 