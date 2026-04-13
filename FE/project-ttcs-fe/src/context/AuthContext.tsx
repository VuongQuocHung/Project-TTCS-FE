"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { writeAuthToken } from "@/lib/api";
import { AuthResponse } from "@/types/api";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Khởi tạo với undefined để dễ dàng kiểm tra nếu context không được cung cấp

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const savedUser = localStorage.getItem("auth.user"); // Lấy thông tin user đã lưu trong localStorage
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as AuthResponse;
          setUser(parsedUser);
          // Nếu có token, thiết lập token cho các yêu cầu API, tránh lỗi 401 khi reload trang
          if (parsedUser?.token) {
            writeAuthToken(parsedUser.token);
          }
        } catch {
          localStorage.removeItem("auth.user");
        }
      }
      setIsLoading(false);
    }, []);

  const login = (userData: AuthResponse) => {
    setUser(userData);
    localStorage.setItem("auth.user", JSON.stringify(userData));
    if (userData.token) {
      writeAuthToken(userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth.user");
    writeAuthToken(null); // Xóa token khỏi cấu hình API khi đăng xuất
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
