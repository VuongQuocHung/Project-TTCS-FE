"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { branchApi, userApi } from "@/lib/api-endpoints";
import type { AdminUserRequest, Branch, Role, User } from "@/types/api";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openCreateModal = () => {
    setEditingUser(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmitUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const branchId = Number(formData.get("branchId"));
    const password = String(formData.get("password") || "");
    const payload: AdminUserRequest = {
      username: String(formData.get("username") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: password.trim() || undefined,
      fullName: String(formData.get("fullName") || "").trim(),
      phoneNumber: String(formData.get("phoneNumber") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      role: String(formData.get("role") || "CUSTOMER") as Role,
      branchId: branchId || null,
      enabled: formData.get("enabled") === "on",
    };

    try {
      if (editingUser?.id) {
        await userApi.update(editingUser.id, payload);
      } else {
        await userApi.create(payload);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể lưu người dùng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;
    if (!confirm(`Xóa người dùng ${user.username || user.email}?`)) return;

    setActionUserId(user.id);
    setError(null);

    try {
      await userApi.delete(user.id);
      await fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || "Không thể xóa người dùng.");
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
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          THÊM NGƯỜI DÙNG
        </button>
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Thao tác
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
                    <td className="px-8 py-6">
                      <div className="h-10 bg-slate-100 rounded-xl ml-auto w-24" />
                    </td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
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
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm bg-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={actionUserId === user.id}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm bg-white disabled:opacity-60"
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

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
                </h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  Quản lý thông tin tài khoản, vai trò và chi nhánh.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                  <input name="username" defaultValue={editingUser?.username} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                  <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    {editingUser ? "Mật khẩu mới" : "Mật khẩu"}
                  </label>
                  <input name="password" type="password" required={!editingUser} placeholder={editingUser ? "Bỏ trống nếu không đổi" : ""} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Họ tên</label>
                  <input name="fullName" defaultValue={editingUser?.fullName} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Số điện thoại</label>
                  <input name="phoneNumber" defaultValue={editingUser?.phoneNumber} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Vai trò</label>
                  <select name="role" defaultValue={editingUser?.role || "CUSTOMER"} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition">
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Chi nhánh</label>
                  <select name="branchId" defaultValue={editingUser?.branchId || ""} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition">
                    <option value="">Không gán</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700">
                  <input name="enabled" type="checkbox" defaultChecked={editingUser?.enabled ?? true} className="w-5 h-5 accent-blue-600" />
                  Đang hoạt động
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Địa chỉ</label>
                <textarea name="address" defaultValue={editingUser?.address} rows={3} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 transition resize-none" />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "ĐANG LƯU..." : editingUser ? "CẬP NHẬT" : "THÊM NGƯỜI DÙNG"}
                  {!isSubmitting ? <Check className="w-5 h-5" /> : null}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
