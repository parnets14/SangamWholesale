import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  MdDashboard, MdImage, MdInfo, MdPeople, MdCheckCircle,
  MdCategory, MdFolder, MdShoppingBag, MdBusiness,
  MdPerson, MdShoppingCart, MdRefresh, MdLogout,
} from "react-icons/md";
import logo from "../../assets/images/sangamwholesale.png";

const navItems = [
  { path: "/admin/dashboard",    label: "Dashboard",     icon: MdDashboard   },
  { path: "/admin/banner",       label: "Banner",        icon: MdImage       },
  { path: "/admin/aboutman",     label: "About Us",      icon: MdInfo        },
  { path: "/admin/leadershi",    label: "Leadership",    icon: MdPeople      },
  { path: "/admin/startkyc",     label: "Three Step",    icon: MdCheckCircle },
  { path: "/admin/category",     label: "Category",      icon: MdCategory    },
  { path: "/admin/subcategory",  label: "SubCategory",   icon: MdFolder      },
  { path: "/admin/product",      label: "Products",      icon: MdShoppingBag },
  { path: "/admin/businesses",   label: "Businesses",    icon: MdBusiness    },
  { path: "/admin/user",         label: "Users",         icon: MdPerson      },
  { path: "/admin/orders",       label: "Orders",        icon: MdShoppingCart},
  { path: "/admin/return-orders",label: "Return Orders", icon: MdRefresh     },
];

const Sidebar = () => {
  const { logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 text-white z-50 flex flex-col" style={{ backgroundColor: "#0d1b2a" }}>

      {/* Brand */}
      <div className="flex flex-col items-center py-5 px-4 border-b" style={{ borderColor: "#1a2d3f" }}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 mb-2 flex items-center justify-center" style={{ borderColor: "#702834" }}>
          <img src={logo} alt="Sangam Wholesale" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-sm font-bold text-white tracking-wide">Sangam Wholesale</h2>
        <span className="text-xs mt-0.5" style={{ color: "#8a9ab0" }}>Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive ? "#702834" : "transparent",
                color: isActive ? "#ffffff" : "#b0bec5",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#1a2d3f"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Icon className="text-lg flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t" style={{ borderColor: "#1a2d3f" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "#702834" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
        >
          <MdLogout className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
