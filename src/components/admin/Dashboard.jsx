import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  MdCategory, MdFolder, MdShoppingBag, MdShoppingCart,
  MdRefresh, MdPerson, MdBusiness, MdTrendingUp,
  MdOutlineStorefront, MdArrowForward,
} from "react-icons/md";

const quickLinks = [
  { label: "Add Category",    to: "/admin/category",      color: "#2563eb" },
  { label: "Add Product",     to: "/admin/product",       color: "#7c3aed" },
  { label: "View Orders",     to: "/admin/orders",        color: "#d97706" },
  { label: "KYC Approvals",   to: "/admin/businesses",    color: "#702834" },
];

export default function AdminDashboard() {
  const { token, admin } = useAdmin();

  const [counts, setCounts] = useState({
    categories: "-",
    subcategories: "-",
    products: "-",
    orders: "-",
    returnOrders: "-",
    users: "-",
    businesses: "-",
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}`, "Cache-Control": "no-store" };

    try {
      const [catRes, subcatRes, prodRes, orderRes, returnRes, userRes, bizRes] = await Promise.allSettled([
        fetch("/api/categories/",             { headers }).then(r => r.json()),
        fetch("/api/subcategories/",          { headers }).then(r => r.json()),
        fetch("/api/products/",               { headers }).then(r => r.json()),
        fetch("/api/orders/admin/all",        { headers }).then(r => r.json()),
        fetch("/api/return-orders/admin/all", { headers }).then(r => r.json()),
        fetch("/api/user/all",                { headers }).then(r => r.json()),
        fetch("/api/admin/business/all",      { headers }).then(r => r.json()),
      ]);

      const val  = (res, key) => res.status === "fulfilled" ? (res.value?.[key]?.length ?? res.value?.length ?? "-") : "-";
      const arr  = (res, key) => res.status === "fulfilled" ? (res.value?.[key] ?? []) : [];

      const orders = arr(orderRes, "orders");

      setCounts({
        categories:   val(catRes,    "categories"),
        subcategories:val(subcatRes, "subcategories"),
        products:     val(prodRes,   "products"),
        orders:       orders.length || "-",
        returnOrders: arr(returnRes, "returnOrders").length || "-",
        users:        arr(userRes,   "users").length || "-",
        businesses:   arr(bizRes,    "businesses").length || "-",
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (e) {
      // silently fail — counts stay as "-"
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Categories",    value: counts.categories,    icon: MdCategory,         bg: "#eff6ff", iconColor: "#2563eb", link: "/admin/category"      },
    { title: "Subcategories", value: counts.subcategories, icon: MdFolder,           bg: "#f0fdf4", iconColor: "#16a34a", link: "/admin/subcategory"   },
    { title: "Products",      value: counts.products,      icon: MdShoppingBag,      bg: "#faf5ff", iconColor: "#7c3aed", link: "/admin/product"       },
    { title: "Orders",        value: counts.orders,        icon: MdShoppingCart,     bg: "#fffbeb", iconColor: "#d97706", link: "/admin/orders"        },
    { title: "Return Orders", value: counts.returnOrders,  icon: MdRefresh,          bg: "#fff1f2", iconColor: "#e11d48", link: "/admin/return-orders" },
    { title: "Users",         value: counts.users,         icon: MdPerson,           bg: "#f0f9ff", iconColor: "#0284c7", link: "/admin/user"          },
    { title: "Businesses",    value: counts.businesses,    icon: MdBusiness,         bg: "#fdf4ff", iconColor: "#9333ea", link: "/admin/businesses"    },
  ];

  const statusColor = {
    delivered:        { bg: "#dcfce7", text: "#15803d" },
    processing:       { bg: "#fef9c3", text: "#854d0e" },
    "in-transit":     { bg: "#dbeafe", text: "#1d4ed8" },
    "out-for-delivery":{ bg: "#ffedd5", text: "#c2410c" },
    rejected:         { bg: "#fee2e2", text: "#b91c1c" },
  };

  return (
    <div className="p-6 space-y-8">

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, <span className="font-semibold" style={{ color: "#702834" }}>{admin?.name || "Admin"}</span>. Here's what's happening today.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors self-start sm:self-auto"
          style={{ backgroundColor: "#702834" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
        >
          <MdRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, bg, iconColor, link }) => (
          <Link to={link} key={title} className="block group">
            <div
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5"
              style={{ backgroundColor: bg }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
                <Icon style={{ color: iconColor, fontSize: "1.4rem" }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">{title}</p>
                <p className="text-2xl font-bold text-gray-800 leading-tight">
                  {loading && value === "-"
                    ? <span className="inline-block w-8 h-5 bg-gray-200 rounded animate-pulse" />
                    : value
                  }
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom section: recent orders + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MdShoppingCart style={{ color: "#702834", fontSize: "1.2rem" }} />
              <h2 className="text-sm font-bold text-gray-800">Recent Orders</h2>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: "#702834" }}
            >
              View all <MdArrowForward />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-32 h-4 bg-gray-100 rounded" />
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const sc = statusColor[order.status] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <div key={order._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate font-mono">
                        {order.orderId || order._id?.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {order.user?.userDetails?.fullName || order.user?.phone || "—"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                      ₹{order.total}
                    </p>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 capitalize"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {order.status || "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <MdTrendingUp style={{ color: "#702834", fontSize: "1.2rem" }} />
              <h2 className="text-sm font-bold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickLinks.map(({ label, to, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {label}
                  </div>
                  <MdArrowForward className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Store info */}
          <div
            className="rounded-xl p-5 text-white"
            style={{ background: "linear-gradient(135deg, #702834 0%, #9e3d53 100%)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <MdOutlineStorefront className="text-2xl text-white/80" />
              <div>
                <p className="text-xs text-white/70 font-medium">Platform</p>
                <p className="text-sm font-bold">Sangam Wholesale</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              B2B wholesale platform connecting retailers with top FMCG brands across India.
            </p>
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/60">
              <span>Admin Panel v1.0</span>
              <span>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
