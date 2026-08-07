import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const Aboutman = () => {
  const [founders, setFounders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const API_BASE_URL = "/api/Team";

  const getToken = () => localStorage.getItem("adminToken");

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setFounders(data);
      } else {
        setError("Failed to fetch founders");
      }
    } catch (error) {
      setError("Error connecting to server");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: "", description: "", image: null });
    setShowModal(true);
    setError("");
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      image: null,
    });
    setShowModal(true);
    setError("");
  };

  const handleView = (item) => {
    setViewItem(item);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this founder?")) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (response.ok) {
          setFounders(founders.filter((item) => item._id !== id));
        } else {
          setError("Failed to delete founder");
        }
      } catch (error) {
        setError("Error deleting founder");
        console.error("Delete error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      if (!formData.name.trim() || !formData.description.trim()) {
        setError("Name and description are required");
        setLoading(false);
        return;
      }

      if (!currentItem && !formData.image) {
        setError("Image is required");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const url = currentItem ? `${API_BASE_URL}/${currentItem._id}` : API_BASE_URL;
      const method = currentItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        if (currentItem) {
          setFounders(founders.map((item) => item._id === currentItem._id ? result : item));
        } else {
          setFounders([result, ...founders]);
        }
        setShowModal(false);
        setFormData({ name: "", description: "", image: null });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save founder");
      }
    } catch (error) {
      setError("Error saving founder");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    return `/${imagePath}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Leadership Team</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team members shown on the Leadership section.</p>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "#702834" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
        >
          + Add Member
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {founders.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No founders found
                  </td>
                </tr>
              ) : (
                founders.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleView(item)}
                          className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1 rounded text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={loading}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={loading}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{viewItem.name}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <img
                src={getImageUrl(viewItem.image)}
                alt={viewItem.name}
                className="w-full h-48 object-cover rounded-lg border border-gray-100"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</p>
                <p className="text-gray-800 font-medium">{viewItem.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{viewItem.description}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewItem(null)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {currentItem ? "Edit Founder" : "Add Founder"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter founder name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  placeholder="Enter founder description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image {!currentItem && "*"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {!currentItem && (
                  <p className="text-xs text-gray-500 mt-1">Image is required for new member</p>
                )}
              </div>

              {formData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Image Preview:</label>
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-full h-32 object-contain border rounded"
                  />
                </div>
              )}

              {currentItem && !formData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Image:</label>
                  <img
                    src={getImageUrl(currentItem.image)}
                    alt="Current"
                    className="w-full h-32 object-contain border rounded"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-[#702834] hover:bg-[#5a1f29] text-white rounded disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aboutman;
