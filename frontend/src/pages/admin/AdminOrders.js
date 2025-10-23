import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { axiosInstance } from '../../App';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/admin/orders?limit=200';
      if (filter) url += `&status=${filter}`;
      const { data } = await axiosInstance.get(url);
      setOrders(data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status?status=${status}`);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="admin-orders-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Orders Management</h1>
          <p className="text-lg text-gray-600">View and manage customer orders</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === '' ? 'default' : 'outline'}
              onClick={() => setFilter('')}
              data-testid="filter-all"
            >
              All Orders
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              data-testid="filter-pending"
            >
              Pending
            </Button>
            <Button
              variant={filter === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setFilter('confirmed')}
              data-testid="filter-confirmed"
            >
              Confirmed
            </Button>
            <Button
              variant={filter === 'shipped' ? 'default' : 'outline'}
              onClick={() => setFilter('shipped')}
              data-testid="filter-shipped"
            >
              Shipped
            </Button>
            <Button
              variant={filter === 'delivered' ? 'default' : 'outline'}
              onClick={() => setFilter('delivered')}
              data-testid="filter-delivered"
            >
              Delivered
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center" data-testid="no-orders">
            <Package className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass rounded-xl p-6" data-testid="admin-order-card">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold" data-testid="admin-order-number">{order.order_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`} data-testid="admin-order-status">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      User ID: {order.user_id}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold mb-2" data-testid="admin-order-total">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Payment: {order.payment_status}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.sku} × {item.quantity}
                        </span>
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-1 text-sm">Shipping Address:</h4>
                    <p className="text-sm text-gray-600">
                      {order.shipping_address.full_name}<br />
                      {order.shipping_address.address_line1}<br />
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                      Phone: {order.shipping_address.phone}
                    </p>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      data-testid="confirm-order-button"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      data-testid="process-order-button"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Mark Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      data-testid="ship-order-button"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      data-testid="deliver-order-button"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Delivered
                    </Button>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      data-testid="cancel-order-button"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
