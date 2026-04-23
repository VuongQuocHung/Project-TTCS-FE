"use client";

import React, { useEffect, useState } from "react";
import { brandApi } from "@/lib/api-endpoints";
import { Brand } from "@/types/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Award, 
  X, 
  Check, 
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { ApiError } from "@/lib/api";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await brandApi.getAll({ size: 100 });
      setBrands(res.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa thương hiệu này?")) return;
    try {
      await brandApi.delete(id);
      fetchBrands();
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      logoUrl: formData.get("logoUrl") as string,
    };

    try {
      if (editingBrand?.id) {
        await brandApi.update(editingBrand.id, data);
      } else {
        await brandApi.create(data);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      alert(err?.message || "Lưu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Thương hiệu</h1>
          <p className="text-slate-500 mt-2 font-medium">Quản lý các hãng Laptop đối tác.</p>
        </div>
        <button 
          onClick={() => { setEditingBrand(null); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition shadow-xl shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          THÊM THƯƠNG HIỆU
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center shadow-sm">
        <Search className="ml-4 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm thương hiệu..." 
          className="flex-1 px-4 py-3 outline-none font-medium text-slate-600 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-40 rounded-3xl border border-slate-100 animate-pulse" />
          ))
        ) : filteredBrands.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 p-3 group-hover:bg-blue-50 transition-colors">
              {b.logoUrl ? (
                <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain" />
              ) : (
                <Award className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tighter text-center uppercase">{b.name}</h3>
            
            <div className="flex items-center gap-2 w-full pt-4 border-t border-slate-50">
              <button 
                onClick={() => { setEditingBrand(b); setIsModalOpen(true); }}
                className="flex-1 py-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-black tracking-widest uppercase transition"
              >
                Sửa
              </button>
              <button 
                onClick={() => b.id && handleDelete(b.id)}
                className="flex-1 py-2 text-slate-300 hover:text-red-500 rounded-xl text-xs font-black tracking-widest uppercase transition"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">
                {editingBrand ? "Cập nhật hãng" : "Thêm hãng mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tên thương hiệu</label>
                <input name="name" defaultValue={editingBrand?.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Logo URL</label>
                <div className="relative">
                   <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input name="logoUrl" defaultValue={editingBrand?.logoUrl} placeholder="https://..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-600" />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-100 hover:bg-blue-600 transition disabled:opacity-70"
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu thương hiệu"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
