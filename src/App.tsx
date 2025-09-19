import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Analytics from "./pages/Analytics";

const App: React.FC = () => {
  const { isAuthed } = useAuth();  // ✅ use isAuthed instead of user
  const location = useLocation();

  // Routes where Navbar should NOT be shown
  const noNavbarRoutes = ["/login", "/register"];

  // Show Navbar only if logged in and not on login/register pages
  const shouldShowNavbar = isAuthed && !noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />} {/* ✅ Show Navbar only when logged in */}
      <div className={shouldShowNavbar ? "pt-16" : ""}> {/* Add top padding when Navbar is visible */}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <Dashboard />
                </DataProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/analytics" element={
              <ProtectedRoute>
                <DataProvider>
                  <Analytics />
                </DataProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
