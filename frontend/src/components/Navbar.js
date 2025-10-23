import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function Navbar({ user, onShowAuth, onLogout, cartCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SwiftCommerce
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="products-nav-link">
              Products
            </Link>
            
            {user && (
              <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="orders-nav-link">
                My Orders
              </Link>
            )}

            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 font-medium"
                data-testid="admin-nav-link"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="relative" data-testid="cart-nav-link">
                  <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" data-testid="cart-count">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-3">
                  <Link to="/profile" className="flex items-center space-x-2" data-testid="profile-link">
                    <User className="w-5 h-5 text-gray-700" />
                    <span className="text-sm text-gray-700">{user.full_name}</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLogout}
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={onShowAuth} data-testid="login-button">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in" data-testid="mobile-menu">
            <Link to="/products" className="block text-gray-700 hover:text-blue-600 font-medium">
              Products
            </Link>
            {user && (
              <>
                <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                </Link>
                <Link to="/orders" className="block text-gray-700 hover:text-blue-600">
                  My Orders
                </Link>
                <Link to="/profile" className="block text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link to="/admin" className="block text-purple-600 font-medium">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={onLogout} className="text-red-600 font-medium">
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Button onClick={onShowAuth} className="w-full">
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
