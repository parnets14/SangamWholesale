import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  Package,
  Award,
  CheckCircle,
  Info,
  ShoppingBag,
} from "lucide-react";
import { useUserApi } from "../context/UserApiContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartIcon from "./CartIcon";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getProductById, products } = useUserApi();

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get from location state (if navigated from product list)
        if (location.state?.product) {
          setProduct(location.state.product);
          setLoading(false);
          return;
        }

        // If not in state, try to find in products array
        const foundProduct = products.find(
          (p) => p.id === productId || p._id === productId
        );
        if (foundProduct) {
          setProduct(foundProduct);
          setLoading(false);
          return;
        }

        // If not found in array, fetch from API
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (err) {
        setError("Failed to load product details");
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, location.state, products, getProductById]);

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => Math.min(product.stock, prev + 1));
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (!product) return;
    // Ensure all fields for cart display
    const cartProduct = {
      _id: product._id || product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      brand: product.brand,
      description: product.description,
      unit: product.unit,
      quantity,
    };
    addToCart(cartProduct);
    alert(`${product.name} has been added to your cart.`);
    setQuantity(1);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    alert(
      !isWishlisted
        ? `❤️ ${product.name} has been added to your wishlist.`
        : `💔 ${product.name} has been removed from your wishlist.`
    );
  };

  const shareProduct = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `🌾 Check out this premium rice: ${product.name}\n💰 Only ₹${product.price}/${product.unit}\n\nOrder now on Udaan!`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Product link copied to clipboard!");
      }
    } catch (error) {
      alert("Share failed: " + error.message);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/ri3.avif"; // fallback image
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#702834] mb-2">
            {error || "Product not found"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#702834' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor='#5a1f29'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor='#702834'}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const hasDiscount = product.discountPrice && product.discountPrice > 0;
  const originalPrice = hasDiscount
    ? product.price + product.discountPrice
    : product.price;
  const discountPercent = hasDiscount
    ? Math.round((product.discountPrice / originalPrice) * 100)
    : 0;
  const totalPrice = product.price * quantity;
  const totalSavings = hasDiscount ? product.discountPrice * quantity : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="text-white shadow-lg" style={{ backgroundColor: '#702834' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">
            Product Details
          </h1>
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Cart"
          >
            <CartIcon itemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
          </button>
        </div>
      </div>

      <div className="pb-32">
        {/* Add bottom padding for fixed bottom bar */}
        {/* Enhanced Product Image */}
        <div className="relative h-150 bg-gray-100 mb-3">
          <img
            src={
              product.image ||
              `https://sangamwholesale.com/subcategories/${subcategory.image}`
            }
            alt={product.name}
            className="w-full h-full object-contain"
            onError={handleImageError}
          />

          {/* Stock Badge */}
          <div className="absolute top-4 left-4 bg-green-600 bg-opacity-90 text-white px-3 py-2 rounded-full flex items-center shadow-lg">
            <Package className="w-3 h-3 mr-1" />
            <span className="text-xs font-semibold">
              {product.stock} in stock
            </span>
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
              <span className="text-xs font-bold">-{discountPercent}% OFF</span>
            </div>
          )}

          {/* Floating Action Buttons */}
          <button
            onClick={toggleWishlist}
            className={`absolute bottom-5 right-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isWishlisted
                ? "bg-red-500 bg-opacity-90"
                : "bg-black bg-opacity-60 hover:bg-opacity-80"
            }`}
          >
            <Heart
              className={`w-5 h-5 text-white ${
                isWishlisted ? "fill-current" : ""
              }`}
            />
          </button>

          <button
            onClick={shareProduct}
            className="absolute bottom-5 right-5 w-12 h-12 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* Enhanced Product Info */}
        <div className="px-5 py-4">
          {/* Brand and Rating Row */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Award className="w-4 h-4 text-[#702834] mr-1" />
              <span className="text-sm font-semibold text-[#702834]">
                {product.brand || product.subcategoryName || "Premium Quality"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600 ml-1">
                4.2 (89)
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline mb-1">
              <span className="text-3xl font-bold text-[#702834] mr-2">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-600 mr-3">
                {product.quantity} {product.unit}
              </span>
              {hasDiscount && (
                <span className="text-lg line-through text-gray-500">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-[#702834] font-semibold">
                You save ₹{product.discountPrice} {product.quantity}{" "}
                {product.unit}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-base text-gray-700 leading-relaxed opacity-80">
            {product.description}
          </p>
        </div>
        {/* Enhanced Quantity Selector */}
        <div className="mx-5 mb-5 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center mb-4">
            <ShoppingBag className="w-5 h-5 text-[#702834] mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Select Quantity</h3>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center bg-gray-50 rounded-full p-1">
              <button
                onClick={() => handleQuantityChange("decrease")}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4 text-[#702834]" />
              </button>
              <div className="px-5 text-center">
                <div className="text-lg font-bold text-gray-800">
                  {quantity}
                </div>
                <div className="text-xs text-gray-600">{product.unit}</div>
              </div>
              <button
                onClick={() => handleQuantityChange("increase")}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4 text-[#702834]" />
              </button>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-gray-800">
                Total: ₹{totalPrice}
              </div>
              {totalSavings > 0 && (
                <div className="text-xs text-[#702834] font-semibold">
                  Save: ₹{totalSavings}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Product Highlights */}
        <div className="mx-5 mb-5 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-[#702834] mr-2" />
            <h3 className="text-lg font-bold text-gray-800">
              Product Highlights
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center bg-gray-50 p-3 rounded-xl">
              <Shield className="w-5 h-5 text-teal-500 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                Premium Quality
              </span>
            </div>
            <div className="flex items-center bg-gray-50 p-3 rounded-xl">
              <Truck className="w-5 h-5 text-teal-500 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                Fast Delivery
              </span>
            </div>
            <div className="flex items-center bg-gray-50 p-3 rounded-xl">
              <Heart className="w-5 h-5 text-teal-500 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                Healthy Choice
              </span>
            </div>
            <div className="flex items-center bg-gray-50 p-3 rounded-xl">
              <Award className="w-5 h-5 text-teal-500 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                Best Taste
              </span>
            </div>
          </div>
        </div>
        {/* Product Specifications */}
        <div className="mx-5 mb-5 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center mb-4">
            <Info className="w-5 h-5 text-[#702834] mr-2" />
            <h3 className="text-lg font-bold text-gray-800">
              Product Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Type
              </div>
              <div className="text-base font-medium text-gray-800">
                {product.subcategoryName || "Premium Rice"}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Unit
              </div>
              <div className="text-base font-medium text-gray-800">
                {product.quantity} {product.unit}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Stock
              </div>
              <div className="text-base font-medium text-gray-800">
                {product.stock} available
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Quality
              </div>
              <div className="text-base font-medium text-gray-800">Grade A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 rounded-t-3xl">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-[#702834] mr-2">
                ₹{totalPrice}
              </span>
              {totalSavings > 0 && (
                <span className="text-xs text-[#702834] font-semibold">
                  Save ₹{totalSavings}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex items-center text-white px-7 py-3 rounded-full font-bold shadow-lg transition-all ${
              product.stock > 0
                ? "hover:shadow-xl transform hover:scale-105"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            style={product.stock > 0 ? { backgroundColor: '#702834' } : {}}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
