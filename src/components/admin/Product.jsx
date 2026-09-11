import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Card,
  Image,
  Tag,
  Space,
  Row,
  Col,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAdmin } from "../context/AdminContext";

const { TextArea } = Input;
const { Option } = Select;

const Product = () => {
  const { token, isAdminAuthenticated } = useAdmin();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "/api";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/products/`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Cache-Control": "no-store",
        },
      });
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories/`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Cache-Control": "no-store",
        },
      });
      setCategories(res.data.categories || res.data || []);
    } catch (err) {
      message.error("Failed to fetch categories");
    }
  };

  const fetchSubcategories = async (categoryId = null) => {
    try {
      let url = `${API_BASE}/subcategories/`;
      if (categoryId) {
        url += `?category=${categoryId}`;
      }
      const res = await axios.get(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Cache-Control": "no-store",
        },
      });
      let subcategoriesData = [];
      if (res.data.subCategories) {
        subcategoriesData = res.data.subCategories;
      } else if (res.data.subcategories) {
        subcategoriesData = res.data.subcategories;
      } else if (Array.isArray(res.data)) {
        subcategoriesData = res.data;
      }
      setSubcategories(subcategoriesData);
    } catch (err) {
      message.error("Failed to fetch subcategories");
      setSubcategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    form.setFieldsValue({ subcategory: undefined });
    await fetchSubcategories(categoryId);
  };

  const handleSubmit = async () => {
    if (!isAdminAuthenticated) {
      message.error("You must be logged in as admin to perform this action.");
      return;
    }
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("subcategory", values.subcategory);
      formData.append("price", values.price);
      formData.append("discountPrice", values.discountPrice || 0);
      formData.append("unit", values.unit);
      formData.append("quantity", values.quantity);
      formData.append("stock", values.stock);
      formData.append("brand", values.brand);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };
      if (editingId) {
        await axios.put(`${API_BASE}/products/${editingId}`, formData, {
          headers,
        });
        message.success("Product updated successfully");
      } else {
        await axios.post(`${API_BASE}/products/`, formData, {
          headers,
        });
        message.success("Product created successfully");
      }
      setIsModalVisible(false);
      setFileList([]);
      fetchProducts();
    } catch (err) {
      let errorMessage = "Failed to save product";
      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          JSON.stringify(err.response.data);
      }
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdminAuthenticated) {
      message.error("You must be logged in as admin to perform this action.");
      return;
    }
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this product?",
      okType: "danger",
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Product deleted successfully");
          fetchProducts();
        } catch (err) {
          message.error("Failed to delete product");
        }
      },
    });
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setSelectedCategory(null);
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name || record.title,
      description: record.description,
      price: record.price,
      discountPrice: record.discountPrice,
      unit: record.unit,
      quantity: record.quantity,
      stock: record.stock,
      brand: record.brand,
      category: record.category?._id,
      subcategory: record.subcategory?._id || undefined,
    });
    setEditingId(record._id);
    setSelectedCategory(record.category?._id);
    if (record.category?._id) {
      fetchSubcategories(record.category._id);
    }
    if (record.image) {
      setFileList([
        {
          uid: "-1",
          name: "current-image",
          status: "done",
          url: record.image.startsWith("http")
            ? record.image
            : `/products/${record.image}`,
        },
      ]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
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

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      render: (image) => {
        const url = image
          ? image.startsWith("http")
            ? image
            : `/products/${image}`
          : null;

        // inline SVG placeholder — shows when image is null OR when the
        // file is missing from disk (404) so admin always sees something
        const placeholder =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23f3f4f6'%3E%3Crect width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='11' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

        return (
          <Image
            src={url || placeholder}
            alt="product"
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
            fallback={placeholder}
            preview={!!url}
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price?.toLocaleString()}`,
    },
    {
      title: "Discount Price",
      dataIndex: "discountPrice",
      render: (discountPrice) =>
        discountPrice ? `₹${discountPrice?.toLocaleString()}` : "-",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (stock) => (
        <Tag color={stock > 0 ? "green" : "red"}>
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </Tag>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      render: (unit) => unit || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      render: (quantity) => quantity || "-",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      render: (brand) => brand || "-",
    },
    {
      title: "Category",
      render: (_, record) => (
        <Tag color="blue">
          {record.subcategory?.category?.name || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Subcategory",
      render: (_, record) => (
        <Tag color="purple">
          {record.subcategory?.name || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setViewItem(record)}
            style={{ backgroundColor: "#0d9488", borderColor: "#0d9488", color: "#fff" }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            ghost
            disabled={!isAdminAuthenticated}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            danger
            disabled={!isAdminAuthenticated}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <p className="text-sm text-gray-500 mt-1">Add, edit or remove products from the catalog.</p>
      </div>

    <Card
      variant="outlined"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={!isAdminAuthenticated}
          style={{ backgroundColor: "#702834", borderColor: "#702834" }}
        >
          Add Product
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
        />
      )}

      <Modal
        title={editingId ? "Edit Product" : "Add Product"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
        }}
        width={800}
        destroyOnHidden
        confirmLoading={submitting}
        okButtonProps={{ disabled: !isAdminAuthenticated }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: "Please select a category!" },
                ]}
              >
                <Select
                  placeholder="Select category"
                  onChange={handleCategoryChange}
                  showSearch
                  optionFilterProp="children"
                  loading={categories.length === 0}
                  value={selectedCategory || undefined}
                >
                  {categories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.title || category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subcategory"
                label="Subcategory"
                rules={[
                  { required: true, message: "Please select a subcategory!" },
                ]}
              >
                <Select
                  placeholder="Select subcategory"
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedCategory}
                  loading={subcategories.length === 0}
                >
                  {Array.isArray(subcategories) && subcategories.length > 0 ? (
                    subcategories.map((subcategory) => (
                      <Option key={subcategory._id} value={subcategory._id}>
                        {subcategory.title || subcategory.name}
                      </Option>
                    ))
                  ) : (
                    <Option disabled value="">
                      No subcategories available
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="Product Name"
            rules={[
              { required: true, message: "Please input product name!" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please input description!" },
              {
                min: 10,
                message: "Description must be at least 10 characters",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price (₹)"
                rules={[{ required: true, message: "Please input price!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discountPrice" label="Discount Price (₹)">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: "Please input unit!" }]}
              >
                <Input placeholder="e.g. kg, piece, box" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please input quantity!" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[
                  { required: true, message: "Please input stock quantity!" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="brand"
                label="Brand"
                rules={[{ required: true, message: "Please input brand!" }]}
              >
                <Input placeholder="Enter brand name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Product Image"
            rules={[
              {
                required: fileList.length === 0,
                message: "Please upload an image!",
              },
            ]}
          >
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
              Only one image (under 2MB)
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{viewItem.name}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {viewItem.image && (
                <img
                  src={viewItem.image.startsWith("http") ? viewItem.image : `/products/${viewItem.image}`}
                  alt={viewItem.name}
                  className="w-full h-48 object-cover rounded-lg border border-gray-100"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Name",        value: viewItem.name },
                  { label: "Brand",       value: viewItem.brand },
                  { label: "Price",       value: viewItem.price ? `₹${viewItem.price}` : "-" },
                  { label: "Discount",    value: viewItem.discountPrice ? `₹${viewItem.discountPrice}` : "-" },
                  { label: "Unit",        value: viewItem.unit },
                  { label: "Quantity",    value: viewItem.quantity },
                  { label: "Stock",       value: viewItem.stock },
                  { label: "Category",    value: viewItem.subcategory?.category?.name || "N/A" },
                  { label: "Subcategory", value: viewItem.subcategory?.name || "N/A" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-gray-800 text-sm font-medium">{value || "-"}</p>
                  </div>
                ))}
              </div>
              {viewItem.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{viewItem.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewItem(null)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </Card>
    </div>
  );
};

export default Product;
