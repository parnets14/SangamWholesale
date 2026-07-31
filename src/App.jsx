import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import { AdminProvider } from "./components/context/AdminContext";
import { AdminApiProvider } from "./components/context/AdminApiContext";
import { UserApiProvider } from "./components/context/UserApiContext";
import { CartProvider } from "./components/context/CartContext";
import { Toaster } from "react-hot-toast";

//  header Common Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import LoggedInHeader from "./components/common/LoggedInHeader";
import LoggedInFooter from "./components/common/LoggedInFooter";

//welcome screen
import WelcomePage from "./components/pages/WelcomePage";
import Login from "./components/auth/Login";
import OTPVerification from "./components/auth/OTPVerification";
import PersonalDetails from "./components/auth/PersonalDetails";
import BusinessDetails from "./components/auth/BusinessDetails";
import NotFoundPage from "./components/pages/NotFoundPage";
import CategoryPage from "./components/rr/CategoryPage";

import SubPage from "./components/rr/Subpage";
import CategoryScreen from "./components/rr/CategoryScreen";
import SubcategoryScreen from "./components/rr/SubcategoryScreen";
import ProductScreen from "./components/rr/ProductScreen";

//Home Components
import HomePage from "./components/pages/Home";

import Pro from "./components/rr/Pro";
import CartPag from "./components/rr/CartPag";
import ProductDetails from "./components/rr/ProductDetails";
import CheckoutPage from "./components/pages/CheckoutPage";
import OrderConfirmationPage from "./components/pages/OrderConfirmationPage";
import ProfilePage from "./components/pages/ProfilePage";
import About from "./components/home/About";
import Address from "./components/pages/Address";
import DownloadPage from "./components/pages/DownloadPage";
import { Navigate } from "react-router-dom";

// Admin Components
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import Banner from "./components/admin/BannerPage";
import Aboutman from "./components/admin/Aboutman";
import Leadershi from "./components/admin/Leadershi";
import Startkyc from "./components/admin/Startkyc";
import LogoAdmin from "./components/admin/LogoAdmin";
import Category from "./components/admin/Category";
import SubCategory from "./components/admin/Subcategory";
import Product from "./components/admin/Product";
import Ecosystem from "./components/admin/Ecosystem";
import Businesses from "./components/admin/Businesses";
import User from "./components/admin/User";
import AddressAdmin from "./components/admin/AddressAdmin";
import ReturnOrders from "./components/admin/ReturnOrders";
import Orders from "./components/admin/Orders";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const [cartItems, setCartItems] = useState([]);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Function to update cart items
  const updateCartItems = (newCartItems) => {
    setCartItems(newCartItems);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute &&
        (isAuthenticated ? (
          <LoggedInHeader cartItems={cartItems} />
        ) : (
          <Header cartItems={cartItems} />
        ))}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/otp" element={<OTPVerification />} />
          <Route path="/personal-details" element={<PersonalDetails />} />
          <Route path="/business-details" element={<BusinessDetails />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/download-android" element={<DownloadPage />} />
          <Route path="/download-ios" element={<DownloadPage />} />
          <Route path="/Home" element={<HomePage />} />

          {/* Category Routes with Cart State */}
          <Route
            path="/categories/:categoryId"
            element={
              <SubPage
                cartItems={cartItems}
                setCartItems={setCartItems}
                addToCart={addToCart}
              />
            }
          />

          <Route
            path="/categories/:categoryId/:subCategoryId"
            element={
              <Pro
                cartItems={cartItems}
                setCartItems={setCartItems}
                addToCart={addToCart}
              />
            }
          />

          {/* Product Details Route */}
          <Route
            path="/product/:productId"
            element={
              <ProductDetails
                cartItems={cartItems}
                setCartItems={setCartItems}
                addToCart={addToCart}
              />
            }
          />

          {/* Cart Page */}
          <Route
            path="/cart"
            element={
              <CartPag
                cartItems={cartItems}
                updateCartItems={updateCartItems}
              />
            }
          />

          {/* Category Page */}
          <Route
            path="/categories"
            element={
              <div className="container mx-auto p-4">
                <CategoryPage
                  currentCategory={currentCategory}
                  currentSubcategory={currentSubcategory}
                  setCurrentCategory={setCurrentCategory}
                  setCurrentSubcategory={setCurrentSubcategory}
                />
              </div>
            }
          />

          {/* Checkout */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation"
            element={<OrderConfirmationPage />}
          />
          <Route path="/address" element={<Address />} />

          {/* New 3-Screen Navigation */}
          <Route path="/categories3" element={<CategoryScreen />} />
          <Route path="/subcategories/:categoryId" element={<SubcategoryScreen />} />
          <Route path="/products/:subcategoryId" element={<ProductScreen />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="banner" element={<Banner />} />
            <Route path="aboutman" element={<Aboutman />} />
            <Route path="leadershi" element={<Leadershi />} />
            <Route path="startkyc" element={<Startkyc />} />
            <Route path="Logo" element={<LogoAdmin />} />
            <Route path="Category" element={<Category />} />
            <Route path="Subcategory" element={<SubCategory />} />
            <Route path="product" element={<Product />} />
            <Route path="ecosystem" element={<Ecosystem />} />
            <Route path="businesses" element={<Businesses />} />
            <Route path="return-orders" element={<ReturnOrders />} />
            <Route path="orders" element={<Orders />} />
            <Route path="user" element={<User />} />
            <Route path="address" element={<AddressAdmin />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdminRoute && (isAuthenticated ? <LoggedInFooter /> : <Footer />)}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <CartProvider>
        <AuthProvider>
          <UserApiProvider>
            <AdminProvider>
              <AdminApiProvider>
                <AppContent />
              </AdminApiProvider>
            </AdminProvider>
          </UserApiProvider>
        </AuthProvider>
      </CartProvider>
    </Router>
  );
}
