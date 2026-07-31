import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X, Upload, Search } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

const API_BASE_URL = "/api/admin/business";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const Businesses = () => {
  const { token } = useAdmin();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    business: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-store",
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setBusinesses(data.businesses);
        } else {
          setError(data.message || "Failed to fetch businesses");
          console.error("Fetch businesses error:", data);
        }
      } catch (err) {
        setError("Error fetching businesses");
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBusinesses();
  }, [token]);

  // Approve business
  const handleApprove = async (businessId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/approve/${businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus: "approved" }),
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b._id === businessId
              ? { ...b, approvalStatus: "approved", isApproved: true }
              : b
          )
        );
        setActionModal({ open: false, type: null, business: null });
      } else {
        setError("Failed to approve business");
      }
    } catch (err) {
      setError("Error approving business");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject business
  const handleReject = async (businessId) => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/approve/${businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus: "rejected", rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b._id === businessId
              ? {
                  ...b,
                  approvalStatus: "rejected",
                  isApproved: false,
                  rejectionReason,
                }
              : b
          )
        );
        setActionModal({ open: false, type: null, business: null });
        setRejectionReason("");
      } else {
        setError("Failed to reject business");
      }
    } catch (err) {
      setError("Error rejecting business");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter businesses by status
  const filteredBusinesses =
    statusFilter === "all"
      ? businesses
      : businesses.filter((b) => b.approvalStatus === statusFilter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Business Management
        </h2>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                statusFilter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading businesses...
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No businesses found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  GST Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  isCompleted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Approval Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBusinesses.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">
                    {b.businessName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {b.gstNumber || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.userId ? (
                      <div>
                        <div className="font-medium">
                          {b.userId.userDetails?.fullName || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.userId.userDetails?.email || b.userId.phone || "-"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.isCompleted ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        statusColors[b.approvalStatus] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.approvalStatus}
                    </span>
                    {b.approvalStatus === "rejected" && b.rejectionReason && (
                      <div className="text-xs text-red-500 mt-1">
                        {b.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.approvalStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          onClick={() =>
                            setActionModal({
                              open: true,
                              type: "approve",
                              business: b,
                            })
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          onClick={() =>
                            setActionModal({
                              open: true,
                              type: "reject",
                              business: b,
                            })
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Approve/Reject Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {actionModal.type === "approve"
                ? "Approve Business"
                : "Reject Business"}
            </h3>
            <div className="mb-4">
              <div className="font-medium mb-2">
                Business: {actionModal.business.businessName}
              </div>
              {actionModal.business.gstNumber && (
                <div className="text-sm text-gray-500 mb-2">
                  GST: {actionModal.business.gstNumber}
                </div>
              )}
              <div className="text-sm text-gray-500 mb-2">
                User:{" "}
                {actionModal.business.userId?.userDetails?.fullName || "-"}
              </div>
              {actionModal.type === "reject" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setActionModal({ open: false, type: null, business: null });
                  setRejectionReason("");
                }}
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
                  {actionLoading ? "Approving..." : "Approve"}
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleReject(actionModal.business._id)}
                  disabled={actionLoading || !rejectionReason.trim()}
                >
                  {actionLoading ? "Rejecting..." : "Reject"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
