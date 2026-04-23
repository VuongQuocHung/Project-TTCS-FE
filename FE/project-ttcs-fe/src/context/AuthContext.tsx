"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { resolveTokenFromAuthPayload, writeAuthToken, setMemoryToken } from "@/lib/api";
import { AuthResponse } from "@/types/api";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Khởi tạo với undefined để dễ dàng kiểm tra nếu context không được cung cấp

function normalizeAuthUser(data: AuthResponse): AuthResponse {
  const roleFromNestedUser = data.user?.role?.name;
  const resolvedRole = typeof data.role === "string" ? data.role : roleFromNestedUser;
  const resolvedToken = resolveTokenFromAuthPayload(data);

  return {
    ...data,
    role: resolvedRole,
    token: resolvedToken ?? data.token,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const savedUser = localStorage.getItem("auth.user"); // Lấy thông tin user đã lưu trong localStorage
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as AuthResponse;
          const normalizedUser = normalizeAuthUser(parsedUser);
          setUser(normalizedUser);
          // Đồng bộ token vào memory TRƯỚC, localStorage sau
          const token = normalizedUser.token ?? null;
          setMemoryToken(token);
          writeAuthToken(token);
        } catch {
          localStorage.removeItem("auth.user");
          setMemoryToken(null);
          writeAuthToken(null);
        }
      }
      setIsLoading(false);
    }, []);

  const login = (userData: AuthResponse) => {
    const normalizedUser = normalizeAuthUser(userData);
    setUser(normalizedUser);
    localStorage.setItem("auth.user", JSON.stringify(normalizedUser));
    const token = normalizedUser.token ?? null;
    setMemoryToken(token); // memory first — instant, no timing gap
    writeAuthToken(token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth.user");
    setMemoryToken(null); // xoá memory
    writeAuthToken(null); // xoá localStorage
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
