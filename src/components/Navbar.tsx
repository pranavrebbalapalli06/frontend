import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react"; // Icons for hamburger & close

const Navbar: React.FC = () => {
  const { logout, user } = useAuth(); // Assuming user has { name, email }
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleProfile = () => setProfileOpen((prev) => !prev);

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dje6kfwo1/image/upload/v1756359849/Spendlio_Logo_Design_nyzfhw.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-semibold text-lg hidden sm:inline">
              Hello! {user?.name || "User"}
            </span>
          </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
            Dashboard
          </Link>
          <Link to="/analytics" className="text-gray-700 hover:text-blue-600 transition">
            Analytics
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Log out
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-gray-700" onClick={toggleMenu}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-md px-4 py-3 space-y-3">
          <Link to="/" className="block text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
            Dashboard
          </Link>
          <Link to="/analytics" className="block text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
            Analytics
          </Link>
          <button
            onClick={() => {
              logout();
              toggleMenu();
            }}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Log out
          </button>

          {/* Profile Circle */}
          <div className="relative">
            <div
              className="mt-4 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg cursor-pointer"
              onClick={toggleProfile}
            >
              {firstLetter}
            </div>
            {profileOpen && (
              <div className="absolute mt-2 left-0 bg-white shadow-lg border rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600">Hello! {user?.name || "User"}</p>
                <p className="text-sm font-medium">{user?.email || "user@example.com"}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
