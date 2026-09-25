import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "../context/AdminContext";
import { MdDeleteOutline, MdVisibility, MdTwoWheeler, MdClose } from "react-icons/md";

const API_URL = "https://sangamwholesale.com/api/admin/drivers";
const DOC_BASE = "https://sangamwholesale.com/driverDocs";

const DeliveryPartners = () => {
  const { token } = useAdmin();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, authHeaders);
      if (res.data && res.data.success) {
        setDrivers(res.data.drivers);
      } else {
        setError("Failed to fetch delivery partners");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching delivery partners"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/${deleteItem._id}`, authHeaders);
      setDrivers((prev) => prev.filter((d) => d._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete partner");
    } finally {
      setDeleting(false);
    }
  };

  const initials = (name) =>
    (name || "D P")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdTwoWheeler className="text-3xl" style={{ color: "#702834" }} />
            Delivery Partners
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All partners registered in the delivery app.
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ backgroundColor: "#702834" }}
        >
          {drivers.length} Partner{drivers.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Partner", "Driver ID", "Phone", "Email", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  No delivery partners registered yet.
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: "#702834" }}
                      >
                        {initials(d.name)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {d.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {d.driverId || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {d.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {d.email || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {d.blockstatus ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewItem(d)}
                        className="inline-flex items-center gap-1 bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                      >
                        <MdVisibility className="text-base" /> View
                      </button>
                      <button
                        onClick={() => setDeleteItem(d)}
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

      {/* View Modal */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ backgroundColor: "#702834" }}
            >
              <h3 className="text-base font-bold text-white">
                {viewItem.name || viewItem.phone}
              </h3>
              <button
                onClick={() => setViewItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <MdClose />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-center mb-2">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: "#702834" }}
                >
                  {initials(viewItem.name)}
                </div>
              </div>
              {[
                { label: "Name", value: viewItem.name },
                { label: "Driver ID", value: viewItem.driverId },
                { label: "Phone", value: viewItem.phone },
                { label: "Email", value: viewItem.email },
                { label: "Status", value: viewItem.blockstatus ? "Blocked" : "Active" },
                {
                  label: "Registered",
                  value: viewItem.createdAt
                    ? new Date(viewItem.createdAt).toLocaleString()
                    : null,
                },
                { label: "Partner ID", value: viewItem._id },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="text-gray-800 text-sm font-medium break-all">
                      {value}
                    </p>
                  </div>
                ) : null
              )}

              {/* KYC Documents */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  KYC Documents
                </p>
                {(() => {
                  const docs = [
                    { label: "Aadhaar Front", file: viewItem.aadharFront },
                    { label: "Aadhaar Back", file: viewItem.aadharBack },
                    { label: "PAN Card", file: viewItem.panImage },
                    { label: "Driving License", file: viewItem.dlImage },
                  ];
                  const hasAny = docs.some((d) => d.file);
                  if (!hasAny) {
                    return (
                      <p className="text-sm text-gray-400 italic">
                        No documents uploaded.
                      </p>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {docs.map(({ label, file }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs text-gray-600 mb-1 font-medium">
                            {label}
                          </p>
                          {file ? (
                            <a
                              href={`${DOC_BASE}/${file}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open full size"
                            >
                              <img
                                src={`${DOC_BASE}/${file}`}
                                alt={label}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                                onError={(e) => {
                                  e.target.src =
                                    "data:image/svg+xml;charset=utf-8," +
                                    encodeURIComponent(
                                      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f1f5f9"/><text x="50" y="54" font-size="10" fill="#94a3b8" text-anchor="middle">No image</text></svg>'
                                    );
                                }}
                              />
                            </a>
                          ) : (
                            <div className="w-full h-24 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                              Not uploaded
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setViewItem(null)}
                className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Delete Delivery Partner?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-700">
                {deleteItem.name || deleteItem.phone}
              </span>
              ? This can't be undone.
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

export default DeliveryPartners;
