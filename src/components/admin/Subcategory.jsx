import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Upload,
  Spin,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAdmin } from "../context/AdminContext";
import Pagination, { DEFAULT_PAGE_SIZE } from "./Pagination";

const API_BASE = "/api";

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `/subcategories/${image}`;
};

const Subcategory = () => {
  const { token, isAdminAuthenticated } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  // Pagination — clamp the page so deleting/filtering can never strand us on an empty page
  const PAGE_SIZE = DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(subcategories.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedSubcategories = subcategories.slice(startIndex, startIndex + PAGE_SIZE);

  // Go back to page 1 whenever the category filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const authHeaders = (extra = {}) => ({
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Cache-Control": "no-store",
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/categories/`, {
        headers: authHeaders(),
      });
      const categoriesData = response.data?.categories || response.data || [];
      setCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch subcategories (optionally filtered by category)
  const fetchSubcategories = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/subcategories/`, {
        headers: authHeaders(),
      });
      let subcats = response.data?.subcategories || response.data || [];
      if (categoryId) {
        // handle both a populated category object and a raw id string
        subcats = subcats.filter((sub) => {
          const subCategoryId =
            typeof sub.category === "string" ? sub.category : sub.category?._id;
          return subCategoryId === categoryId;
        });
      }
      setSubcategories(subcats);
    } catch (err) {
      setError("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchSubcategories(selectedCategory);
    // eslint-disable-next-line
  }, [selectedCategory]);

  // Modal open for add/edit
  const openModal = (subcat = null) => {
    setEditingSubcategory(subcat);
    setFileList(
      subcat?.image
        ? [
            {
              uid: "-1",
              name: "current-image",
              status: "done",
              url: getImageUrl(subcat.image),
            },
          ]
        : []
    );
    // Set fields after modal opens (avoids useForm disconnect warning)
    setTimeout(() => {
      if (subcat) {
        form.setFieldsValue({
          name: subcat.name || "",
          description: subcat.description || "",
          categoryId: subcat.category?._id,
        });
      } else {
        form.resetFields();
      }
    }, 0);
    setIsModalVisible(true);
  };

  // Modal close
  const closeModal = () => {
    setIsModalVisible(false);
    setEditingSubcategory(null);
    setFileList([]);
    form.resetFields();
  };

  // Handle add/edit submit
  const handleSubmit = async () => {
    if (!isAdminAuthenticated) {
      message.error("You must be logged in as admin to perform this action.");
      return;
    }
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formData = new FormData();
      // Backend expects: name, description, categoryId
      // description is optional — send an empty string rather than "undefined"
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("categoryId", values.categoryId);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      if (editingSubcategory) {
        await axios.put(
          `${API_BASE}/subcategories/${editingSubcategory._id}`,
          formData,
          { headers }
        );
        message.success("Subcategory updated successfully");
      } else {
        await axios.post(`${API_BASE}/subcategories/`, formData, { headers });
        message.success("Subcategory created successfully");
      }
      closeModal();
      fetchSubcategories(selectedCategory);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save subcategory";
      message.error(msg);
      console.error("Subcategory save error:", err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete subcategory
  const handleDelete = async (subcat) => {
    if (!isAdminAuthenticated) {
      message.error("You must be logged in as admin to perform this action.");
      return;
    }
    Modal.confirm({
      title: "Delete Subcategory",
      content: `Are you sure you want to delete '${subcat.name}'?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/subcategories/${subcat._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Subcategory deleted");
          fetchSubcategories(selectedCategory);
        } catch (err) {
          message.error("Failed to delete subcategory");
        }
      },
    });
  };

  // Upload props
  const uploadProps = {
    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      if (file.size / 1024 / 1024 > 2) {
        message.error("Image must be smaller than 2MB!");
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    onRemove: () => setFileList([]),
    fileList,
    maxCount: 1,
    accept: "image/*",
    listType: "picture-card",
  };

  return (
    <div className="p-6">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Subcategory Management</h1>
        <p className="text-sm text-gray-500 mt-1">Add, edit or remove subcategories under each category.</p>
      </div>
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          disabled={!isAdminAuthenticated}
          style={{ backgroundColor: "#702834", borderColor: "#702834" }}
        >
          Add Subcategory
        </Button>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <Select
          style={{ width: 300 }}
          placeholder="Filter by Category"
          loading={categoriesLoading}
          allowClear
          value={selectedCategory || undefined}
          onChange={(val) => setSelectedCategory(val || null)}
        >
          {categories.map((cat) => (
            <Select.Option key={cat._id} value={cat._id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Subcategories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No subcategories found
          </div>
          <Button
            type="primary"
            onClick={() => openModal()}
            disabled={!isAdminAuthenticated}
          >
            Create First Subcategory
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Image", "Name", "Description", "Category", "Created Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedSubcategories.map((subcat) => (
                  <tr key={subcat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {subcat.image ? (
                        <img
                          src={getImageUrl(subcat.image)}
                          alt={subcat.name}
                          className="w-14 h-14 object-cover rounded border border-gray-100"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <PlusOutlined style={{ fontSize: 20 }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {subcat.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">
                      {subcat.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {subcat.category?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                      {new Date(subcat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setViewItem(subcat)}
                          className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openModal(subcat)}
                          disabled={!isAdminAuthenticated}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subcat)}
                          disabled={!isAdminAuthenticated}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && subcategories.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
          total={subcategories.length}
          pageSize={PAGE_SIZE}
          label="subcategory"
        />
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{viewItem.name}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {viewItem.image && (
                <img
                  src={getImageUrl(viewItem.image)}
                  alt={viewItem.name}
                  className="w-full h-48 object-cover rounded-lg border border-gray-100"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</p>
                <p className="text-gray-800 font-medium">{viewItem.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{viewItem.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-gray-700 text-sm">{viewItem.category?.name || "N/A"}</p>
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

      {/* Modal for Add/Edit */}
      <Modal
        title={editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText={editingSubcategory ? "Update" : "Create"}
        confirmLoading={submitting}
        width={600}
        okButtonProps={{ disabled: !isAdminAuthenticated }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="categoryId"
            label="Parent Category"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select
              placeholder="Select a category"
              loading={categoriesLoading}
              showSearch
              optionFilterProp="children"
            >
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Subcategory Name"
            rules={[
              { required: true, message: "Please input subcategory name!" },
              { min: 3, message: "Name must be at least 3 characters!" },
              { max: 50, message: "Name cannot exceed 50 characters!" },
            ]}
          >
            <Input placeholder="e.g. Summer Dresses" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: "Description cannot exceed 500 characters!" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter subcategory description"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label={
              editingSubcategory
                ? "Image (optional — leave empty to keep current)"
                : "Image (optional)"
            }
          >
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Image</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, color: "#666", fontSize: "12px" }}>
              Supported: JPG, PNG, GIF, WEBP. Max size: 2MB
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subcategory;
