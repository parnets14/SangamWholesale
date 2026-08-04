import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";

const RETURN_STATUS_OPTIONS = [
  { value: "processing",       label: "Processing",       badge: "status-badge-processing",   dot: "status-dot-processing",   cardBg: "bg-yellow-500"  },
  { value: "in-transit",       label: "In Transit",       badge: "status-badge-in-transit",   dot: "status-dot-in-transit",   cardBg: "bg-blue-300"   },
  { value: "out-for-delivery", label: "Out for Delivery", badge: "status-badge-out-delivery", dot: "status-dot-out-delivery", cardBg: "bg-orange-500"  },
  { value: "delivered",        label: "Delivered",        badge: "status-badge-delivered",    dot: "status-dot-delivered",    cardBg: "bg-green-600"   },
  { value: "rejected",         label: "Rejected",         badge: "status-badge-rejected",     dot: "status-dot-rejected",     cardBg: "bg-red-400"     },
];

const getOption = (status) =>
  RETURN_STATUS_OPTIONS.find((o) => o.value === status) || {
    value: status,
    label: status || "—",
    badge: "status-badge-default",
    dot:   "status-dot-default",
  };

// ── Status Cell ────────────────────────────────────────────────────────────
const StatusCell = ({ order, token, onUpdated }) => {
  const [open, setOpen]               = useState(false);
  const [saving, setSaving]           = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);
  const [dropPos, setDropPos]         = useState({ top: 0, left: 0 });
  const prevStatusRef                 = useRef(order.status);
  const btnRef                        = useRef(null);

  // sync when parent updates
  useEffect(() => {
    setLocalStatus(order.status);
    prevStatusRef.current = order.status;
  }, [order.status]);

  // close dropdown on resize only — NOT on scroll, so user can click options
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // close on outside click — ignore clicks inside the portal dropdown too
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // if click is on the badge button itself, let handleOpen toggle it
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      // if click is inside the portal dropdown (data-dropdown attribute), ignore
      if (e.target.closest && e.target.closest("[data-status-dropdown]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (saving) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((v) => !v);
  };

  const handleSelect = async (newStatus) => {
    if (newStatus === localStatus || saving) { setOpen(false); return; }
    setOpen(false);
    const previous = prevStatusRef.current;
    prevStatusRef.current = newStatus;
    setLocalStatus(newStatus); // optimistic update
    setSaving(true);
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
        onUpdated(order._id, newStatus); // stats recount
      } else {
        prevStatusRef.current = previous;
        setLocalStatus(previous); // revert
      }
    } catch {
      prevStatusRef.current = previous;
      setLocalStatus(previous); // revert
    } finally {
      setSaving(false);
    }
  };

  const current = getOption(localStatus);

  return (
    <div className="inline-block">
      {/* Badge button */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        title="Click to change status"
        className={`${current.badge} inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition hover:opacity-90 active:scale-95`}
      >
        {saving && (
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        )}
        {current.label}
        <svg className="w-3 h-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Portal dropdown — renders in document.body, no overflow clipping */}
      {open && createPortal(
        <div
          data-status-dropdown
          className="fixed z-[9999] bg-white rounded-xl py-1.5 min-w-[220px]"
          style={{ top: dropPos.top, left: dropPos.left, boxShadow: "0 8px 30px rgba(0,0,0,0.18)" }}
        >
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Change Status
          </p>
          {RETURN_STATUS_OPTIONS.map((opt) => {
            const isActive = opt.value === localStatus;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 transition hover:bg-gray-50 ${isActive ? "bg-gray-50" : ""}`}
              >
                <span className={`${opt.dot} w-2.5 h-2.5 rounded-full shrink-0`} />
                <span className={`${opt.badge} px-3 py-0.5 rounded-full text-xs font-semibold`}>
                  {opt.label}
                </span>
                {isActive && (
                  <svg className="ml-auto w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
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
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache", "Pragma": "no-cache" },
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

  const handleUpdated = (orderId, newStatus) => {
    setReturnOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) { try { return new URL(image).pathname; } catch { return image; } }
    if (!image.startsWith("/")) return `/products/${image}`;
    return image;
  };

  const filtered = returnOrders.filter((order) => {
    const name = order.user?.userDetails?.fullName || order.user?.phone || "";
    const matchSearch =
      search === "" ||
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {RETURN_STATUS_OPTIONS.map(({ value, label, badge, cardBg }) => (
          <div key={value} className={`${cardBg} rounded-lg shadow-sm border p-3 text-center`}>
            <p className="text-2xl font-bold text-gray-800">
              {returnOrders.filter((o) => o.status === value).length}
            </p>
            <span className={`${badge} text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block`}>
              {label}
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
          {RETURN_STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-blue-700">{order._id}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">
                      {order.user?.userDetails?.fullName || "—"}
                    </div>
                    <div className="text-xs text-gray-400">{order.user?.phone || ""}</div>
                  </td>
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
                            <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-gray-400 text-xs">?</div>
                          )}
                          <span className="text-sm text-gray-700">{item.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">×{item.quantity}</span>
                          {item.reason && (
                            <span className="text-xs text-red-500 italic">{item.reason}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] whitespace-pre-wrap">
                    {order.comment || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusCell order={order} token={token} onUpdated={handleUpdated} />
                  </td>
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
