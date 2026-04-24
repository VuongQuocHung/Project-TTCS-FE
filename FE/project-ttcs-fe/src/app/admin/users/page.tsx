"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Search,
  Shield,
  User as UserIcon,
  Users,
} from "lucide-react";
import { branchApi, userApi } from "@/lib/api-endpoints";
import { formatCurrency } from "@/lib/format";
import type { Branch, Role, User } from "@/types/api";
import type { ApiError } from "@/lib/api";

const PAGE_SIZE = 10;

const ROLE_OPTIONS: Role[] = ["CUSTOMER", "MANAGER", "ADMIN", "GUEST"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<number, string>>({});
  const [branchDrafts, setBranchDrafts] = useState<Record<number, string>>({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userResponse, branchResponse] = await Promise.all([
        userApi.getAll(),
        branchApi.getAllAdmin(),
      ]);

      setUsers(userResponse);
      setBranches(branchResponse);
      setRoleDrafts(
        Object.fromEntries(
          userResponse.map((user) => [user.id ?? 0, String(user.role || "CUSTOMER")])
        )
      );
      setBranchDrafts(
        Object.fromEntries(
          userResponse.map((user) => [user.id ?? 0, user.branchId ? String(user.branchId) : ""])
        )
      );
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể tải dữ liệu người dùng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      [user.fullName, user.username, user.email, user.phoneNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;
    setActionUserId(user.id);
    setError(null);

    try {
      await userApi.toggleStatus(user.id, !(user.enabled ?? true));
      await fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể cập nhật trạng thái người dùng.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleUpdateRole = async (userId?: number) => {
    if (!userId) return;
    setActionUserId(userId);
    setError(null);

    try {
      await userApi.updateRole(userId, roleDrafts[userId] || "CUSTOMER");
      await fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể cập nhật vai trò.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleAssignBranch = async (userId?: number) => {
    if (!userId) return;
    const branchId = Number(branchDrafts[userId]);
    if (!branchId) {
      setError("Vui lòng chọn chi nhánh trước khi gán.");
      return;
    }

    setActionUserId(userId);
    setError(null);

    try {
      await userApi.assignBranch(userId, branchId);
      await fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể gán chi nhánh.");
    } finally {
      setActionUserId(null);
    }
  };

  const getRoleBadgeClasses = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "MANAGER":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CUSTOMER":
        return "bg-green-50 text-green-700 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Dùng trực tiếp các endpoint `GET /api/v1/admin/users`, cập nhật role,
            trạng thái và gán chi nhánh theo backend hiện có.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center shadow-sm">
        <Search className="ml-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, username, email hoặc số điện thoại..."
          className="flex-1 px-4 py-3 outline-none font-medium text-slate-600 bg-transparent"
          value={searchTerm}
          onChange={(event) => {
            setPage(0);
            setSearchTerm(event.target.value);
          }}
        />
      </div>

      {error ? (
        <div className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Người dùng
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Liên hệ
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Vai trò
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Chi nhánh
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-8 py-6">
                      <div className="h-12 bg-slate-100 rounded-2xl w-48" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-12 bg-slate-100 rounded-xl w-32" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-10 bg-slate-100 rounded-xl w-40" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-10 bg-slate-100 rounded-xl w-40" />
                    </td>
                    <td className="px-8 py-6">
                      <div className="h-10 bg-slate-100 rounded-xl w-28" />
                    </td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">
                      Không tìm thấy người dùng nào
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                          {user.fullName?.charAt(0).toUpperCase() || (
                            <UserIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 uppercase font-black tracking-widest">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="font-medium">{user.email || "---"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-medium">{user.phoneNumber || "---"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeClasses(
                          String(user.role || "CUSTOMER")
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role || "CUSTOMER"}
                      </span>
                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={roleDrafts[user.id ?? 0] || String(user.role || "CUSTOMER")}
                          onChange={(event) =>
                            setRoleDrafts((current) => ({
                              ...current,
                              [user.id ?? 0]: event.target.value,
                            }))
                          }
                          className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleUpdateRole(user.id)}
                          disabled={actionUserId === user.id}
                          className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition disabled:opacity-70"
                        >
                          Lưu role
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">
                          {user.branchId ? `Chi nhánh #${user.branchId}` : "Chưa gán"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={branchDrafts[user.id ?? 0] || ""}
                          onChange={(event) =>
                            setBranchDrafts((current) => ({
                              ...current,
                              [user.id ?? 0]: event.target.value,
                            }))
                          }
                          className="min-w-[150px] px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium"
                        >
                          <option value="">Chọn chi nhánh</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssignBranch(user.id)}
                          disabled={actionUserId === user.id}
                          className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition disabled:opacity-70"
                        >
                          Gán CN
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        disabled={actionUserId === user.id}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                          user.enabled === false
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        } disabled:opacity-70`}
                      >
                        {actionUserId === user.id
                          ? "Đang xử lý..."
                          : user.enabled === false
                          ? "Bật lại"
                          : "Vô hiệu hóa"}
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
              onClick={() => setPage((current) => current - 1)}
              className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
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
