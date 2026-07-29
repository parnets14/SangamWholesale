import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ⬅️ Add useNavigate
import { useAdmin } from "../context/AdminContext";


const Sidebar = () => {
  const { logout,login } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate(); // ⬅️ Add this

console.log('logout',logout);
console.log('login',login);

  const handleLogout = () => {
    logout(); // clear session
    navigate("/admin"); // ⬅️ navigate to login
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/banner", label: "Banner ", icon: "🖼️" },
    { path: "/admin/aboutman", label: "About Us", icon: "ℹ️" },
    {path: "/admin/Leadershi", label: "Leadership", icon: "👥" },
    { path: "/admin/startkyc", label: "Three Step ", icon: "✅" },
    { path: "/admin/category", label: "Category ", icon: "🗂️" },
    { path: "/admin/subcategory", label: "SubCategory", icon: "📂" },
    { path: "/admin/product", label: "Products", icon: "🛍️" },
    { path: "/admin/businesses", label: "businesses", icon: "🏛️" },
    { path: "/admin/User", label: "User", icon: "👤" },
    { path: "/admin/orders", label: "Orders", icon: "📦" },
    { path: "/admin/return-orders", label: "Return Orders", icon: "🔄" },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white p-4 shadow-lg z-50 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center py-4 border-b border-gray-700">
          Admin Panel
        </h2>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded transition-colors ${
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors text-white font-medium"
        >
          <span className="mr-2">🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
