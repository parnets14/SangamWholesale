import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAdmin } from "../context/AdminContext";

const AdminLayout = () => {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-grow ml-64">
        <div className="flex items-center justify-end bg-white shadow px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3 ">
            <span className="text-gray-800 font-medium">Admin</span>
            <FaUserCircle className="text-2xl text-gray-600 cursor-pointer" />
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium ml-2"
              title="Logout"
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
        <div className="flex-grow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
