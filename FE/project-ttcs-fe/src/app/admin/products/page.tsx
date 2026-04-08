"use client";

import React, { useEffect, useState } from "react";
import { productApi, categoryApi, brandApi, fileApi } from "@/lib/api-endpoints";
import { Product, Category, Brand, ProductImage, ProductSpecification } from "@/types/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Filter,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  UploadCloud,
  Loader2
} from "lucide-react";
import { ApiError } from "@/lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productApi.getAll({ 
        page, 
        size: 10, 
        name: searchTerm || undefined 
      });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        categoryApi.getAll({ size: 100 }),
        brandApi.getAll({ size: 100 })
      ]);
      setCategories(catRes.content || []);
      setBrands(brandRes.content || []);
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      alert(apiError?.message || "Xóa thất bại");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setImageUrl("");
    setIsModalOpen(true);
  };
  
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImageUrl(product.images?.[0]?.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Vui lòng chỉ tải lên tệp tin hình ảnh!");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fileApi.upload(file);
      setImageUrl(res.url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Tải ảnh thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                e.preventDefault();
                handleFileUpload(file);
                return;
            }
        }
    }
    // If not a file, it might be a text URL.
    // We let the default behavior happen (it will be pasted into the input).
    // But we need to update our state if the user pastes a URL.
    // We'll handle this via the onChange of the input.
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const productData: Partial<Product> = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      importPrice: Number(formData.get("importPrice")),
      stock: Number(formData.get("stock")),
      description: formData.get("description") as string,
      brand: { id: Number(formData.get("brandId")) },
      category: { id: Number(formData.get("categoryId")) },
      specification: {
        cpu: formData.get("cpu") as string,
        ram: formData.get("ram") as string,
        storage: formData.get("storage") as string,
        vga: formData.get("vga") as string,
        screen: formData.get("screen") as string,
      } as ProductSpecification,
      images: editingProduct?.images || [{ imageUrl: imageUrl || (formData.get("imageUrl") as string), isPrimary: true }]
    };

    try {
      if (editingProduct?.id) {
        await productApi.update(editingProduct.id, productData as Product);
      } else {
        await productApi.create(productData as Product);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      alert(apiError?.message || "Lưu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Quản lý sản phẩm</h1>
          <p className="text-slate-500 mt-2 font-medium">Danh sách các sản phẩm Laptop hiện có trong hệ thống.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          THÊM SẢN PHẨM MỚI
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:bg-slate-100 transition">
            <Filter className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest hidden md:block">
            {products.length} Sản phẩm
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá bán</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tồn kho</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl w-48" /></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-lg w-24" /></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-lg w-32" /></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-lg w-16" /></td>
                    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl ml-auto w-24" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Không tìm thấy sản phẩm nào</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
                          <img 
                            src={p.images?.[0]?.imageUrl || "/assets/images/loq.jpg"} 
                            className="w-full h-full object-contain" 
                            alt="" 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">
                            {p.brand?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        {p.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-black text-blue-600 text-lg tracking-tighter">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${Number(p.stock) > 5 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="font-bold text-slate-900">{p.stock}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm bg-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => p.id && handleDelete(p.id)}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm bg-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">
            Trang <span className="text-slate-900">{page + 1}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:grayscale transition shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:grayscale transition shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <p className="text-slate-400 text-sm font-medium">Nhập thông tin sản phẩm và lưu lại để cập nhật hệ thống.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cơ bản */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-4 mb-4">Thông tin cơ bản</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tên sản phẩm</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Danh mục</label>
                      <select name="categoryId" defaultValue={editingProduct?.category?.id} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Thương hiệu</label>
                      <select name="brandId" defaultValue={editingProduct?.brand?.id} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition">
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Giá bán (VND)</label>
                      <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Số lượng tồn</label>
                      <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 ml-1">Hình ảnh sản phẩm</label>
                      {isUploading && (
                        <div className="flex items-center gap-2 text-blue-600 text-xs font-black animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          ĐANG TẢI LÊN...
                        </div>
                      )}
                    </div>
                    
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className={`relative group border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden ${
                        isUploading ? 'border-blue-400 bg-blue-50/30' : 
                        imageUrl ? 'border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      {imageUrl ? (
                        <div className="relative aspect-video flex items-center justify-center p-4">
                          <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl shadow-lg" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleFileUpload(file);
                                };
                                input.click();
                              }}
                              className="p-3 bg-white rounded-2xl text-blue-600 hover:scale-110 transition shadow-xl"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setImageUrl("")}
                              className="p-3 bg-white rounded-2xl text-red-500 hover:scale-110 transition shadow-xl"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(file);
                            };
                            input.click();
                          }}
                          className="w-full py-12 flex flex-col items-center justify-center gap-4"
                        >
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-black text-slate-900">Kéo thả hoặc dán ảnh vào đây</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Hỗ trợ JPG, PNG, GIF hoặc dán URL</p>
                          </div>
                        </button>
                      )}
                    </div>

                    <input 
                      name="imageUrl" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="Hoặc dán URL hình ảnh tại đây..." 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition text-sm" 
                    />
                  </div>
                </div>

                {/* Thông số & Mô tả */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-4 mb-4">Thông số kỹ thuật</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">CPU</label>
                      <input name="cpu" defaultValue={editingProduct?.specification?.cpu} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">RAM</label>
                      <input name="ram" defaultValue={editingProduct?.specification?.ram} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Ổ cứng</label>
                      <input name="storage" defaultValue={editingProduct?.specification?.storage} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Card màn hình</label>
                      <input name="vga" defaultValue={editingProduct?.specification?.vga} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Màn hình</label>
                    <input name="screen" defaultValue={editingProduct?.specification?.screen} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Mô tả ngắn</label>
                    <textarea name="description" defaultValue={editingProduct?.description} rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition resize-none"></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 border-2 border-slate-200 rounded-3xl font-black text-slate-400 hover:bg-slate-50 transition"
                >
                  HỦY BỎ
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-blue-600 text-white px-8 py-5 rounded-3xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "ĐANG XỬ LÝ..." : (editingProduct ? "CẬP NHẬT SẢN PHẨM" : "THÊM SẢN PHẨM")}
                  {!isSubmitting && <Check className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
