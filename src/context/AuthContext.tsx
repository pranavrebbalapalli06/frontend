import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { UserCredentials } from "../types";

type UserInfo = {
  name: string;
  email: string;
};

type AuthContextType = {
  token: string | null;
  user: UserInfo | null;  // Added user info
  login: (cred: UserCredentials) => Promise<void>;
  register: (cred: UserCredentials) => Promise<void>;
  logout: () => void;
  isAuthed: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<UserInfo | null>(null);

  // Whenever token changes, fetch user info or clear it
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      // Fetch user details when token exists
      api.get("/auth/me")
        .then((res: { data: { user: UserInfo } }) => setUser(res.data.user))
        .catch(() => setUser(null));
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = async (cred: UserCredentials) => {
    const res = await api.post("/auth/login", cred);
    setToken(res.data.token);
    setUser(res.data.user); // Save user info on login
  };

  const register = async (cred: UserCredentials) => {
    await api.post("/auth/register", cred);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
