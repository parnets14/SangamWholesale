import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import { MdVisibility, MdClose, MdTwoWheeler, MdDeleteOutline, MdReceipt, MdPrint } from "react-icons/md";

// Status is driven by the delivery partner's actions — read-only in admin.
const DELIVERY_STATUS = {
  placed: { label: "Processing", cls: "bg-yellow-100 text-yellow-800", cardBg: "bg-yellow-500" },
  accepted: { label: "In Transit", cls: "bg-blue-100 text-blue-800", cardBg: "bg-blue-300" },
  out_for_delivery: { label: "Out for Delivery", cls: "bg-orange-100 text-orange-800", cardBg: "bg-orange-300" },
  delivered: { label: "Delivered", cls: "bg-green-100 text-green-800", cardBg: "bg-green-600" },
  undelivered: { label: "Undelivered", cls: "bg-red-100 text-red-800", cardBg: "bg-red-600" },
};

const STAT_CARDS = [
  { key: "placed", label: "Processing", cardBg: "bg-yellow-500" },
  { key: "accepted", label: "In Transit", cardBg: "bg-blue-300" },
  { key: "out_for_delivery", label: "Out for Delivery", cardBg: "bg-orange-300" },
  { key: "delivered", label: "Delivered", cardBg: "bg-green-600" },
  { key: "undelivered", label: "Undelivered", cardBg: "bg-red-600" },
];

const PAGE_SIZE = 10;

const effStatus = (o) => o.deliveryStatus || "placed";
const statusMeta = (o) => DELIVERY_STATUS[effStatus(o)] || DELIVERY_STATUS.placed;

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) {
    try { return new URL(image).pathname; } catch { return image; }
  }
  if (!image.startsWith("/")) return `/${image}`;
  return image;
};

// Seller (Sangam Wholesale) details shown in the invoice "From" block.
// TODO: replace `address` (and optionally `phone`) with the exact shop details.
const SELLER = {
  name: "SANGAM WHOLESALE PVT. LTD.",
  address: "Shop No:2, 1st Floor, Umapathi Building, 9th Main Road, Weavers Colony, Anekal, Bengaluru – 562106",
  gstin: "29ABUCS3779C1ZM",
  cin: "U46901KA2026PTC224184",
  phone: "",
};

