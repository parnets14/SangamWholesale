
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';
import CartSidebar from '../cart/CartSidebar';
import { categories } from '../Category/categories'; // Import your categories data

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          YourStore
        </Link>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-blue-600"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Categories Dropdown */}
          <div className="relative group">
            <button className="text-gray-800 hover:text-blue-600 font-medium">
              Categories
            </button>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 w-64 p-4">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  onMouseEnter={() => setHoveredCategory(category)}
                  className="relative"
                >
                  <Link 
                    to={`/category/${category.id}`}
                    className="py-2 hover:bg-blue-50 rounded px-2 flex items-center"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories Dropdown */}
          {hoveredCategory && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg p-6 mt-2">
              <div className="container mx-auto grid grid-cols-4 gap-4">
                {hoveredCategory.subcategories.map((subcategory) => (
                  <div key={subcategory.id}>
                    <h3 className="font-bold mb-2 text-gray-800">
                      {subcategory.name}
                    </h3>
                    <ul className="space-y-1">
                      {subcategory.products.slice(0, 5).map((product) => (
                        <li key={product.id}>
                          <Link 
                            to={`/product/${product.id}`}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/" className="text-gray-800 hover:text-blue-600">
            Home
          </Link>
        </div>

        {/* Search and Cart */}
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="border rounded-full px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="text-gray-800 hover:text-blue-600 relative"
          >
            <ShoppingCart size={24} />
            {/* Cart Item Count */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {categories.map((category) => (
              <div key={category.id}>
                <Link 
                  to={`/category/${category.id}`}
                  className="py-2 hover:bg-blue-50 rounded px-2 flex items-center"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <CartSidebar onClose={() => setIsCartOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;