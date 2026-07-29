import React, { useState, useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  MapPin,
  Edit,
  Save,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  Truck,
  Package,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  // Use AuthContext for user and token
  const { user: authUser, token } = useAuth();

  // User Profile State
  const [user, setUser] = useState({
    name: authUser?.fullName || authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    avatar: authUser?.profileImage
      ? `https://sangamwholesale.com/profileImage/${authUser.profileImage}`
      : null,
  });

  // Addresses State
  const [addresses, setAddresses] = useState([]);

  // Orders State
  const [orders, setOrders] = useState([]);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Active Section State
  const [activeSection, setActiveSection] = useState("profile");

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    shopName: "",
    areaName: "",
    shopNumber: "",
    town: "",
    city: "",
    pincode: "",
    deliveryContact: "",
    default: false,
  });
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState(null);

  // Orders Loading State
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Fetch User Profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const response = await fetch(
          "https://sangamwholesale.com/api/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.success && data.user) {
          setUser({
            name: data.user.fullName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            avatar: data.user.profileImage
              ? `https://sangamwholesale.com/profileImage/${data.user.profileImage}`
              : null,
          });
          setEditedUser({
            name: data.user.fullName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            avatar: data.user.profileImage
              ? `https://sangamwholesale.com/profileImage/${data.user.profileImage}`
              : null,
          });
        } else {
          setProfileError(data.message || "Failed to load user profile");
        }
      } catch (error) {
        setProfileError("Network error. Please try again.");
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        setAddressError(null);
        const response = await fetch(
          "https://sangamwholesale.com/api/addresses/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.success && data.addresses) {
          setAddresses(
            data.addresses.map((addr) => ({
              id: addr._id,
              shopName: addr.shopName,
              areaName: addr.areaName,
              shopNumber: addr.shopNumber,
              town: addr.town,
              city: addr.city,
              pincode: addr.pincode,
              deliveryContact: addr.deliveryContact,
              isDefault: addr.default,
            }))
          );
        } else {
          setAddressError(data.message || "Failed to load addresses");
        }
      } catch (error) {
        setAddressError("Network error. Please try again.");
      } finally {
        setAddressLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const response = await fetch(
          "https://sangamwholesale.com/api/orders/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(
            data.orders.map((order) => ({
              id: order._id,
              orderId: order.orderId,
              date: order.createdAt,
              total: order.total,
              status: getDeliveryStatus(order.status),
              items: order.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
                  ? `https://sangamwholesale.com/${item.image}`
                  : PLACEHOLDER_IMAGE,
              })),
              deliveryAddress: order.deliveryAddress,
              trackingId: `TRK${order.orderId}`,
              statusColor: getStatusColor(order.status),
              progress: getProgress(order.status),
            }))
          );
        } else {
          setOrdersError(data.message || "Failed to load orders");
        }
      } catch (error) {
        setOrdersError("Network error. Please try again.");
      } finally {
        setOrdersLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
      fetchAddresses();
      fetchOrders();
    }
  }, [token]);

  // Helper functions for orders
  const getDeliveryStatus = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "pending":
        return "Processing";
      case "confirmed":
        return "In Transit";
      case "shipped":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Processing";
    }
  };

  const getStatusColor = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "pending":
        return "#bd1b13";
      case "confirmed":
        return "#F59E0B";
      case "shipped":
        return "#8B5CF6";
      case "delivered":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getProgress = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "pending":
        return 25;
      case "confirmed":
        return 50;
      case "shipped":
        return 85;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 10;
    }
  };

  // Profile Edit Handlers
  const handleProfileEdit = () => {
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    if (!editedUser.name.trim()) {
      alert("Please enter your name");
      return;
    }
    try {
      setProfileLoading(true);
      const profileData = {
        fullName: editedUser.name.trim(),
        email: editedUser.email.trim(),
        phone: editedUser.phone.trim(),
      };
      const response = await fetch(
        "https://sangamwholesale.com/api/user/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }
      );
      const result = await response.json();
      if (result.success) {
        setUser(editedUser);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Failed to update profile");
      }
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Address Handlers
  const handleAddAddress = async () => {
    try {
      setAddressLoading(true);
      const response = await fetch(
        "https://sangamwholesale.com/api/addresses/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopName: newAddress.shopName,
            areaName: newAddress.areaName,
            shopNumber: newAddress.shopNumber,
            town: newAddress.town,
            city: newAddress.city,
            pincode: newAddress.pincode,
            deliveryContact: newAddress.deliveryContact,
            default: newAddress.isDefault,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAddresses((prev) => [
          ...prev,
          {
            id: data.address._id,
            shopName: data.address.shopName,
            areaName: data.address.areaName,
            shopNumber: data.address.shopNumber,
            town: data.address.town,
            city: data.address.city,
            pincode: data.address.pincode,
            deliveryContact: data.address.deliveryContact,
            isDefault: data.address.default,
          },
        ]);
        setNewAddress({
          shopName: "",
          areaName: "",
          shopNumber: "",
          town: "",
          city: "",
          pincode: "",
          deliveryContact: "",
          isDefault: false,
        });
        setShowAddressForm(false);
        alert("Address added successfully!");
      } else {
        alert(data.message || "Failed to add address");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      setAddressLoading(true);
      const response = await fetch(
        `https://sangamwholesale.com/api/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        alert("Address deleted successfully!");
      } else {
        alert(data.message || "Failed to delete address");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      setAddressLoading(true);
      const response = await fetch(
        `https://sangamwholesale.com/api/addresses/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ default: true }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          }))
        );
        alert("Default address updated successfully!");
      } else {
        alert(data.message || "Failed to update default address");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  // Render Profile Section
  const renderProfileSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="p-6 md:p-8">
        {profileLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : profileError ? (
          <div className="text-center p-6">
            <p className="text-[#702834] mb-4">{profileError}</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Retry
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <img
                src={user.avatar || PLACEHOLDER_IMAGE}
                alt={user.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-2 rounded-full shadow-md"
                >
                  <Edit size={16} />
                </motion.button>
              )}
            </div>
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) =>
                          setEditedUser((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) =>
                        setEditedUser((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleProfileSave}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                      disabled={profileLoading}
                    >
                      <Save size={18} className="mr-2" />
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {user.name}
                  </h2>
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{user.phone}</span>
                  </div>
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProfileEdit}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <Edit size={18} className="mr-2" />
                      Edit Profile
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render Address Section
  const renderAddressSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {addressLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : addressError ? (
        <div className="text-center p-6">
          <p className="text-[#702834] mb-4">{addressError}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Retry
          </motion.button>
        </div>
      ) : !showAddressForm ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                whileHover={{ y: -2 }}
                className={`bg-white p-5 rounded-xl shadow-sm border ${
                  address.isDefault ? "border-indigo-500" : "border-gray-200"
                } relative`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-gray-900">
                        {address.shopName}
                      </h3>
                      {address.isDefault && (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2">
                      {address.shopNumber}, {address.areaName}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {address.town}, {address.city} - {address.pincode}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Contact: {address.deliveryContact}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDefaultAddress(address.id)}
                      className={`p-1.5 rounded-full ${
                        address.isDefault
                          ? "text-indigo-600"
                          : "text-gray-400 hover:text-indigo-600"
                      }`}
                      disabled={address.isDefault}
                      title={
                        address.isDefault ? "Default address" : "Set as default"
                      }
                    >
                      <CheckCircle size={18} />
                    </motion.button>
                    {!address.isDefault && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-[#702834]"
                        title="Delete address"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddressForm(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center transition-colors"
          >
            <Plus size={24} className="text-indigo-500 mb-2" />
            <span className="text-indigo-600 font-medium">Add New Address</span>
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Add New Address
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                value={newAddress.shopName}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, shopName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Shop Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area Name
              </label>
              <input
                type="text"
                value={newAddress.areaName}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, areaName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Area Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Number
              </label>
              <input
                type="text"
                value={newAddress.shopNumber}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, shopNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Shop Number"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Town
                </label>
                <input
                  type="text"
                  value={newAddress.town}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, town: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Town"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pincode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Pincode"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                value={newAddress.deliveryContact}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    deliveryContact: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Contact Number"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="defaultAddress"
                checked={newAddress.isDefault}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="defaultAddress"
                className="ml-2 block text-sm text-gray-700"
              >
                Set as default address
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddressForm(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddAddress}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                disabled={addressLoading}
              >
                {addressLoading ? "Saving..." : "Save Address"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Render Orders Section
  const renderOrdersSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {ordersLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : ordersError ? (
        <div className="text-center p-6">
          <p className="text-[#702834] mb-4">{ordersError}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Retry
          </motion.button>
        </div>
      ) : (
        orders.map((order) => (
          <motion.div
            key={order.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Placed on{" "}
                    {new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center">
                  {order.status === "Delivered" && (
                    <CheckCircle size={18} className="text-green-500 mr-2" />
                  )}
                  {order.status === "In Transit" && (
                    <Truck size={18} className="text-blue-500 mr-2" />
                  )}
                  {order.status === "Out for Delivery" && (
                    <svg
                      className="w-5 h-5 mr-2 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a1.998 1.998 0 010-2.828l4.243-4.243a1.998 1.998 0 012.828 0l4.243 4.243a1.998 1.998 0 010 2.828z"
                      />
                    </svg>
                  )}
                    {order.status === "Processing" && (
                      <Clock size={18} className="mr-2" style={{ color: '#702834' }} />
                  )}
                  {order.status === "Cancelled" && (
                    <svg
                      className="w-5 h-5 mr-2 text-[#702834]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span
                    className={`
                    text-sm font-medium
                    ${
                      order.status === "Delivered"
                        ? "text-green-600"
                        : order.status === "In Transit"
                        ? "text-blue-600"
                        : order.status === "Out for Delivery"
                        ? "text-purple-600"
                        : order.status === "Processing"
                        ? "text-[#702834]"
                        : "text-[#702834]"
                    }
                  `}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src = PLACEHOLDER_IMAGE)
                        }
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{order.total}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      alert(
                        `Track Order\nTracking ID: ${order.trackingId}\nOrder ID: ${order.orderId}`
                      )
                    }
                  >
                    Track Order
                  </motion.button>
                  {order.status === "Delivered" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Buy Again
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
      {!ordersLoading && !ordersError && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-6">
            Your order history will appear here
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-500">
            Manage your profile, addresses, and orders
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex overflow-x-auto pb-2 mb-8 scrollbar-hide"
        >
          <div className="flex space-x-1 mx-auto bg-white p-1 rounded-xl shadow-sm">
            {[
              { id: "profile", icon: User, label: "Profile" },
              { id: "addresses", icon: MapPin, label: "Addresses" },
              { id: "orders", icon: ShoppingBag, label: "Orders" },
            ].map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSection(section.id)}
                className={`
                  px-4 py-2 rounded-lg flex items-center transition-colors
                  ${
                    activeSection === section.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <section.icon size={18} className="mr-2" />
                <span className="whitespace-nowrap">{section.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-12"
          >
            {activeSection === "profile" && renderProfileSection()}
            {activeSection === "addresses" && renderAddressSection()}
            {activeSection === "orders" && renderOrdersSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
