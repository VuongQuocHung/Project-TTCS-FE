"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { resolveTokenFromAuthPayload, setMemoryToken, writeAuthToken } from "@/lib/api";
import { profileApi } from "@/lib/api-endpoints";
import type { AuthResponse, SessionUser, User } from "@/types/api";

interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  login: (authData: AuthResponse) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeSessionUser(authData: AuthResponse, profile?: User | null): SessionUser {
  const token = resolveTokenFromAuthPayload(authData) ?? authData.token ?? undefined;
  const role = authData.role ?? profile?.role ?? authData.user?.role;

  return {
    ...profile,
    ...authData.user,
    ...authData,
    username: authData.username ?? profile?.username ?? authData.user?.username,
    email: profile?.email ?? authData.user?.email,
    fullName: profile?.fullName ?? authData.user?.fullName,
    phoneNumber: profile?.phoneNumber ?? authData.user?.phoneNumber,
    address: profile?.address ?? authData.user?.address,
    branchId: profile?.branchId ?? authData.user?.branchId,
    enabled: profile?.enabled ?? authData.user?.enabled,
    role,
    token,
  };
}

function persistUser(user: SessionUser | null) {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("auth.user", JSON.stringify(user));
    return;
  }

  localStorage.removeItem("auth.user");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateProfile = async (seedUser: SessionUser | null) => {
    if (!seedUser?.token) return seedUser;

    try {
      const profile = await profileApi.getProfile();
      const mergedUser = normalizeSessionUser(seedUser, profile);
      setUser(mergedUser);
      persistUser(mergedUser);
      return mergedUser;
    } catch {
      return seedUser;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      const savedUser = localStorage.getItem("auth.user");

      if (!savedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser) as AuthResponse;
        const normalizedUser = normalizeSessionUser(parsedUser, parsedUser.user);
        const token = normalizedUser.token ?? null;

        setMemoryToken(token);
        writeAuthToken(token);

        if (!isMounted) return;
        setUser(normalizedUser);
        await hydrateProfile(normalizedUser);
      } catch {
        persistUser(null);
        setMemoryToken(null);
        writeAuthToken(null);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (authData: AuthResponse) => {
    const normalizedUser = normalizeSessionUser(authData, authData.user);
    const token = normalizedUser.token ?? null;

    setMemoryToken(token);
    writeAuthToken(token);
    setUser(normalizedUser);
    persistUser(normalizedUser);

    await hydrateProfile(normalizedUser);
  };

  const refreshProfile = async () => {
    if (!user?.token) return;
    await hydrateProfile(user);
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
    setMemoryToken(null);
    writeAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshProfile }}>
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
