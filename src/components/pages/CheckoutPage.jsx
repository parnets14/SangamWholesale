import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  CreditCard, 
  Check, 
  Home, 
  Package,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Banknote,
  Edit,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  const { user, token } = useAuth();

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment and notes
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [orderNotes, setOrderNotes] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);
  const [coupon, setCoupon] = useState('');

  // Fetch addresses
  useEffect(() => {
    if (!token) {
      setLoadingAddresses(false);
      return;
    }
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const response = await fetch('https://sangamwholesale.com/api/addresses/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          const addressesArr = data.addresses || [];
          setAddresses(addressesArr);
          const defaultAddress = addressesArr.find(addr => addr.default) || addressesArr[0];
          setSelectedAddress(defaultAddress);
        } else {
          setAddresses([]);
          setSelectedAddress(null);
        }
      } catch (err) {
        setAddresses([]);
        setSelectedAddress(null);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [token]);

  // Helpers
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.shopName}, ${address.shopNumber}, ${address.areaName}, ${address.town}, ${address.city} - ${address.pincode}`;
  };

  // Place order
  const handlePlaceOrder = async () => {
    setError('');
    setSuccess('');
    if (!token) {
      setError('Please login to place your order.');
      return;
    }
    if (!selectedAddress) {
      setError('Please select a delivery address.');
      return;
    }
    setPlacingOrder(true);
    try {
      const subtotal = getTotal();
      const gst = subtotal * 0.18;
      const total = subtotal * 1.18;
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: formatAddress(selectedAddress),
        addressName: selectedAddress.shopName,
        addressContact: selectedAddress.deliveryContact || '',
        paymentMethod,
        orderNotes,
        subtotal,
        gst,
        total,
        orderId: `UD${Math.floor(Math.random() * 1000000)}`,
      };
      const response = await fetch('https://sangamwholesale.com/api/orders/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (response.ok) {
        clearCart();
        setSuccess('Order placed successfully!');
        setTimeout(() => {
          navigate('/order-confirmation', { state: { orderDetails: {
            orderId: data.order.orderId,
            amount: data.order.total,
            subtotal: data.order.subtotal,
            gst: data.order.gst,
            total: data.order.total,
            items: data.order.items,
            fullName: user?.fullName || '',
            address: data.order.deliveryAddress,
            city: selectedAddress?.city || '',
            pincode: selectedAddress?.pincode || '',
            paymentMethod,
          }} });
        }, 1200);
      } else {
        setError(data.message || 'Could not place order');
      }
    } catch (err) {
      setError('Order Error: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Payment Methods
  const paymentMethods = [
    { 
      id: 'credit', 
      name: 'Credit Card', 
      icon: <CreditCard className="text-blue-500" /> 
    },
    { 
      id: 'debit', 
      name: 'Debit Card', 
      icon: <CreditCard className="text-green-500" /> 
    },
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: <Home className="text-purple-500" /> 
    },
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      icon: <Banknote className="text-green-600" /> 
    }
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const slideIn = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const scaleUp = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={scaleUp}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" strokeWidth={2} />
          </div>
          
          <motion.h1 
            className="text-3xl font-bold text-green-800 mb-4"
            variants={fadeIn}
          >
            Order Confirmed!
          </motion.h1>
          
          <motion.p 
            className="text-green-700 mb-6"
            variants={fadeIn}
          >
            Thank you for your purchase. Your order has been placed successfully.
          </motion.p>
          
          <motion.div 
            className="bg-green-50 rounded-lg p-4 mb-6"
            variants={fadeIn}
          >
            <div className="flex justify-between mb-2">
              <span className="font-medium">Order Total:</span>
              <span className="font-bold">₹{getTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment Method:</span>
              <span className="font-bold">
                {paymentMethods.find(m => m.id === paymentMethod)?.name}
              </span>
            </div>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-2 p-2 rounded hover:bg-gray-200">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-2xl font-bold">Checkout</h2>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="text-red-600 mr-2" size={20} />
            <span className="font-semibold text-lg flex-1">Delivery Address</span>
            {token && addresses.length > 0 && (
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={() => navigate('/address', { state: { address: selectedAddress } })}
              >Change</button>
            )}
          </div>
          {!token ? (
            <div className="flex flex-col items-center py-6">
              <span className="text-gray-500 mb-2">Please login to add delivery address</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => navigate('/login')}>Login</button>
            </div>
          ) : loadingAddresses ? (
            <div className="flex items-center py-6"><span className="animate-spin mr-2">⏳</span>Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <span className="text-gray-500 mb-2">No delivery address found</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => navigate('/address')}>Add Address</button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{selectedAddress?.shopName}</div>
                  <div className="text-gray-600 text-sm">{formatAddress(selectedAddress)}</div>
                  <div className="text-gray-500 text-xs mt-1">{selectedAddress?.deliveryContact}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <ShoppingCart className="text-red-600 mr-2" size={20} />
            <span className="font-semibold text-lg">Order Summary ({cartItems.length} items)</span>
          </div>
          <div>
            {cartItems.map((item, idx) => (
              <div key={item._id} className="flex items-center border-b last:border-b-0 py-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover mr-4 bg-gray-100" />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-gray-500 text-sm">{item.brand} {item.unit && `| ${item.unit}`}</div>
                  <div className="text-gray-400 text-xs line-clamp-1">{item.description}</div>
                  <div className="text-gray-600 text-xs">Qty: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">₹{item.price.toLocaleString()} / {item.unit || 'unit'}</div>
                </div>
                        </div>
                    ))}
                  </div>
        </div>

        {/* Coupon */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4 cursor-pointer" onClick={() => setShowCoupons(!showCoupons)}>
            <Tag className="text-red-600 mr-2" size={20} />
            <span className="font-semibold text-lg flex-1">Apply Coupon</span>
            <span className="text-gray-400">{showCoupons ? '▲' : '▼'}</span>
          </div>
          {showCoupons && (
            <div className="flex gap-2 mt-2">
              <input
                className="border rounded px-3 py-2 flex-1"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
              />
              <button className="bg-red-600 text-white px-4 py-2 rounded">Apply</button>
            </div>
          )}
                      </div>
                      
        {/* Payment Method */}
        {token && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center mb-4">
              <CreditCard className="text-red-600 mr-2" size={20} />
              <span className="font-semibold text-lg">Payment Options</span>
            </div>
            <div className="flex gap-4">
              <button
                className={`flex-1 border rounded p-4 flex flex-col items-center ${paymentMethod === 'credit' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('credit')}
              >
                <span className="mb-1"><CreditCard className="inline text-blue-500" size={18} /></span>
                <span className="font-semibold">Udaan Credit</span>
                <span className="text-xs text-gray-500">Pay in 7 days • No interest</span>
                {paymentMethod === 'credit' && <Check className="text-red-600 mt-2" size={16} />}
              </button>
                        <button 
                className={`flex-1 border rounded p-4 flex flex-col items-center ${paymentMethod === 'upi' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('upi')}
                        >
                <span className="mb-1"><Banknote className="inline text-green-500" size={18} /></span>
                <span className="font-semibold">UPI Payment</span>
                <span className="text-xs text-gray-500">Pay instantly via UPI</span>
                {paymentMethod === 'upi' && <Check className="text-red-600 mt-2" size={16} />}
                        </button>
                        <button 
                className={`flex-1 border rounded p-4 flex flex-col items-center ${paymentMethod === 'cod' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('cod')}
                        >
                <span className="mb-1"><Home className="inline text-yellow-500" size={18} /></span>
                <span className="font-semibold">Cash on Delivery</span>
                <span className="text-xs text-gray-500">Pay when you receive</span>
                {paymentMethod === 'cod' && <Check className="text-red-600 mt-2" size={16} />}
                        </button>
                      </div>
          </div>
        )}

        {/* Order Notes */}
        {token && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center mb-4">
              <Edit className="text-red-600 mr-2" size={20} />
              <span className="font-semibold text-lg">Order Notes</span>
            </div>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[60px]"
              placeholder="Add any special instructions for delivery..."
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
            />
              </div>
        )}
              
        {/* Price Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
            <span className="font-semibold">₹{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
            <span className="text-gray-600">Delivery Charges</span>
            <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between mb-2">
            <span className="text-gray-600">GST</span>
            <span className="font-semibold">₹{(getTotal() * 0.18).toLocaleString()}</span>
                </div>
          <div className="border-t my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Payable</span>
            <span>₹{(getTotal() * 1.18).toLocaleString()}</span>
                </div>
              </div>
              
        {/* Error/Success */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

        {/* Place Order Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-white py-4 flex justify-end z-10">
          <button
            className={`bg-red-600 text-white px-8 py-3 rounded font-bold text-lg shadow ${placingOrder || !token || !selectedAddress || cartItems.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handlePlaceOrder}
            disabled={placingOrder || !token || !selectedAddress || cartItems.length === 0}
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;