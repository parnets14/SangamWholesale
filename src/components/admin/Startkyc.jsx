import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, message } from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const API_BASE = "";
const API_URL = "/api/trading";

const getToken = () => localStorage.getItem("adminToken");

const Startkyc = () => {
  const [kycList, setKycList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editingKyc, setEditingKyc] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // Fetch data on load
  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { "Cache-Control": "no-store" },
      });
      const formattedData = res.data.map((item) => ({
        ...item,
        key: item._id,
        description: item.Description,
      }));
      setKycList(formattedData);
    } catch (err) {
      message.error("Failed to fetch data");
      console.error("Fetch error:", err);
    }
  };

  const handleAdd = () => {
    setEditingKyc(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingKyc(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
    });
    setFileList([
      {
        uid: "-1",
        name: "current-image",
        status: "done",
        url: `/${record.image}`,
      },
    ]);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      message.success("Deleted successfully");
      fetchKycData();
    } catch (err) {
      message.error("Failed to delete");
      console.error("Delete error:", err);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("Description", values.description);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      if (editingKyc) {
        await axios.put(`${API_URL}/${editingKyc.key}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        });
        message.success("Updated successfully");
      } else {
        await axios.post(API_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        });
        message.success("Added successfully");
      }

      setIsModalVisible(false);
      setFileList([]);
      fetchKycData();
    } catch (err) {
      message.error("Failed to save data");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed!");
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (imgPath) => (
        <img
          src={imgPath ? `/${imgPath}` : PLACEHOLDER_IMAGE}
          alt="kyc"
          style={{ width: 100, height: "auto", borderRadius: 4 }}
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => setViewItem(record)}
            style={{ color: "#0d9488" }}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            danger
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Three Step Process</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the three-step onboarding process cards.</p>
      </div>
      <div className="flex justify-end mb-4">
        <Button type="primary" onClick={handleAdd} style={{ backgroundColor: "#702834", borderColor: "#702834" }}>
          + Add Step
        </Button>
      </div>

      <Table columns={columns} dataSource={kycList} />

      <Modal
        title={editingKyc ? "Edit KYC" : "Add KYC"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingKyc ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the description" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Upload Image" required>
            <Upload
              beforeUpload={beforeUpload}
              onChange={handleUploadChange}
              fileList={fileList}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

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
              <h3 className="text-base font-bold text-gray-800">{viewItem.title}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {viewItem.image && (
                <img
                  src={`/${viewItem.image}`}
                  alt={viewItem.title}
                  className="w-full h-48 object-cover rounded-lg border border-gray-100"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</p>
                <p className="text-gray-800 font-medium">{viewItem.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{viewItem.description}</p>
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
    </div>
  );
};

export default Startkyc;
