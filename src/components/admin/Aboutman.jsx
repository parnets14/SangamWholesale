import React, { useState, useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const Aboutman = () => {
  const [founders, setFounders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const API_BASE_URL = "/api/Founder";

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
      image: null, // Reset image, will show existing one in preview
    });
    setShowModal(true);
    setError("");
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

      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim()) {
        setError("Name and description are required");
        setLoading(false);
        return;
      }

      // For new founder, image is required
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

      const url = currentItem
        ? `${API_BASE_URL}/${currentItem._id}`
        : API_BASE_URL;

      const method = currentItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();

        if (currentItem) {
          // Update existing founder
          setFounders(
            founders.map((item) =>
              item._id === currentItem._id ? result : item
            )
          );
        } else {
          // Add new founder
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
    // Relative path — proxied to backend in dev, served directly in production
    return `/${imagePath}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Founder Management</h2>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded"
        >
          + Add Founder
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Image</th>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Description</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {founders.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No founders found
                </td>
              </tr>
            ) : (
              founders.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 border-b">
                  <td className="p-3">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      disabled={loading}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:bg-yellow-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={loading}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {currentItem ? "Edit Founder" : "Add Founder"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xl font-bold text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Image is required for new founder
                  </p>
                )}
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Image Preview:
                  </label>
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-full h-32 object-contain border rounded"
                  />
                </div>
              )}

              {/* Current Image (for edit mode) */}
              {currentItem && !formData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Image:
                  </label>
                  <img
                    src={getImageUrl(currentItem.image)}
                    alt="Current"
                    className="w-full h-32 object-contain border rounded"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
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
