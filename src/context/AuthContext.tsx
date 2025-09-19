import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { UserCredentials } from "../types";

type UserInfo = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: UserInfo | null;
  login: (cred: UserCredentials) => Promise<void>;
  register: (cred: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prefer user from localStorage to avoid flash
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const token = localStorage.getItem("token");
        if (!token) {
          // No token → consider unauthenticated, skip /me call
          return;
        }
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ Login
  const login = async (cred: UserCredentials) => {
    try {
      const res = await api.post("/api/auth/login", cred);
      // store token and user
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // ✅ Register
  const register = async (cred: UserCredentials) => {
    try {
      await api.post("/api/auth/register", cred);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthed: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
