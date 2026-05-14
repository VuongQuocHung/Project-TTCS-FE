"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { productApi, categoryApi, brandApi, branchApi, fileApi } from "@/lib/api-endpoints";
import { Product, Category, Brand, Branch, Inventory } from "@/types/api";
import { getPrimaryImage } from "@/lib/format";
import { normalizeAssetUrl, resolveApiAssetUrl } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Filter,
  X,
  Check,
  AlertCircle,
  UploadCloud,
  Loader2,
  Eye,
} from "lucide-react";
import { ApiError } from "@/lib/api";

type StockMode = "all" | "custom";
type SpecRow = {
  id: string;
  key: string;
  value: string;
};

const SPEC_KEY_OPTIONS = ["color", "cpu", "ram", "storage", "vga", "screen", "os", "battery", "weight"];

const safeInputValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return String(value);
};

const createSpecRow = (key = "", value = ""): SpecRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  key,
  value,
});

const specsToRows = (specs?: Record<string, unknown> | null, fallbackColor?: unknown): SpecRow[] => {
  const entries = specs ? Object.entries(specs) : [];
  const rows = entries
    .filter(([key, value]) => key.trim() && value !== undefined && value !== null && safeInputValue(value).trim())
    .map(([key, value]) => createSpecRow(key, safeInputValue(value)));

  const hasColorSpec = entries.some(([key]) => key.trim().toLowerCase() === "color");
  const colorValue = safeInputValue(fallbackColor).trim();

  if (!hasColorSpec && colorValue) {
    rows.unshift(createSpecRow("color", colorValue));
  }

  return rows;
};

const rowsToSpecsJson = (rows: SpecRow[]): Record<string, string> => {
  return rows.reduce<Record<string, string>>((result, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (key && value) {
      result[key] = value;
    }

    return result;
  }, {});
};

