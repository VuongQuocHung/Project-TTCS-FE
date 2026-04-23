"use client";

import React, { useEffect, useState } from "react";
import { categoryApi } from "@/lib/api-endpoints";
import { Category } from "@/types/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag, 
  X, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { ApiError } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getAll({ size: 100 });
      setCategories(res.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await categoryApi.delete(id);
      fetchCategories();
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
      description: formData.get("description") as string,
    };

    try {
      if (editingCategory?.id) {
        await categoryApi.update(editingCategory.id, data);
      } else {
        await categoryApi.create(data);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || "Lưu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Danh mục sản phẩm</h1>
          <p className="text-slate-500 mt-2 font-medium">Quản lý cách phân loại sản phẩm trong hệ thống.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          THÊM DANH MỤC
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center shadow-sm">
        <Search className="ml-4 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm danh mục..." 
          className="flex-1 px-4 py-3 outline-none font-medium text-slate-600 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-48 rounded-3xl border border-slate-100 animate-pulse" />
          ))
        ) : filteredCategories.map((c) => (
          <div key={c.id} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-blue-600 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-white transition-colors tracking-tighter uppercase">{c.name}</h3>
              <p className="text-slate-400 text-sm font-medium line-clamp-2 group-hover:text-blue-100 transition-colors">{c.description || "Không có mô tả cho danh mục này."}</p>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2 group-hover:border-white/10 transition-colors">
                <button 
                  onClick={() => { setEditingCategory(c); setIsModalOpen(true); }}
                  className="px-4 py-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-black tracking-widest uppercase transition group-hover:bg-white/10 group-hover:text-white group-hover:hover:bg-white/20"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => c.id && handleDelete(c.id)}
                  className="px-4 py-2 text-slate-300 hover:text-red-500 rounded-xl text-xs font-black tracking-widest uppercase transition group-hover:text-blue-200 group-hover:hover:text-white"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">
                {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tên danh mục</label>
                <input name="name" defaultValue={editingCategory?.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả</label>
                <textarea name="description" defaultValue={editingCategory?.description} rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 resize-none" />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition disabled:opacity-70"
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu danh mục"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
