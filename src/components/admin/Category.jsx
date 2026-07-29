import React, { useState, useEffect } from "react";
import { useAdminApi } from "../context/AdminApiContext";
import toast from "react-hot-toast";
import dummyimage from "../../assets/images/dummyimage.jpg";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";
const Category = () => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminApi();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories().catch((err) => {
      toast.error("Failed to load categories");
    });
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Open modal for adding new category
  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      image: null,
    });
    setImagePreview(null);
    setIsModalVisible(true);
  };

  // Open modal for editing category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: null,
    });
    setImagePreview(
      category.image
        ? `https://sangamwholesale.com/categories/${category.image}`
        : null || dummyimage
    );
    setIsModalVisible(true);
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, categoryData);
        toast.success("Category updated successfully");
      } else {
        await createCategory(categoryData);
        toast.success("Category created successfully");
      }

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        image: null,
      });
      setImagePreview(null);
      setIsModalVisible(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error(
        editingCategory
          ? "Failed to update category"
          : "Failed to create category"
      );
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData({
      name: "",
      description: "",
      image: null,
    });
    setImagePreview(null);
    setEditingCategory(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button
            onClick={() => fetchCategories()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Category Management
        </h1>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No categories found</div>
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Category Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {category.image ? (
                  <img
                    src={`https://sangamwholesale.com/categories/${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p>No Image</p>
                  </div>
                )}
              </div>

              {/* Category Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>

                {/* Category Meta */}
                <div className="text-xs text-gray-500 mb-4">
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 2MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
