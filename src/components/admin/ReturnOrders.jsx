import React, { useEffect, useRef, useState } from "react";
import { useAdmin } from "../context/AdminContext";

const RETURN_STATUS_OPTIONS = [
  "requested",
  "pending",
  "approved",
  "rejected",
  "picked_up",
  "refunded",
];

const STATUS_COLORS = {
  requested: "bg-orange-100 text-orange-800 border-orange-300",
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved:  "bg-blue-100 text-blue-800 border-blue-300",
  rejected:  "bg-red-100 text-red-800 border-red-300",
  picked_up: "bg-purple-100 text-purple-800 border-purple-300",
  refunded:  "bg-green-100 text-green-800 border-green-300",
};

// ── Inline status cell ─────────────────────────────────────────────────────
const StatusCell = ({ order, token, onUpdated }) => {
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash]   = useState(null); // "ok" | "err"
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (newStatus) => {
    if (newStatus === order.status) { setOpen(false); return; }
    setOpen(false);
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch(`/api/return-orders/admin/${order._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated(order._id, newStatus);
        setFlash("ok");
      } else {
        setFlash("err");
      }
    } catch {
      setFlash("err");
    } finally {
      setSaving(false);
      setTimeout(() => setFlash(null), 2500);
    }
  };

  const colorClass =
    STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600 border-gray-300";

  return (
    <div ref={ref} className="relative inline-block">
      {/* Flash feedback */}
      {flash === "ok" && (
        <span className="absolute -top-5 left-0 text-xs text-green-600 font-medium whitespace-nowrap">
          ✓ Updated
        </span>
      )}
      {flash === "err" && (
        <span className="absolute -top-5 left-0 text-xs text-red-500 font-medium whitespace-nowrap">
          ✗ Failed
        </span>
      )}

      {/* Clickable badge */}
      <button
        onClick={() => !saving && setOpen((v) => !v)}
        title="Click to change status"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border cursor-pointer select-none transition hover:opacity-80 ${colorClass}`}
      >
        {saving ? (
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {order.status?.replace("_", " ")}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[150px]">
          {RETURN_STATUS_OPTIONS.map((s) => {
            const isActive = s === order.status;
            const c = STATUS_COLORS[s] || "bg-gray-50 text-gray-700 border-gray-200";
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs capitalize hover:bg-gray-50 transition ${
                  isActive ? "font-bold" : "font-normal"
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-full border ${c} ${
                    isActive ? "ring-1 ring-offset-1 ring-blue-400" : ""
                  }`}
                >
                  {s.replace("_", " ")}
                </span>
                {isActive && (
                  <svg
                    className="ml-auto w-3.5 h-3.5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const ReturnOrders = () => {
  const { token } = useAdmin();
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (token) fetchReturnOrders();
  }, [token]);

  const fetchReturnOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/return-orders/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-store",
        },
      });
      const data = await res.json();
      if (data.success) setReturnOrders(data.returnOrders);
      else setError("Failed to fetch return orders");
    } catch {
      setError("Error fetching return orders");
    } finally {
      setLoading(false);
    }
  };

  // Called from StatusCell after successful API update
  const handleUpdated = (orderId, newStatus) => {
    setReturnOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) {
      try { return new URL(image).pathname; } catch { return image; }
    }
    if (!image.startsWith("/")) return `/products/${image}`;
    return image;
  };

  const filtered = returnOrders.filter((order) => {
    const name = order.user?.userDetails?.fullName || order.user?.phone || "";
    const matchSearch =
      search === "" ||
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Return Orders</h2>
        <button
          onClick={fetchReturnOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {RETURN_STATUS_OPTIONS.map((s) => (
          <div key={s} className="bg-white rounded-lg shadow-sm border p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {returnOrders.filter((o) => o.status === s).length}
            </p>
            <span
              className={`text-xs font-medium capitalize mt-1 px-2 py-0.5 rounded-full inline-block border ${
                STATUS_COLORS[s] || "bg-gray-100 text-gray-600"
              }`}
            >
              {s.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by Return ID or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {RETURN_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading return orders...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No return orders found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Return Order ID", "Customer", "Items", "Comment", "Status", "Created At"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  {/* Return Order ID */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-blue-700">{order._id}</span>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">
                      {order.user?.userDetails?.fullName || "—"}
                    </div>
                    <div className="text-xs text-gray-400">{order.user?.phone || ""}</div>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {order.items?.map((item) => (
                        <li key={item._id} className="flex items-center gap-2">
                          {getImageUrl(item.image) ? (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover border"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              ?
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{item.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            ×{item.quantity}
                          </span>
                          {item.reason && (
                            <span className="text-xs text-red-500 italic">{item.reason}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Comment */}
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] whitespace-pre-wrap">
                    {order.comment || "—"}
                  </td>

                  {/* Status — click badge to open inline dropdown */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusCell order={order} token={token} onUpdated={handleUpdated} />
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-sm text-gray-400 text-right">
          Showing {filtered.length} of {returnOrders.length} return orders
        </p>
      )}
    </div>
  );
};

export default ReturnOrders;
