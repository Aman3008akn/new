import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { axiosInstance } from '../../App';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'from-orange-500 to-red-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'from-yellow-500 to-amber-600',
      bg: 'bg-yellow-50'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Overview of your e-commerce platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, idx) => (
            <div key={idx} className="glass rounded-xl p-6 hover-lift" data-testid="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold" data-testid="stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="glass rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition"
              data-testid="quick-link-products"
            >
              <Package className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Manage Products</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove products</p>
            </Link>

            <Link
              to="/admin/orders"
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition"
              data-testid="quick-link-orders"
            >
              <ShoppingCart className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">View Orders</h3>
              <p className="text-sm text-gray-600">Process and track orders</p>
            </Link>

            <Link
              to="/admin/coupons"
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition"
              data-testid="quick-link-coupons"
            >
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Manage Coupons</h3>
              <p className="text-sm text-gray-600">Create promotional codes</p>
            </Link>

            <Link
              to="/admin/users"
              className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:shadow-lg transition"
              data-testid="quick-link-users"
            >
              <Users className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage customers</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
