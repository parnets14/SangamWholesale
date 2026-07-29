import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";

const Orders = () => {
  const { token } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-store",
          },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message || "Failed to fetch orders");
        }
      } catch (err) {
        setError("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  // Backend now always returns relative paths like /products/filename.jpg
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) {
      // legacy absolute URL — strip domain to make relative
      try {
        return new URL(image).pathname;
      } catch {
        return image;
      }
    }
    if (!image.startsWith("/")) return `/${image}`;
    return image;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">All Orders</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  User ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivery Address
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Subtotal
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  GST
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap font-semibold">
                    {order.orderId}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {order.user?.userDetails?.fullName || order.user?.phone || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <ul>
                      {order.items.map((item) => (
                        <li
                          key={item._id}
                          className="flex items-center gap-2 mb-1"
                        >
                          {getImageUrl(item.image) ? (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover border"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              ?
                            </div>
                          )}
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">
                            x{item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    {order.deliveryAddress}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    ₹{order.subtotal}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">₹{order.gst}</td>
                  <td className="px-4 py-2 whitespace-nowrap font-bold">
                    ₹{order.total}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap capitalize">
                    {order.status}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
