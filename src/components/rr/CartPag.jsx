import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartPag = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();
  console.log("cartItems", cartItems);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-4">
            Looks like you haven't added anything yet.
          </p>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition"
            onClick={() => navigate("/")}
          >
            Start Shopping
          </button>
        </div>
                </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shopping Cart</h2>
                    <button
          className="mb-6 bg-gray-100 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-200 transition"
          onClick={clearCart}
                    >
          Clear Cart
                    </button>
                    <div className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
            <div key={item._id} className="flex items-center py-6">
                            <img
                              src={item.image}
                              alt={item.name}
                className="w-20 h-20 object-cover rounded-lg mr-6 border"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm mb-1">
                  {item.brand || "Generic Brand"}
                </p>
                {item.unit && (
                  <p className="text-gray-400 text-xs mb-1">
                    Unit: {item.quantity} {item.unit}
                  </p>
                )}
                {item.description && (
                  <p className="text-gray-400 text-xs mb-1">
                    {item.description}
                  </p>
                )}
                    <button
                  className="text-blue-600 text-xs underline mb-1"
                  onClick={() => navigate(`/product/${item._id}`)}
                    >
                  View Details
                    </button>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-full text-lg font-bold hover:bg-gray-300 transition"
                    onClick={() => updateQuantity(item._id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="mx-2 text-lg font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-full text-lg font-bold hover:bg-gray-300 transition"
                    onClick={() => updateQuantity(item._id, 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="mt-2 text-red-500 text-sm hover:underline"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
              <div className="text-xl font-bold text-red-600 ml-6 min-w-[80px] text-right">
                ₹
                {(parseInt(
                  (item.price + "").replace("₹", "").replace(",", "")
                ) || 0) * item.quantity}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-lg text-gray-700">
            <span className="font-semibold">Total Items:</span> {getItemCount()}
          </div>
          <div className="text-2xl font-bold text-gray-800">
            <span className="font-semibold">Total:</span> ₹{getTotal()}
          </div>
          <button
            className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPag;
