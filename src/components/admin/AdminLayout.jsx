import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MdPerson, MdLogout } from "react-icons/md";
import { useAdmin } from "../context/AdminContext";

const AdminLayout = () => {
  const { logout, isAdminAuthenticated, isAuthChecked } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sangam Wholesale - Admin";
  }, []);

  // Redirect to login if not authenticated (after auth check completes)
  useEffect(() => {
    if (isAuthChecked && !isAdminAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthChecked, isAdminAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  // Show nothing while checking auth to prevent flash
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f1f5f9" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: "#702834", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAdminAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f1f5f9" }}>
      <Sidebar />
      <div className="flex flex-col flex-grow ml-64">

        {/* Top bar */}
        <div className="flex items-center justify-end bg-white shadow-sm px-6 py-3 sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#702834" }}>
                <MdPerson className="text-white text-lg" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#702834" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
            >
              <MdLogout className="text-base" />
              Logout
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-grow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
