import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";

const ReturnOrders = () => {
  const { token } = useAdmin();
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReturnOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://sangamwholesale.com/api/return-orders/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success) {
          setReturnOrders(data.returnOrders);
        } else {
          setError("Failed to fetch return orders");
        }
      } catch (err) {
        setError("Error fetching return orders");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReturnOrders();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Return Orders</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading return orders...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Return Order ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  User ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Comment
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
              {returnOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap font-semibold">
                    {order._id}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {order.user?._id || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <ul>
                      {order.items.map((item) => (
                        <li
                          key={item._id}
                          className="flex items-center gap-2 mb-1"
                        >
                          <img
                            src={
                              item.image?.startsWith("http")
                                ? item.image
                                : item.image
                                ? `/products/${item.image}`
                                : null
                            }
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover border"
                          />
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">
                            x{item.quantity}
                          </span>
                          <span className="text-xs text-yellow-700">
                            {item.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    {order.comment}
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

export default ReturnOrders;
