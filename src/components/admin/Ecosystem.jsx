import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, X, Loader } from "lucide-react";

const API_BASE_URL = "https://sangamwholesale.com/api/Eco";

const Ecosystem = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    numbers: "",
    title: "",
  });

  // Fetch all ecosystem items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Failed to load ecosystem items");
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormData({
      numbers: items.length + 1,
      title: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      numbers: item.numbers,
      title: item.title,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }

        // Refresh the list after successful deletion
        await fetchItems();
        alert("Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSubmitting(true);

    try {
      const requestData = {
        numbers: parseInt(formData.numbers),
        title: formData.title,
      };

      let response;

      if (currentItem) {
        // Update existing item
        response = await fetch(`${API_BASE_URL}/${currentItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Add new item
        response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save item");
      }

      // Refresh the list after successful save
      await fetchItems();
      setIsModalOpen(false);
      alert(
        currentItem ? "Item updated successfully" : "Item created successfully"
      );
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : num.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading ecosystem items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Our Ecosystem</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No ecosystem items found.</p>
          <button
            onClick={handleAddNew}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 font-mono text-sm">
                    {formatNumber(item.numbers)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {currentItem ? "Edit Item" : "Add New Item"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={submitting}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number
                </label>
                <input
                  type="number"
                  name="numbers"
                  value={formData.numbers}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  placeholder="e.g. 1, 2, 3"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter title"
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader className="animate-spin h-4 w-4" />}
                  {submitting ? "Saving..." : currentItem ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ecosystem;
