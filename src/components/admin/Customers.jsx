import React, { useState, useEffect } from "react";
import { MdVisibility, MdClose, MdPeople, MdDeleteOutline } from "react-icons/md";
import { useAdmin } from "../context/AdminContext";

const USERS_URL = "/api/user/all";
const BUSINESS_URL = "/api/admin/business";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

/**
 * Unified Customers page — merges Users + Businesses.
 * Lists every registered customer with their business/KYC status, and the
 * View modal shows profile + business details together with approve/reject.
 */
const Customers = () => {
  const { token } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: null, business: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}`, "Cache-Control": "no-store" };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, bizRes] = await Promise.all([
        fetch(USERS_URL, { headers: authHeaders }).then((r) => r.json()),
        fetch(`${BUSINESS_URL}/all`, { headers: authHeaders }).then((r) => r.json()),
      ]);

      const users = usersRes.success ? usersRes.users : [];
      const businesses = bizRes.success ? bizRes.businesses : [];

      // Index businesses by their userId for quick linking.
      const bizByUser = {};
      businesses.forEach((b) => {
        const uid = b.userId?._id || b.userId;
        if (uid) bizByUser[uid] = b;
      });

      const merged = users.map((u) => ({
        ...u,
        business: bizByUser[u._id] || null,
      }));

      setRows(merged);
    } catch (err) {
      setError("Error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleApprove = async (businessId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${BUSINESS_URL}/approve/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvalStatus: "approved" }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        setActionModal({ open: false, type: null, business: null });
        setViewItem(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (businessId) => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BUSINESS_URL}/approve/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvalStatus: "rejected", rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        setActionModal({ open: false, type: null, business: null });
        setViewItem(null);
        setRejectionReason("");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/admin/${deleteItem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRows((prev) => prev.filter((r) => r._id !== deleteItem._id));
        setDeleteItem(null);
      } else {
        setError(data.message || "Could not delete customer");
      }
    } catch (e) {
      setError("Could not delete customer");
    } finally {
      setDeleting(false);
    }
  };

  const bizStatusBadge = (biz) => {
    if (!biz) return <span className="text-gray-400 text-xs">No business</span>;
    const s = biz.approvalStatus || "pending";
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[s] || "bg-gray-100 text-gray-700"}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdPeople className="text-3xl" style={{ color: "#702834" }} />
            Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All registered users and their business / KYC details.
          </p>
        </div>
        <div className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: "#702834" }}>
          {rows.length} Customer{rows.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Customer", "Phone", "Email", "Business", "Business Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No customers found.</td></tr>
            ) : (
              rows.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {u.userDetails?.fullName || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.userDetails?.email || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {u.business?.businessName || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{bizStatusBadge(u.business)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewItem(u)}
                        className="inline-flex items-center gap-1 bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                      >
                        <MdVisibility className="text-base" /> View
                      </button>
                      <button
                        onClick={() => setDeleteItem(u)}
                        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                      >
                        <MdDeleteOutline className="text-base" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal — profile + business together */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#702834" }}>
              <h3 className="text-base font-bold text-white">
                {viewItem.userDetails?.fullName || viewItem.phone}
              </h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white">
                <MdClose />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Profile */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Profile</p>
                <div className="space-y-2">
                  {[
                    { label: "Full Name", value: viewItem.userDetails?.fullName },
                    { label: "Phone", value: viewItem.phone },
                    { label: "Email", value: viewItem.userDetails?.email },
                    { label: "Profile Completed", value: viewItem.userDetails?.isCompleted ? "Yes" : "No" },
                    { label: "User ID", value: viewItem._id },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-sm text-gray-800 font-medium text-right break-all">{value}</span>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Business */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Business</p>
                {viewItem.business ? (
                  <div className="space-y-2">
                    {[
                      { label: "Business Name", value: viewItem.business.businessName },
                      { label: "GST Number", value: viewItem.business.gstNumber },
                      { label: "Category", value: viewItem.business.category },
                      { label: "Est. Year", value: viewItem.business.establishmentYear },
                      { label: "Status", value: viewItem.business.approvalStatus },
                    ].map(({ label, value }) => value ? (
                      <div key={label} className="flex justify-between gap-4">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-sm text-gray-800 font-medium text-right capitalize break-all">{value}</span>
                      </div>
                    ) : null)}
                    {viewItem.business.approvalStatus === "rejected" && viewItem.business.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {viewItem.business.rejectionReason}</p>
                    )}

                    {/* Approve / Reject */}
                    {viewItem.business.approvalStatus === "pending" && (
                      <div className="flex gap-2 pt-3">
                        <button
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                          onClick={() => setActionModal({ open: true, type: "approve", business: viewItem.business })}
                        >
                          Approve
                        </button>
                        <button
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                          onClick={() => setActionModal({ open: true, type: "reject", business: viewItem.business })}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">This customer has not added a business yet.</p>
                )}
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

      {/* Approve / Reject confirmation */}
      {actionModal.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
          onClick={() => setActionModal({ open: false, type: null, business: null })}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">
              {actionModal.type === "approve" ? "Approve Business" : "Reject Business"}
            </h3>
            <div className="font-medium mb-3">{actionModal.business.businessName}</div>
            {actionModal.type === "reject" && (
              <textarea
                className="w-full border rounded px-2 py-1 mb-3"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => { setActionModal({ open: false, type: null, business: null }); setRejectionReason(""); }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              {actionModal.type === "approve" ? (
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleApprove(actionModal.business._id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Approving…" : "Approve"}
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleReject(actionModal.business._id)}
                  disabled={actionLoading || !rejectionReason.trim()}
                >
                  {actionLoading ? "Rejecting…" : "Reject"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
          onClick={() => !deleting && setDeleteItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <MdDeleteOutline className="text-3xl text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Customer?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This permanently removes{" "}
              <span className="font-semibold text-gray-700">
                {deleteItem.userDetails?.fullName || deleteItem.phone}
              </span>{" "}
              and all their orders, addresses and business data. This can't be undone.
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
    </div>
  );
};

export default Customers;
