

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Lock, 
  ChevronsRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useCart } from '../cart/CartContext';
import { calculateCartTotal } from '../utils/calculateCartTotal';
// import CartSlider from '../cart/CartSidebar';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  // State Management
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Effect to calculate total amount
  useEffect(() => {
    const { total } = calculateCartTotal(cart.items);
    setTotalAmount(total);
  }, [cart.items]);

  // Payment Methods
  const paymentMethods = [
    { id: 'credit', name: 'Credit Card', icon: <CreditCard className="text-blue-500" /> },
    { id: 'debit', name: 'Debit Card', icon: <CreditCard className="text-green-500" /> },
    { id: 'upi', name: 'UPI', icon: <Lock className="text-purple-500" /> }
  ];

  // Validation Functions
  const validateCardDetails = () => {
    const errors = {};
    const sanitizedCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!sanitizedCardNumber.match(/^\d{16}$/)) {
      errors.cardNumber = 'Invalid card number (16 digits required)';
    }
    if (!cardDetails.cardName.trim() || cardDetails.cardName.trim().length < 3) {
      errors.cardName = 'Valid card holder name is required';
    }
    const currentDate = new Date();
    const [month, year] = cardDetails.expiryDate.split('/').map(Number);
    const expiryDate = new Date(2000 + year, month - 1);
    if (!cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      errors.expiryDate = 'Invalid expiry date format (MM/YY)';
    } else if (expiryDate < currentDate) {
      errors.expiryDate = 'Card has expired';
    }
    if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
      errors.cvv = 'Invalid CVV (3-4 digits)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUPI = () => {
    const errors = {};
    const upiRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9]+$/;
    if (!upiId.trim().match(upiRegex)) {
      errors.upiId = 'Invalid UPI ID (e.g., username@bankname)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Payment Processing
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      let isValid = false;
      if (paymentMethod === 'upi') {
        isValid = validateUPI();
      } else if (['credit', 'debit'].includes(paymentMethod)) {
        isValid = validateCardDetails();
      }
      if (!isValid) {
        setIsProcessing(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      clearCart();
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Payment Error:', error);
      setIsProcessing(false);
    }
  };

  // Render Payment Form
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'credit':
      case 'debit':
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-green-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => {
                    const formattedNumber = e.target.value
                      .replace(/\s/g, '')
                      .replace(/(\d{4})/g, '$1 ')
                      .trim();
                    setCardDetails({ ...cardDetails, cardNumber: formattedNumber });
                  }}
                  maxLength="19"
                  className="w-full p-3 border rounded-lg"
                />
                {formErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-700 mb-2">Card Holder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                  {formErrors.cardName && <p className="text-red-500 text-sm mt-1">{formErrors.cardName}</p>}
                </div>
                <div>
                  <label className="block text-green-700 mb-2">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/25"
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                    maxLength="5"
                    className="w-full p-3 border rounded-lg"
                  />
                  {formErrors.expiryDate && <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-green-700 mb-2">CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  maxLength="4"
                  className="w-full p-3 border rounded-lg"
                />
                {formErrors.cvv && <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>}
              </div>
            </motion.div>
          </AnimatePresence>
        );
      case 'upi':
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-green-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                {formErrors.upiId && <p className="text-red-500 text-sm mt-1">{formErrors.upiId}</p>}
              </div>
            </motion.div>
          </AnimatePresence>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-green-50">
      <CartSlider />

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-grow p-8 max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Payment</h1>

          {/* Order Summary */}
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-green-800">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span>{cart.items.length}</span>
              </div>
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.name}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Select Payment Method</h2>
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center p-4 rounded-lg ${
                    paymentMethod === method.id ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {method.icon}
                  <span className="mt-2">{method.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          {paymentMethod && renderPaymentForm()}

          {/* Payment Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={isProcessing || !paymentMethod}
            className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
              isProcessing || !paymentMethod ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold`}
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>Pay Now</span>
                <ChevronsRight />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
