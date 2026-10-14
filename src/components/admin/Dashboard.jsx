import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  MdCategory, MdFolder, MdShoppingBag, MdShoppingCart,
  MdRefresh, MdPerson, MdBusiness, MdTrendingUp,
  MdOutlineStorefront, MdArrowForward, MdInventory2,
  MdAddCircleOutline, MdFactCheck, MdReceiptLong,
} from "react-icons/md";

const BRAND = "#702834";
const BRAND_DARK = "#5a1f29";

const quickLinks = [
  { label: "Add Category",  to: "/admin/category",   color: "#2563eb", icon: MdAddCircleOutline },
  { label: "Add Product",   to: "/admin/product",    color: "#7c3aed", icon: MdInventory2 },
  { label: "View Orders",   to: "/admin/orders",     color: "#d97706", icon: MdReceiptLong },
  { label: "KYC Approvals", to: "/admin/businesses", color: BRAND,     icon: MdFactCheck },
];

// Delivery-partner driven statuses — mirrors the Orders admin page so the
// dashboard shows friendly labels instead of raw keys like "out_for_delivery".
const ORDER_STATUS = {
  placed:           { label: "Processing",       bg: "#fef9c3", text: "#854d0e" },
  accepted:         { label: "In Transit",       bg: "#dbeafe", text: "#1d4ed8" },
  out_for_delivery: { label: "Out for Delivery", bg: "#ffedd5", text: "#c2410c" },
  delivered:        { label: "Delivered",        bg: "#dcfce7", text: "#15803d" },
  undelivered:      { label: "Undelivered",      bg: "#fee2e2", text: "#b91c1c" },
  cancelled:        { label: "Cancelled",        bg: "#fee2e2", text: "#b91c1c" },
};

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
};

export default function AdminDashboard() {
  const { token, admin } = useAdmin();

  const [counts, setCounts] = useState({
    categories: null,
    subcategories: null,
    products: null,
    orders: null,
    returnOrders: null,
    users: null,
    businesses: null,
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

      // null when the request failed, so the card can show "—" rather than a
      // misleading 0 (a genuine 0 is a real, valid count)
      const val = (res, key) => res.status === "fulfilled" ? (res.value?.[key]?.length ?? res.value?.length ?? 0) : null;
      const arr = (res, key) => res.status === "fulfilled" ? (res.value?.[key] ?? []) : [];
      const count = (res, key) => res.status === "fulfilled" ? arr(res, key).length : null;

      const orders = arr(orderRes, "orders");

      setCounts({
        categories:    val(catRes,    "categories"),
        subcategories: val(subcatRes, "subcategories"),
        products:      val(prodRes,   "products"),
        orders:        count(orderRes,   "orders"),
        returnOrders:  count(returnRes,  "returnOrders"),
        users:         count(userRes,    "users"),
        businesses:    count(bizRes,     "businesses"),
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (e) {
      // silently fail — counts stay as they were
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Categories",    value: counts.categories,    icon: MdCategory,     iconColor: "#2563eb", tint: "#eff6ff", link: "/admin/category"      },
    { title: "Subcategories", value: counts.subcategories, icon: MdFolder,       iconColor: "#16a34a", tint: "#f0fdf4", link: "/admin/subcategory"   },
    { title: "Products",      value: counts.products,      icon: MdShoppingBag,  iconColor: "#7c3aed", tint: "#faf5ff", link: "/admin/product"       },
    { title: "Orders",        value: counts.orders,        icon: MdShoppingCart, iconColor: "#d97706", tint: "#fffbeb", link: "/admin/orders"        },
    { title: "Return Orders", value: counts.returnOrders,  icon: MdRefresh,      iconColor: "#e11d48", tint: "#fff1f2", link: "/admin/return-orders" },
    { title: "Customers",     value: counts.users,         icon: MdPerson,       iconColor: "#0284c7", tint: "#f0f9ff", link: "/admin/customers"     },
    { title: "Businesses",    value: counts.businesses,    icon: MdBusiness,     iconColor: "#9333ea", tint: "#fdf4ff", link: "/admin/businesses"    },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-6 space-y-8">

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold" style={{ color: BRAND }}>
              {admin?.name || "Admin"}
            </span>
            <span className="text-gray-400"> · {today}</span>
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors self-start sm:self-auto disabled:opacity-70"
          style={{ backgroundColor: BRAND }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
        >
          <MdRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, iconColor, tint, link }) => (
          <Link to={link} key={title} className="group">
            <div className="h-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:border-gray-200">
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {title}
                </p>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: tint }}
                >
                  <Icon style={{ color: iconColor, fontSize: "1.25rem" }} />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-3xl font-bold text-gray-800 leading-none">
                  {loading
                    ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse align-middle" />
                    : value === null
                      ? <span className="text-gray-300">—</span>
                      : value
                  }
                </p>
                <MdArrowForward className="text-gray-300 text-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom section: recent orders + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fdf6f7" }}>
                <MdShoppingCart style={{ color: BRAND, fontSize: "1.1rem" }} />
              </div>
              <h2 className="text-sm font-bold text-gray-800">Recent Orders</h2>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs font-semibold hover:underline"
              style={{ color: BRAND }}
            >
              View all <MdArrowForward />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 bg-gray-100 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                  <div className="w-20 h-6 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <MdShoppingCart className="text-4xl mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const name = order.user?.userDetails?.fullName || order.user?.phone || "Guest";
                const sc = ORDER_STATUS[order.status] || { label: order.status || "—", bg: "#f3f4f6", text: "#374151" };
                return (
                  <div
                    key={order._id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fdf6f7] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: BRAND }}
                    >
                      {initials(order.user?.userDetails?.fullName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate font-mono">
                        #{order.orderId || order._id?.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{name}</p>
                    </div>

                    <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </p>

                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {sc.label}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fdf6f7" }}>
                <MdTrendingUp style={{ color: BRAND, fontSize: "1.1rem" }} />
              </div>
              <h2 className="text-sm font-bold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickLinks.map(({ label, to, color, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#fdf6f7] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${color}14` }}
                    >
                      <Icon style={{ color, fontSize: "1.05rem" }} />
                    </div>
                    {label}
                  </div>
                  <MdArrowForward className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Store info */}
          <div
            className="rounded-2xl p-5 text-white"
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