const Orders = () => {
  const { token } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [invoiceItem, setInvoiceItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (token) fetchOrders(); }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/admin/all", {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-store" },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      else setError(data.message || "Failed to fetch orders");
    } catch {
      setError("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((order) => {
    const name = order.user?.userDetails?.fullName || order.user?.phone || "";
    const matchSearch =
      search === "" ||
      (order.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || effStatus(order) === filterStatus;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    const id = deleteItem._id;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Read defensively — an error response may not always be JSON
      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        /* no body */
      }

      // A 404 means the order is already gone — treat that as deleted
      if (res.ok || res.status === 404 || data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        setDeleteItem(null);
        setError(null);
      } else {
        setError(data.message || "Could not delete order");
      }
    } catch (e) {
      setError("Could not delete order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Print styles — hide the app, show only the portaled invoice */}
      {invoiceItem && (
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 14mm; }
            html, body { background: #fff !important; }
            body > *:not(.invoice-portal) { display: none !important; }
            .invoice-portal { display: block !important; }
            .invoice-portal .invoice-backdrop {
              display: block !important; position: static !important;
              background: none !important; padding: 0 !important; overflow: visible !important;
            }
            .invoice-portal .invoice-card-wrap {
              width: 100% !important; max-width: 100% !important; margin: 0 !important;
            }
            .invoice-portal .no-print { display: none !important; }
            .invoice-portal .invoice-print {
              width: 100% !important; max-width: 100% !important;
              margin: 0 !important; padding: 0 !important;
              box-shadow: none !important; border-radius: 0 !important;
            }
          }
        `}</style>
      )}

      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live order status, updated automatically by the delivery partner.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: "#702834" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {STAT_CARDS.map(({ key, label, cardBg }) => (
          <div key={key} className={`${cardBg} rounded-lg shadow-sm p-3 text-center`}>
            <p className="text-2xl font-bold text-white">
              {orders.filter((o) => effStatus(o) === key).length}
            </p>
            <span className="text-xs font-semibold mt-1 text-white/90 inline-block">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by Order ID or Customer..."
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
          {STAT_CARDS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading orders...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No orders found.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Order ID", "Customer", "Items", "Total", "Delivery Partner", "Status", "Created At", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((order) => {
                  const meta = statusMeta(order);
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-blue-700">{order.orderId}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          {order.user?.userDetails?.fullName || order.addressName || "—"}
                        </div>
                        <div className="text-xs text-gray-400">{order.user?.phone || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.items?.[0]?.name}
                        {order.items?.length > 1 && (
                          <span className="text-xs text-gray-400"> +{order.items.length - 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₹{order.total}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {order.deliveryPartner ? (
                          <div>
                            <div className="text-sm font-medium text-gray-800">{order.deliveryPartner.name}</div>
                            <div className="text-xs text-gray-400">{order.deliveryPartner.driverId}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not accepted yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewItem(order)}
                            className="inline-flex items-center gap-1 bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            <MdVisibility className="text-base" /> View
                          </button>
                          <button
                            onClick={() => setInvoiceItem(order)}
                            className="inline-flex items-center gap-1 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                            style={{ backgroundColor: "#702834" }}
                          >
                            <MdReceipt className="text-base" /> Invoice
                          </button>
                          <button
                            onClick={() => setDeleteItem(order)}
                            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            <MdDeleteOutline className="text-base" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p - arr[idx - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-lg text-sm font-medium border transition-colors"
                      style={
                        p === currentPage
                          ? { backgroundColor: "#702834", color: "#fff", borderColor: "#702834" }
                          : { borderColor: "#d1d5db", color: "#374151" }
                      }
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* View modal */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#702834" }}>
              <h3 className="text-base font-bold text-white">Order {viewItem.orderId}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white">
                <MdClose />
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta(viewItem).cls}`}>
                  {statusMeta(viewItem).label}
                </span>
                <span className="text-lg font-extrabold" style={{ color: "#702834" }}>₹{viewItem.total}</span>
              </div>

              {/* Customer */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Customer</p>
                <p className="text-sm font-medium text-gray-800">
                  {viewItem.user?.userDetails?.fullName || viewItem.addressName || "—"}
                </p>
                <p className="text-xs text-gray-500">{viewItem.addressContact || viewItem.user?.phone}</p>
                <p className="text-sm text-gray-600 mt-1">{viewItem.deliveryAddress}</p>
              </div>

              {/* Delivery partner */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                  <MdTwoWheeler /> Delivery Partner
                </p>
                {viewItem.deliveryPartner ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800">{viewItem.deliveryPartner.name}</p>
                    <p className="text-xs text-gray-500">
                      {viewItem.deliveryPartner.driverId} · {viewItem.deliveryPartner.phone}
                    </p>
                    {viewItem.acceptedAt && (
                      <p className="text-xs text-gray-400">Accepted: {new Date(viewItem.acceptedAt).toLocaleString()}</p>
                    )}
                    {viewItem.deliveredAt && (
                      <p className="text-xs text-gray-400">Delivered: {new Date(viewItem.deliveredAt).toLocaleString()}</p>
                    )}
                    {viewItem.deliveryRemarks && (
                      <p className="text-xs text-red-500">Remarks: {viewItem.deliveryRemarks}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No partner has accepted this order yet.</p>
                )}
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Items ({viewItem.items?.length || 0})
                </p>
                <div className="space-y-2">
                  {viewItem.items?.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      {getImageUrl(item.image) ? (
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-10 h-10 rounded object-cover border" onError={(e) => (e.target.style.display = "none")} />
                      ) : (
                        <div className="w-10 h-10 rounded border bg-gray-100" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">₹{(item.price || 0) * (item.quantity || 1)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="border-t border-gray-100 pt-4 flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium text-gray-800 capitalize">
                  {viewItem.paymentMethod === "cod" ? "Cash on Delivery" : viewItem.paymentMethod}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewItem(null)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
          onClick={() => !deleting && setDeleteItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <MdDeleteOutline className="text-3xl text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Order?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This permanently removes order{" "}
              <span className="font-semibold text-gray-700">
                {deleteItem.orderId}
              </span>{" "}
              worth ₹{deleteItem.total}. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal — portaled to <body> so only the invoice prints */}
      {invoiceItem && createPortal((() => {
        const inv = invoiceItem;
        const items = inv.items || [];
        const subtotal =
          inv.subtotal ??
          items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
        const gst = inv.gst ?? 0;
        const total = inv.total ?? subtotal + gst;
        const custName = inv.user?.userDetails?.fullName || inv.addressName || "—";
        const custPhone = inv.addressContact || inv.user?.phone || "";
        const custBiz = inv.customerBusiness || null;
        const toName = custBiz?.businessName || inv.addressName || custName;
        const toGst = custBiz?.gstNumber || "";
        return (
          <div className="invoice-portal">
          <div
            className="invoice-backdrop fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={() => setInvoiceItem(null)}
          >
            <div className="invoice-card-wrap w-full max-w-2xl my-6" onClick={(e) => e.stopPropagation()}>
              {/* Actions — hidden when printing */}
              <div className="no-print flex justify-end gap-2 mb-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
                  style={{ backgroundColor: "#702834" }}
                >
                  <MdPrint /> Print Invoice
                </button>
                <button
                  onClick={() => setInvoiceItem(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MdClose /> Close
                </button>
              </div>

              {/* Invoice — this is what prints */}
              <div className="invoice-print bg-white rounded-xl shadow-lg p-8 text-gray-800">
                {/* Brand + invoice meta */}
                <div className="flex items-start justify-between border-b-2 pb-4 mb-6" style={{ borderColor: "#702834" }}>
                  <div>
                    <h1 className="text-2xl font-extrabold" style={{ color: "#702834" }}>Sangam Wholesale</h1>
                    <p className="text-xs text-gray-500 mt-1">Tax Invoice</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">INVOICE</p>
                    <p className="text-sm text-gray-600">#{inv.orderId}</p>
                    <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-2 gap-6 mb-5">
                  {/* From — seller */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">From</p>
                    <p className="text-sm font-bold text-gray-800">{SELLER.name}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{SELLER.address}</p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="text-gray-400">GSTIN:</span> {SELLER.gstin}
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      <span className="text-gray-400">CIN:</span> {SELLER.cin}
                    </p>
                    {SELLER.phone && <p className="text-xs text-gray-500">{SELLER.phone}</p>}
                  </div>
                  {/* To — buyer */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Bill To</p>
                    <p className="text-sm font-bold text-gray-800">{toName}</p>
                    {custPhone && <p className="text-xs text-gray-500">{custPhone}</p>}
                    {toGst && (
                      <p className="text-xs text-gray-700 mt-1">
                        <span className="text-gray-400">GSTIN:</span> {toGst}
                      </p>
                    )}
                    {inv.deliveryAddress && (
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{inv.deliveryAddress}</p>
                    )}
                  </div>
                </div>

                {/* Meta strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs border-y border-gray-100 py-3">
                  <div>
                    <p className="text-gray-400">Invoice Date</p>
                    <p className="text-gray-700 font-medium">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-gray-700 font-medium">{statusMeta(inv).label}</p>
                  </div>
                  {inv.deliveredAt && (
                    <div>
                      <p className="text-gray-400">Delivered</p>
                      <p className="text-gray-700 font-medium">{new Date(inv.deliveredAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Payment</p>
                    <p className="text-gray-700 font-medium capitalize">
                      {inv.paymentMethod === "cod" ? "Cash on Delivery" : inv.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#702834" }}>
                      <th className="text-left py-2 text-xs font-bold uppercase text-gray-500">#</th>
                      <th className="text-left py-2 text-xs font-bold uppercase text-gray-500">Item</th>
                      <th className="text-right py-2 text-xs font-bold uppercase text-gray-500">Qty</th>
                      <th className="text-right py-2 text-xs font-bold uppercase text-gray-500">Price</th>
                      <th className="text-right py-2 text-xs font-bold uppercase text-gray-500">GST %</th>
                      <th className="text-right py-2 text-xs font-bold uppercase text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={it._id || i} className="border-b border-gray-100">
                        <td className="py-2 text-gray-500">{i + 1}</td>
                        <td className="py-2 text-gray-800">{it.name}</td>
                        <td className="py-2 text-right text-gray-700">
                          {it.quantity}{it.unit ? ` ${it.unit}` : ""}
                        </td>
                        <td className="py-2 text-right text-gray-700">₹{it.price}</td>
                        <td className="py-2 text-right text-gray-700">{it.gst != null ? `${Number(it.gst)}%` : "—"}</td>
                        <td className="py-2 text-right font-medium text-gray-800">
                          ₹{(it.price || 0) * (it.quantity || 1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-800">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">GST</span>
                      <span className="text-gray-800">₹{gst}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold" style={{ color: "#702834" }}>
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                </div>

                {/* Notes + footer */}
                {inv.orderNotes && (
                  <p className="text-xs text-gray-500 mb-4">
                    <span className="font-semibold">Note:</span> {inv.orderNotes}
                  </p>
                )}
                <div className="border-t border-gray-100 pt-4 text-center">
                  <p className="text-sm font-semibold text-gray-700">Thank you for your business!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Sangam Wholesale · This is a computer-generated invoice.
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        );
        })(),
        document.body
      )}
    </div>
  );
};

export default Orders;
