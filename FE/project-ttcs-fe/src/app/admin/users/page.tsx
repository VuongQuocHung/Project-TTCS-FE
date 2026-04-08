"use client";

import React, { useEffect, useState } from "react";
import { userApi } from "@/lib/api-endpoints";
import { User } from "@/types/api";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { ApiError } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getAll({ 
        page, 
        size: 10, 
        fullName: searchTerm || undefined 
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-2 font-medium">Xem danh sách khách hàng và thành viên quản trị.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center shadow-sm">
        <Search className="ml-4 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên người dùng..." 
          className="flex-1 px-4 py-3 outline-none font-medium text-slate-600 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-12 bg-slate-100 rounded-2xl w-48" /></td>
                    <td className="px-6 py-6"><div className="h-12 bg-slate-100 rounded-xl w-32" /></td>
                    <td className="px-6 py-6"><div className="h-8 bg-slate-100 rounded-lg w-20" /></td>
                    <td className="px-6 py-6"><div className="h-8 bg-slate-100 rounded-lg w-24" /></td>
                    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl ml-auto w-10" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                          {u.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 uppercase font-black tracking-widest">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="font-medium">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-medium">{u.phone || "---"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        u.role?.name === "ROLE_ADMIN" || u.role?.name === "ADMIN" 
                          ? "bg-purple-50 text-purple-700 border-purple-100" 
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        <Shield className="w-3 h-3" />
                        {u.role?.name === "ROLE_ADMIN" || u.role?.name === "ADMIN" ? "Quản trị" : "Khách hàng"}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "---"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition">
                         <MoreVertical className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400 tracking-tight">
            Trang <span className="text-slate-900">{page + 1}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
