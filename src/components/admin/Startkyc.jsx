import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, message } from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const API_BASE = "";
const API_URL = "/api/trading";

const getToken = () => localStorage.getItem("adminToken");

const Startkyc = () => {
  const [kycList, setKycList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Trading Admin (KYC Style)</h2>
        <Button type="primary" onClick={handleAdd}>
          + Add KYC
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
    </div>
  );
};

export default Startkyc;
