import React, { useState, useEffect } from "react";
import {
  MdVisibility,
  MdClose,
  MdPeople,
  MdDeleteOutline,
  MdPhone,
  MdEmail,
  MdStorefront,
} from "react-icons/md";
import { useAdmin } from "../context/AdminContext";

const USERS_URL = "/api/user/all";
const BUSINESS_URL = "/api/admin/business";

const BRAND = "#702834";
const PAGE_SIZE = 10;

// Build a compact page list, e.g. 1 … 4 5 6 … 20
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  wanted.forEach((p) => {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  });
  return out;
};

// Initials for the customer avatar, e.g. "Kiran" -> "K", "San Kumar" -> "SK"
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

/**
 * Unified Customers page — merges Users + Businesses.
 * Lists every registered customer with their profile / business / KYC details.
 */
const Customers = () => {
  const { token } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

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

  const handleDelete = async () => {
    if (!deleteItem) return;
    const id = deleteItem._id;
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/admin/${id}`, {
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

      // A 404 means the customer is already gone (e.g. an earlier attempt
      // succeeded). Treat that as deleted instead of showing "User not found".
      const alreadyGone = res.status === 404;
      if (res.ok || alreadyGone || data.success) {
        setRows((prev) => prev.filter((r) => r._id !== id));
        setDeleteItem(null);
        setError(null);
      } else {
        setError(data.message || "Could not delete customer");
      }
    } catch (e) {
      setError("Could not delete customer");
    } finally {
      setDeleting(false);
    }
  };

  const thClass =
    "px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap";

  // Pagination — clamp the page so deleting rows can never strand us on an empty page
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdPeople className="text-3xl" style={{ color: BRAND }} />
            Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All registered users and their business / KYC details.
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-sm"
          style={{ backgroundColor: BRAND }}
        >
          {rows.length} Customer{rows.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: "#fdf6f7" }}>
                {["Customer", "Phone", "Email", "Business", "Actions"].map((h) => (
                  <th key={h} className={thClass} style={{ color: BRAND }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-3" style={{ borderColor: BRAND }} />
                    <div>Loading customers…</div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <MdPeople className="text-4xl mx-auto mb-2 text-gray-300" />
                    No customers found.
                  </td>
                </tr>
              ) : (
                pagedRows.map((u) => {
                  const name = u.userDetails?.fullName || u.phone || "—";
                  return (
                    <tr key={u._id} className="transition-colors hover:bg-[#fdf6f7]">
                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: BRAND }}
                          >
                            {getInitials(u.userDetails?.fullName)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            {u.userDetails?.fullName || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <MdPhone className="text-gray-400" />
                          {u.phone || "—"}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.userDetails?.email ? (
                          <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <MdEmail className="text-gray-400" />
                            {u.userDetails.email}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Business */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.business?.businessName ? (
                          <div className="flex items-center gap-2">
                            <MdStorefront className="text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-800 font-medium">
                                {u.business.businessName}
                              </div>
                              {u.business.category && (
                                <div className="text-xs text-gray-400">
                                  {u.business.category}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No business</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewItem(u)}
                            className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                          >
                            <MdVisibility className="text-base" /> View
                          </button>
                          <button
                            onClick={() => setDeleteItem(u)}
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                          >
                            <MdDeleteOutline className="text-base" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap mt-5 px-1">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">{startIndex + 1}</span>–
            <span className="font-semibold text-gray-700">
              {Math.min(startIndex + PAGE_SIZE, rows.length)}
            </span>{" "}
            of <span className="font-semibold text-gray-700">{rows.length}</span>{" "}
            customer{rows.length !== 1 ? "s" : ""}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>

            {getPageNumbers(safePage, totalPages).map((n, i) =>
              n === "…" ? (
                <span key={`gap-${i}`} className="px-1.5 text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="min-w-[36px] px-2.5 py-1.5 rounded-lg border text-sm font-semibold transition-colors"
                  style={
                    n === safePage
                      ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                      : { borderColor: "#e5e7eb", color: "#4b5563" }
                  }
                  onMouseEnter={(e) => {
                    if (n !== safePage) e.currentTarget.style.backgroundColor = "#fdf6f7";
                  }}
                  onMouseLeave={(e) => {
                    if (n !== safePage) e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Modal — profile + business together */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 py-4" style={{ backgroundColor: BRAND }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {getInitials(viewItem.userDetails?.fullName)}
              </div>
              <h3 className="text-base font-bold text-white flex-1">
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
                    ].map(({ label, value }) => value ? (
                      <div key={label} className="flex justify-between gap-4">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-sm text-gray-800 font-medium text-right capitalize break-all">{value}</span>
                      </div>
                    ) : null)}
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
