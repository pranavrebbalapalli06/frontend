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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (cred: UserCredentials) => {
    try {
      const res = await api.post("/auth/login", cred);
      setUser(res.data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (cred: UserCredentials) => {
    try {
      await api.post("/auth/register", cred);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthed: !!user,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
