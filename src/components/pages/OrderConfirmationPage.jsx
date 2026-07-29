import React from 'react';
import { motion } from 'framer-motion';
import { Check, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const calculateTotal = () => {
    return orderDetails.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const orderDetails = location.state?.orderDetails;

  // If no order details, redirect to home
  React.useEffect(() => {
    if (!orderDetails) {
      navigate('/categories');
    }
  }, [orderDetails, navigate]);

  if (!orderDetails) return null;

  // Use provided values or fallback to calculation
  const subtotal = orderDetails.subtotal ?? (orderDetails.items?.reduce((total, item) => total + item.price * item.quantity, 0) || 0);
  const gst = orderDetails.gst ?? subtotal * 0.18;
  const shipping = 99; // or use orderDetails.shipping if available
  const total = orderDetails.total ?? (subtotal + gst + shipping);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-green-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
        >
          <Check className="text-white" size={48} />
        </motion.div>

        <h1 className="text-3xl font-bold text-green-800 mb-4">
          Order Confirmed!
        </h1>
        
        <div className="text-2xl font-bold text-green-700 mb-2">Total Paid: ₹{total.toLocaleString()}</div>

        <div className="text-green-600 mb-6">
          <p>Thank you, {orderDetails.fullName}</p>
          <p>Your order has been successfully placed.</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Order Details
          </h2>
          <p>Delivery to: {orderDetails.address}</p>
          <p>City: {orderDetails.city}</p>
          <p>Pincode: {orderDetails.pincode}</p>
          <p>Payment Method: {orderDetails.paymentMethod}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Order Summary
          </h2>
          {orderDetails.items.map((item) => (
            <div 
              key={item.id || item.productId} 
              className="flex justify-between"
            >
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
           <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-green-700">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-green-700">Shipping</span>
                  <span className="font-medium">₹{shipping}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-green-700">Tax (18%)</span>
                  <span className="font-medium">₹{gst.toLocaleString()}</span>
                </div>
                </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="
            bg-green-500 
            text-white 
            px-6 py-3 
            rounded-lg 
            flex 
            items-center 
            space-x-2
            mx-auto
          "
        >
          <Home />
          <span>Back to Home</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OrderConfirmationPage;