import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLogs from './pages/admin/AdminLogs';

// Components
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: API,
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const fetchCartCount = async () => {
    try {
      const { data } = await axiosInstance.get('/cart');
      const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setShowAuth(false);
    fetchCartCount();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar 
          user={user} 
          onShowAuth={() => setShowAuth(true)} 
          onLogout={handleLogout}
          cartCount={cartCount}
        />
        
        <Routes>
          <Route path="/" element={<HomePage user={user} onShowAuth={() => setShowAuth(true)} />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage user={user} onCartUpdate={fetchCartCount} onShowAuth={() => setShowAuth(true)} />} />
          <Route path="/cart" element={user ? <CartPage onUpdate={fetchCartCount} /> : <Navigate to="/" />} />
          <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/" />} />
          <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/" />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={user?.role === 'admin' || user?.role === 'super_admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/products" element={user?.role === 'admin' || user?.role === 'super_admin' ? <AdminProducts /> : <Navigate to="/" />} />
          <Route path="/admin/orders" element={user?.role === 'admin' || user?.role === 'super_admin' ? <AdminOrders /> : <Navigate to="/" />} />
          <Route path="/admin/coupons" element={user?.role === 'admin' || user?.role === 'super_admin' ? <AdminCoupons /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user?.role === 'admin' || user?.role === 'super_admin' ? <AdminUsers /> : <Navigate to="/" />} />
          <Route path="/admin/logs" element={user?.role === 'admin' || user?.role === 'super_admin' ? <AdminLogs /> : <Navigate to="/" />} />
        </Routes>

        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          onLogin={handleLogin}
        />
        
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
