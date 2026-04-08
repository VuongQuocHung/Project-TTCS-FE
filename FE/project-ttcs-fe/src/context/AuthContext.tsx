"use client";

import React, { createContext, useContext, useState } from "react";
import { writeAuthToken } from "@/lib/api";
import { AuthResponse } from "@/types/api";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const savedUser = localStorage.getItem("auth.user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem("auth.user");
      }
    }
    return null;
  });
  const [isLoading] = useState(false);

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
    writeAuthToken(null);
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