const normalizeImageUrls = (urls: Array<string | undefined | null>): string[] => {
  return urls
    .map((url) => normalizeAssetUrl(safeInputValue(url).trim()))
    .filter(Boolean);
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [stockMode, setStockMode] = useState<StockMode>("all");
  const [allBranchStock, setAllBranchStock] = useState("0");
  const [branchStocks, setBranchStocks] = useState<Record<number, string>>({});
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productApi.getAllAdmin({ 
        page, 
        size: 10, 
        keyword: searchTerm || undefined 
      });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err: unknown) {
      console.error("Failed to fetch products:", err);
      const apiError = err as ApiError;
      setError(apiError?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes, branchRes] = await Promise.all([
        categoryApi.getAll({ size: 100 }),
        brandApi.getAll({ size: 100 }),
        branchApi.getAllAdmin()
      ]);
      setCategories(catRes.content || []);
      setBrands(brandRes.content || []);
      setBranches(branchRes || []);
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
    setImageUrls([]);
    setImageUrlInput("");
    setStockMode("all");
    setAllBranchStock("0");
    setBranchStocks({});
    setSpecRows([]);
    setIsModalOpen(true);
  };
  
  const openEditModal = (product: Product) => {
    const inventories = product.variants?.[0]?.inventories || [];
    const nextBranchStocks = Object.fromEntries(
      inventories
        .filter((inventory) => inventory.branchId)
        .map((inventory) => [inventory.branchId as number, String(inventory.quantity ?? 0)])
    );
    const quantities = inventories.map((inventory) => inventory.quantity ?? 0);
    const allBranchesHaveSameStock =
      branches.length > 0 &&
      inventories.length === branches.length &&
      quantities.length > 0 &&
      quantities.every((quantity) => quantity === quantities[0]);

    setEditingProduct(product);
    setImageUrls(normalizeImageUrls((product.variants?.[0]?.images || []).map((image) => image.imageUrl)));
    setImageUrlInput("");
    setStockMode(allBranchesHaveSameStock ? "all" : "custom");
    setAllBranchStock(safeInputValue(getAllBranchStockDefault(product)));
    setBranchStocks(nextBranchStocks);
    setSpecRows(specsToRows(product.variants?.[0]?.specsJson, product.variants?.[0]?.color));
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
      const nextUrl = normalizeAssetUrl(res.url);
      setImageUrls((current) => (nextUrl && !current.includes(nextUrl) ? [...current, nextUrl] : current));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Tải ảnh thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const allFiles = Array.from(files);
    const imageFiles = allFiles.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("Vui lòng chỉ tải lên tệp tin hình ảnh!");
      return;
    }

    if (imageFiles.length !== allFiles.length) {
      alert("Một số tệp không phải hình ảnh đã được bỏ qua.");
    }

    setIsUploading(true);
    try {
      const uploaded = await fileApi.uploadMany(imageFiles);
      setImageUrls((current) => {
        const existing = new Set(current);
        const nextUrls = normalizeImageUrls(uploaded.map((res) => res.url)).filter((url) => !existing.has(url));
        return [...current, ...nextUrls];
      });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Tải ảnh thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    const urls = normalizeImageUrls(
      imageUrlInput
        .split(/[\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean)
    );

    if (urls.length === 0) return;

    setImageUrls((current) => {
      const existing = new Set(current);
      return [...current, ...urls.filter((url) => !existing.has(url))];
    });
    setImageUrlInput("");
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const setPrimaryImage = (index: number) => {
    setImageUrls((current) => {
      const selected = current[index];
      if (!selected) return current;
      return [selected, ...current.filter((_, currentIndex) => currentIndex !== index)];
    });
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
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFilesUpload(files);
    }
  };

  const updateBranchStock = (branchId: number, quantity: string) => {
    setBranchStocks((current) => ({
      ...current,
      [branchId]: quantity,
    }));
  };

  const buildInventories = (stockQuantity: number): Inventory[] => {
    if (stockMode === "all") {
      return branches.map((branch) => ({
        branchId: branch.id,
        branchName: branch.name,
        quantity: stockQuantity,
      }));
    }

    return Object.entries(branchStocks)
      .map(([branchId, quantity]) => ({
        branchId: Number(branchId),
        branchName: branches.find((branch) => branch.id === Number(branchId))?.name,
        quantity: Number(quantity),
      }))
      .filter((inventory) => inventory.branchId && Number.isFinite(inventory.quantity) && inventory.quantity >= 0);
  };

  const addSpecRow = () => {
    setSpecRows((current) => [...current, createSpecRow()]);
  };

  const updateSpecRow = (id: string, field: "key" | "value", value: string) => {
    setSpecRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeSpecRow = (id: string) => {
    setSpecRows((current) => current.filter((row) => row.id !== id));
  };

  function getAllBranchStockDefault(product: Product | null = editingProduct): number {
    const inventories = product?.variants?.[0]?.inventories || [];
    if (inventories.length > 0) {
      const firstQuantity = inventories[0]?.quantity ?? 0;
      const allSame = inventories.every((inventory) => (inventory.quantity ?? 0) === firstQuantity);
      if (allSame) return firstQuantity;
    }
    return product?.variants?.[0]?.quantity ?? 0;
  }

  const customStockTotal = Object.values(branchStocks).reduce((sum, quantity) => {
    const parsed = Number(quantity);
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const selectedCategory = categories.find((category) => String(category.id) === String(formData.get("categoryId")));
    const selectedBrand = brands.find((brand) => String(brand.id) === String(formData.get("brandId")));
    const currentVariant = editingProduct?.variants?.[0];
    const sku = String(formData.get("sku") || "").trim();
    const stockQuantity = Number(formData.get("stock"));
    const inventories = buildInventories(stockQuantity);

    if (branches.length > 0 && inventories.length === 0) {
      alert("Vui lòng chọn ít nhất một chi nhánh tồn kho.");
      setIsSubmitting(false);
      return;
    }

    const specsJson = rowsToSpecsJson(specRows);
    const submittedImageUrls = normalizeImageUrls([...imageUrls, imageUrlInput]).filter(
      (url, index, urls) => urls.indexOf(url) === index
    );
    const variant = {
      ...(currentVariant || {}),
      sku: sku || currentVariant?.sku || `SP-${Date.now()}`,
      price: Number(formData.get("price")),
      color: safeInputValue(specsJson.color),
      quantity: inventories.reduce((sum, inventory) => sum + (inventory.quantity || 0), 0),
      inventories,
      specsJson,
      images: submittedImageUrls.map((url) => ({ imageUrl: normalizeAssetUrl(url) })),
    };
    const productData: Product = {
      ...editingProduct,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      categoryId: selectedCategory?.id,
      categoryName: selectedCategory?.name ?? editingProduct?.categoryName,
      brandId: selectedBrand?.id,
      brandName: selectedBrand?.name ?? editingProduct?.brandName,
      variants: [variant],
    };

    try {
      if (editingProduct?.id) {
        await productApi.update(editingProduct.id, productData);
      } else {
        await productApi.create(productData);
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

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
                            src={getPrimaryImage(p)} 
                            className="w-full h-full object-contain" 
                            alt="" 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">
                            {p.brandName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-black text-blue-600 text-lg tracking-tighter">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.variants?.[0]?.price || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${Number(p.variants?.[0]?.quantity) > 5 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="font-bold text-slate-900">{p.variants?.[0]?.quantity || 0}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition shadow-sm bg-white"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
                    <input name="name" defaultValue={safeInputValue(editingProduct?.name)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Danh mục</label>
                      <select name="categoryId" defaultValue={safeInputValue(editingProduct?.categoryId || categories.find(c => c.name === editingProduct?.categoryName)?.id)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition">
                        <option value="">Chọn danh mục</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Thương hiệu</label>
                      <select name="brandId" defaultValue={safeInputValue(editingProduct?.brandId || brands.find(b => b.name === editingProduct?.brandName)?.id)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition">
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">SKU</label>
                      <input name="sku" defaultValue={safeInputValue(editingProduct?.variants?.[0]?.sku)} placeholder="VD: LAPTOP-001" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Giá bán (VND)</label>
                      <input name="price" type="number" defaultValue={safeInputValue(editingProduct?.variants?.[0]?.price)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-bold text-slate-700 ml-1">Tồn kho theo chi nhánh</label>
                      <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setStockMode("all")}
                          className={`px-3 py-2 rounded-xl transition ${stockMode === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                        >
                          Toàn bộ
                        </button>
                        <button
                          type="button"
                          onClick={() => setStockMode("custom")}
                          className={`px-3 py-2 rounded-xl transition ${stockMode === "custom" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                        >
                          Chọn riêng
                        </button>
                      </div>
                    </div>

                    {stockMode === "all" ? (
                      <div className="space-y-2">
                        <input
                          key="all-stock-input"
                          name="stock"
                          type="number"
                          min={0}
                          value={allBranchStock}
                          onChange={(event) => setAllBranchStock(event.target.value)}
                          required
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition"
                        />
                        <p className="text-xs font-medium text-slate-400">
                          Số lượng này sẽ được áp dụng cho tất cả {branches.length} chi nhánh.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                        <input key="custom-stock-total" type="hidden" name="stock" value={customStockTotal} readOnly />
                        {branches.length === 0 ? (
                          <p className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                            Chưa có chi nhánh để chọn.
                          </p>
                        ) : (
                          branches.map((branch) => (
                            <div key={branch.id} className="grid grid-cols-[1fr_130px] gap-3 items-center bg-slate-50 border border-slate-100 rounded-2xl p-3">
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">{branch.name}</p>
                                <p className="text-xs text-slate-400 truncate">{branch.address || "Chưa có địa chỉ"}</p>
                              </div>
                              <input
                                type="number"
                                min={0}
                                value={branch.id ? safeInputValue(branchStocks[branch.id]) : ""}
                                onChange={(event) => branch.id && updateBranchStock(branch.id, event.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600 transition"
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
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
                        imageUrls.length > 0 ? 'border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      {imageUrls.length > 0 ? (
                        <div className="relative aspect-video flex items-center justify-center p-4">
                          <img src={resolveApiAssetUrl(imageUrls[0])} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl shadow-lg" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.multiple = true;
                                input.onchange = (e) => {
                                  const files = (e.target as HTMLInputElement).files;
                                  if (files?.length) handleFilesUpload(files);
                                };
                                input.click();
                              }}
                              className="p-3 bg-white rounded-2xl text-blue-600 hover:scale-110 transition shadow-xl"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setImageUrls([])}
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
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files?.length) handleFilesUpload(files);
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
                      value={safeInputValue(imageUrlInput)}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onBlur={(e) => setImageUrlInput(normalizeAssetUrl(e.target.value))}
                      onPaste={handlePaste}
                      placeholder="Hoặc dán URL hình ảnh tại đây..." 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition text-sm" 
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="w-full px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition"
                    >
                      Thêm URL ảnh vào danh sách
                    </button>

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {imageUrls.map((url, index) => (
                          <div key={`${url}-${index}`} className="relative group aspect-square rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden">
                            <img src={resolveApiAssetUrl(url)} alt={`Preview ${index + 1}`} className="w-full h-full object-contain rounded-xl" />
                            <div className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-slate-700 shadow-sm">
                              {index === 0 ? "Ảnh đại diện" : `#${index + 1}`}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(index)}
                                  className="px-3 py-2 bg-white rounded-xl text-xs font-black text-blue-600 hover:scale-105 transition shadow-xl"
                                >
                                  Đặt đại diện
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImageUrl(index)}
                                className="p-2 bg-white rounded-xl text-red-500 hover:scale-105 transition shadow-xl"
                                aria-label="Xóa ảnh"
                                title="Xóa ảnh"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông số & Mô tả */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-4">Thông số kỹ thuật</h3>
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="w-11 h-11 shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                      aria-label="Thêm thông số kỹ thuật"
                      title="Thêm thông số kỹ thuật"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <datalist id="spec-key-options">
                    {SPEC_KEY_OPTIONS.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <div className="space-y-3">
                    {specRows.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-3xl px-5 py-8 text-center">
                        <p className="text-sm font-bold text-slate-400">
                          Bấm dấu cộng để thêm thông số kỹ thuật cho sản phẩm.
                        </p>
                      </div>
                    ) : (
                      specRows.map((row, index) => (
                        <div key={row.id} className="grid grid-cols-[1fr_1fr_44px] gap-3 items-end">
                          <div className="space-y-2 min-w-0">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                              Thông số {index + 1}
                            </label>
                            <input
                              value={row.key}
                              onChange={(event) => updateSpecRow(row.id, "key", event.target.value)}
                              list="spec-key-options"
                              placeholder="VD: cpu"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div className="space-y-2 min-w-0">
                            <label className="text-sm font-bold text-slate-700 ml-1">Giá trị</label>
                            <input
                              value={row.value}
                              onChange={(event) => updateSpecRow(row.id, "value", event.target.value)}
                              placeholder="VD: Intel Core i5"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSpecRow(row.id)}
                            className="w-11 h-11 rounded-2xl text-slate-400 bg-slate-50 border border-slate-200 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition flex items-center justify-center"
                            aria-label="Xóa thông số"
                            title="Xóa thông số"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Mô tả ngắn</label>
                    <textarea name="description" defaultValue={safeInputValue(editingProduct?.description)} rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition resize-none"></textarea>
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
