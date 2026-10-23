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
  Phone,
  Mail,
  Briefcase,
  FileText,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Seller (Sangam Wholesale) details shown on the customer invoice "From" block.
const SELLER = {
  name: "Sangam Wholesale",
  address: "Sangam Wholesale — add shop address here",
  gstin: "29ABUCS3779C1ZM",
  phone: "",
};

const ProfilePage = () => {
  // Use AuthContext for user and token
  const { user: authUser, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Re-add every item from a past order to the cart, then go to the cart.
  const handleBuyAgain = (order) => {
    if (!order?.items?.length) return;
    order.items.forEach((item) => {
      addToCart({
        _id: item.productId,
        name: item.name,
        price: item.price,
        gst: item.gst ?? 0,
        image: item.rawImage,
        quantity: item.quantity || 1,
      });
    });
    navigate("/cart");
  };

  // Build the invoice markup (self-contained, .inv-scoped) for a delivered order.
  const buildInvoiceFragment = (order) => {
    const items = order.items || [];
    const subtotal =
      order.subtotal ??
      items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
    const gst = order.gst ?? 0;
    const total = order.total ?? subtotal + gst;
    const toName = user.businessName || user.name || "Customer";
    const toPhone = user.phone ? `+91 ${user.phone}` : "";
    const toGst = user.gst || "";
    const payment =
      order.paymentMethod === "cod"
        ? "Cash on Delivery"
        : order.paymentMethod || "—";
    const dateStr = new Date(order.date).toLocaleDateString();
    const deliveredStr = order.deliveredAt
      ? new Date(order.deliveredAt).toLocaleDateString()
      : "";

    const itemRows = items
      .map(
        (it, i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${i + 1}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${it.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">₹${it.price}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;">₹${(it.price || 0) * (it.quantity || 1)}</td>
      </tr>`
      )
      .join("");

    return `<style>
        .inv{font-family:Arial,Helvetica,sans-serif;color:#333;background:#fff;padding:24px;}
        .inv .brand{color:#702834;}
        .inv table{width:100%;border-collapse:collapse;font-size:14px;}
        .inv th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#999;border-bottom:2px solid #702834;padding-bottom:6px;}
      </style>
      <div class="inv">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #702834;padding-bottom:16px;margin-bottom:24px;">
        <div><h1 class="brand" style="margin:0;font-size:24px;">${SELLER.name}</h1><p style="font-size:12px;color:#666;margin:4px 0 0;">Tax Invoice</p></div>
        <div style="text-align:right;"><p style="margin:0;font-weight:bold;">INVOICE</p><p style="margin:0;">#${order.orderId}</p><p style="margin:0;font-size:12px;color:#999;">${dateStr}</p></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <div>
          <p style="font-size:11px;color:#999;font-weight:bold;text-transform:uppercase;margin:0 0 4px;">From</p>
          <p style="margin:0;font-weight:bold;">${SELLER.name}</p>
          <p style="margin:2px 0;font-size:12px;color:#555;">${SELLER.address}</p>
          <p style="margin:2px 0;font-size:12px;"><span style="color:#999;">GSTIN:</span> ${SELLER.gstin}</p>
        </div>
        <div>
          <p style="font-size:11px;color:#999;font-weight:bold;text-transform:uppercase;margin:0 0 4px;">Bill To</p>
          <p style="margin:0;font-weight:bold;">${toName}</p>
          ${toPhone ? `<p style="margin:2px 0;font-size:12px;color:#555;">${toPhone}</p>` : ""}
          ${toGst ? `<p style="margin:2px 0;font-size:12px;"><span style="color:#999;">GSTIN:</span> ${toGst}</p>` : ""}
          ${order.deliveryAddress ? `<p style="margin:2px 0;font-size:12px;color:#555;">${order.deliveryAddress}</p>` : ""}
        </div>
      </div>
      <div style="display:flex;gap:24px;border-top:1px solid #eee;border-bottom:1px solid #eee;padding:10px 0;margin-bottom:24px;font-size:12px;">
        <div><span style="color:#999;">Status:</span> ${order.status}</div>
        ${deliveredStr ? `<div><span style="color:#999;">Delivered:</span> ${deliveredStr}</div>` : ""}
        <div><span style="color:#999;">Payment:</span> ${payment}</div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Item</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="width:260px;margin-left:auto;margin-top:24px;font-size:14px;">
        <div style="display:flex;justify-content:space-between;"><span style="color:#666;">Subtotal</span><span>₹${subtotal}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#666;">GST</span><span>₹${gst}</span></div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid #ccc;padding-top:8px;font-weight:bold;color:#702834;font-size:16px;"><span>Total</span><span>₹${total}</span></div>
      </div>
      <div style="border-top:1px solid #eee;margin-top:32px;padding-top:16px;text-align:center;">
        <p style="font-weight:600;margin:0;">Thank you for your business!</p>
        <p style="font-size:12px;color:#999;margin:4px 0 0;">${SELLER.name} · This is a computer-generated invoice.</p>
      </div>
      </div>`;
  };

  // Fallback: open the invoice in a new tab for manual print / save-as-PDF.
  const openInvoiceWindow = (order) => {
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${order.orderId}</title></head><body style="margin:0;">${buildInvoiceFragment(order)}</body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      alert("Please allow pop-ups so the invoice can open.");
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch (e) {
        /* user can print manually */
      }
    }, 400);
  };

  // Generate the invoice as a PDF and download it straight to the Downloads folder.
  const handleDownloadInvoice = async (order) => {
    const holder = document.createElement("div");
    holder.style.position = "fixed";
    holder.style.left = "-9999px";
    holder.style.top = "0";
    holder.style.width = "800px";
    holder.style.background = "#ffffff";
    holder.innerHTML = buildInvoiceFragment(order);
    document.body.appendChild(holder);
    try {
      const node = holder.querySelector(".inv") || holder;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = 210;
      const pageH = 297;
      const margin = 10;
      const ratio = Math.min(
        (pageW - margin * 2) / canvas.width,
        (pageH - margin * 2) / canvas.height
      );
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, w, h);
      pdf.save(`Invoice-${order.orderId}.pdf`);
    } catch (e) {
      console.log(e);
      openInvoiceWindow(order); // fallback if PDF generation fails
    } finally {
      document.body.removeChild(holder);
    }
  };

  // User Profile State
  const [user, setUser] = useState({
    name: authUser?.fullName || authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    businessName: authUser?.businessName || "",
    businessPhone: authUser?.businessPhone || "",
    gst: authUser?.gst || "",
    avatar: authUser?.profileImage
      ? `https://sangamwholesale.com/profileImage/${authUser.profileImage}`
      : null,
  });

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

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
            name: data.user.fullName || data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            businessName: data.user.businessName || "",
            businessPhone: data.user.businessPhone || "",
            gst: data.user.gst || "",
            avatar: data.user.profileImage
              ? `https://sangamwholesale.com/profileImage/${data.user.profileImage}`
              : null,
          });
          setEditedUser({
            name: data.user.fullName || data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            businessName: data.user.businessName || "",
            businessPhone: data.user.businessPhone || "",
            gst: data.user.gst || "",
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
            data.orders.map((order) => {
              // Prefer the live delivery-partner status when present.
              const effStatus = order.deliveryStatus || order.status;
              return {
                id: order._id,
                orderId: order.orderId,
                date: order.createdAt,
                total: order.total,
                subtotal: order.subtotal,
                gst: order.gst,
                paymentMethod: order.paymentMethod,
                deliveredAt: order.deliveredAt,
                status: getDeliveryStatus(effStatus),
                deliveryStatus: order.deliveryStatus,
                deliveryOtp: order.deliveryOtp,
                deliveryPartnerName: order.deliveryPartner?.name || null,
                items: order.items.map((item) => ({
                  productId: item.productId || item._id,
                  rawImage: item.image || "",
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  image: item.image
                    ? `https://sangamwholesale.com/${item.image}`
                    : PLACEHOLDER_IMAGE,
                })),
                deliveryAddress: order.deliveryAddress,
                trackingId: `TRK${order.orderId}`,
                statusColor: getStatusColor(effStatus),
                progress: getProgress(effStatus),
              };
            })
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

  // Live refresh: re-fetch orders every 15s so delivery status + OTP update
  // without the customer having to reload the page.
  useEffect(() => {
    if (!token) return;
    const refresh = async () => {
      try {
        const response = await fetch("https://sangamwholesale.com/api/orders/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(
            data.orders.map((order) => {
              const effStatus = order.deliveryStatus || order.status;
              return {
                id: order._id,
                orderId: order.orderId,
                date: order.createdAt,
                total: order.total,
                subtotal: order.subtotal,
                gst: order.gst,
                paymentMethod: order.paymentMethod,
                deliveredAt: order.deliveredAt,
                status: getDeliveryStatus(effStatus),
                deliveryStatus: order.deliveryStatus,
                deliveryOtp: order.deliveryOtp,
                deliveryPartnerName: order.deliveryPartner?.name || null,
                items: order.items.map((item) => ({
                  productId: item.productId || item._id,
                  rawImage: item.image || "",
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  image: item.image
                    ? `https://sangamwholesale.com/${item.image}`
                    : PLACEHOLDER_IMAGE,
                })),
                deliveryAddress: order.deliveryAddress,
                trackingId: `TRK${order.orderId}`,
                statusColor: getStatusColor(effStatus),
                progress: getProgress(effStatus),
              };
            })
          );
        }
      } catch (e) {
        // silent — keep showing last known orders
      }
    };
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Helper functions for orders
  const getDeliveryStatus = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "placed":
      case "pending":
        return "Processing";
      case "accepted":
      case "confirmed":
        return "In Transit";
      case "out_for_delivery":
      case "shipped":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "undelivered":
      case "cancelled":
        return "Cancelled";
      default:
        return "Processing";
    }
  };

  const getStatusColor = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "placed":
      case "pending":
        return "#bd1b13";
      case "accepted":
      case "confirmed":
        return "#F59E0B";
      case "out_for_delivery":
      case "shipped":
        return "#8B5CF6";
      case "delivered":
        return "#10B981";
      case "undelivered":
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getProgress = (apiStatus) => {
    switch (apiStatus?.toLowerCase()) {
      case "placed":
      case "pending":
        return 25;
      case "accepted":
      case "confirmed":
        return 55;
      case "out_for_delivery":
      case "shipped":
        return 85;
      case "delivered":
        return 100;
      case "undelivered":
      case "cancelled":
        return 0;
      default:
        return 10;
    }
  };

  // Profile Edit Handlers
  const handleProfileEdit = () => {
    setIsEditing(true);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    if (!editedUser.name.trim()) {
      alert("Please enter your name");
      return;
    }
    try {
      setProfileLoading(true);

      // If a new image was selected, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append("profileImage", avatarFile);
        try {
          const imgRes = await fetch(
            "https://sangamwholesale.com/api/user/upload-profile-image",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );
          const imgData = await imgRes.json();
          if (imgRes.ok && imgData.profileImage) {
            setUser((prev) => ({
              ...prev,
              avatar: `https://sangamwholesale.com/profileImage/${imgData.profileImage}`,
            }));
          }
        } catch (imgErr) {
          console.error("Image upload failed:", imgErr);
        }
      }

      const profileData = {
        fullName: editedUser.name.trim(),
        email: editedUser.email.trim(),
        phone: editedUser.phone.trim(),
        businessName: editedUser.businessName?.trim() || "",
        businessPhone: editedUser.businessPhone?.trim() || "",
        gst: editedUser.gst?.trim().toUpperCase() || "",
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
        setUser((prev) => ({ ...prev, ...editedUser }));
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
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
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {/* Hidden file input */}
              <input
                type="file"
                id="avatarUpload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Avatar image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img
                  src={avatarPreview || user.avatar || PLACEHOLDER_IMAGE}
                  alt={user.name || "Profile"}
                  className="w-full h-full rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: "#702834" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=702834&color=fff&size=128`;
                  }}
                />

                {/* Edit overlay — only in edit mode */}
                {isEditing && (
                  <label
                    htmlFor="avatarUpload"
                    className="absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-opacity"
                    style={{ backgroundColor: "rgba(112,40,52,0.55)" }}
                  >
                    <div className="text-center text-white">
                      <Edit size={20} className="mx-auto mb-1" />
                      <span className="text-xs font-medium">Change</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Preview badge */}
              {avatarPreview && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-white px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: "#702834" }}
                >
                  New photo
                </span>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      placeholder="Phone Number"
                    />
                  </div>

                  {/* Business Info */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                      Business Info
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={editedUser.businessName}
                          onChange={(e) =>
                            setEditedUser((prev) => ({
                              ...prev,
                              businessName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                          placeholder="Business Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Phone
                        </label>
                        <input
                          type="tel"
                          value={editedUser.businessPhone}
                          onChange={(e) =>
                            setEditedUser((prev) => ({
                              ...prev,
                              businessPhone: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          maxLength={10}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                          placeholder="Business Phone"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number{" "}
                        <span className="text-gray-400 font-normal">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={editedUser.gst}
                        onChange={(e) =>
                          setEditedUser((prev) => ({
                            ...prev,
                            gst: e.target.value.toUpperCase(),
                          }))
                        }
                        maxLength={15}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent tracking-wider font-mono transition-colors"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                      />
                    </div>
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
                      className="px-5 py-2 text-white rounded-lg font-medium transition-colors flex items-center"
                      style={{ backgroundColor: "#702834" }}
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

                  {/* Email */}
                  {user.email && (
                    <div className="flex items-center text-gray-600 gap-2">
                      <Mail size={18} style={{ color: "#702834" }} />
                      <span>{user.email}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {user.phone && (
                    <div className="flex items-center text-gray-600 gap-2">
                      <Phone size={18} style={{ color: "#702834" }} />
                      <span>+91 {user.phone}</span>
                    </div>
                  )}

                  {/* Divider */}
                  {(user.businessName || user.businessPhone || user.gst) && (
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        Business Info
                      </p>

                      {user.businessName && (
                        <div className="flex items-center text-gray-600 gap-2 mb-2">
                          <Briefcase size={18} style={{ color: "#702834" }} />
                          <span className="font-medium">{user.businessName}</span>
                        </div>
                      )}

                      {user.businessPhone && (
                        <div className="flex items-center text-gray-600 gap-2 mb-2">
                          <Phone size={18} style={{ color: "#702834" }} />
                          <span>+91 {user.businessPhone}</span>
                        </div>
                      )}

                      {user.gst && (
                        <div className="flex items-center text-gray-600 gap-2">
                          <FileText size={18} style={{ color: "#702834" }} />
                          <span className="tracking-wider font-mono text-sm">
                            GST: {user.gst}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProfileEdit}
                      className="px-5 py-2 text-white rounded-lg font-medium transition-colors flex items-center"
                      style={{ backgroundColor: "#702834" }}
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
                  {order.deliveryPartnerName && (
                    <p className="text-sm mt-1 font-medium" style={{ color: "#702834" }}>
                      🛵 Delivery partner: {order.deliveryPartnerName}
                    </p>
                  )}
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
              {/* Delivery OTP — shown while the partner is out for delivery */}
              {order.deliveryStatus === "out_for_delivery" &&
                order.deliveryOtp && (
                  <div
                    className="mb-4 rounded-xl border p-4 text-center"
                    style={{ backgroundColor: "#7028340D", borderColor: "#70283433" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#702834" }}>
                      Delivery OTP
                    </p>
                    <p
                      className="text-3xl font-extrabold tracking-[0.3em] my-1"
                      style={{ color: "#702834" }}
                    >
                      {order.deliveryOtp}
                    </p>
                    <p className="text-xs text-gray-500">
                      Share this OTP with the delivery partner to confirm your delivery.
                    </p>
                  </div>
                )}
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
                      onClick={() => handleDownloadInvoice(order)}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                      style={{ backgroundColor: "#702834" }}
                    >
                      <Download size={16} className="mr-2" /> Invoice
                    </motion.button>
                  )}
                  {(order.status === "Delivered" ||
                    order.status === "Cancelled") && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleBuyAgain(order)}
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
            onClick={() => navigate("/Home")}
            className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "#702834" }}
          >
            Start Shopping
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
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
