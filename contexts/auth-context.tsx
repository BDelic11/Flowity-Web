"use client";

import React, { createContext, useContext } from "react";
import { useGetCurrentUser } from "@/app/api/hooks/auth/useGetCurrentUser";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string | null;
  tenantName: string;
  isEmailVerified: boolean;
  isBookable: boolean;
  bookableServiceIds: string[];
} | null;

type AuthContextValue = {
  user: AuthUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  organizationId: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  organizationId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading } = useGetCurrentUser();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role ?? null,
        organizationId: user?.organizationId ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
