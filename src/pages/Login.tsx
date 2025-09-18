import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Get success message from navigation state
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Clear the state after showing the message
      nav(location.pathname, { replace: true });
    }
  }, [location.state, nav, location.pathname]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");
    try {
      await login(form);
      nav("/");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200" />

      
      <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/dot-grid.png')] opacity-20" />

      
      <div className="relative w-full max-w-md p-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200">
        
        
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="https://res.cloudinary.com/dje6kfwo1/image/upload/v1756359849/Spendlio_Logo_Design_nyzfhw.png"
            alt="Spendlio Logo"
            className="w-32 h-auto mb-3"
          />
          <p className="text-gray-500 text-sm italic">
            “Track smart. Spend wiser.”
          </p>
        </div>

        {/* Divider Line */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-2 text-sm text-gray-500">Login</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          {successMsg && <p className="text-sm text-green-600 font-medium">{successMsg}</p>}
          {err && <p className="text-sm text-red-600 font-medium">{err}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition"
          >
            Login
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-gray-700 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-purple-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
