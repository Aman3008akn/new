import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { axiosInstance } from '../App';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/currency';

export default function CartPage({ onUpdate }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await axiosInstance.get('/cart');
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId, quantity) => {
    try {
      await axiosInstance.put(`/cart/items/${variantId}?quantity=${quantity}`);
      await fetchCart();
      onUpdate();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (variantId) => {
    try {
      await axiosInstance.delete(`/cart/items/${variantId}`);
      await fetchCart();
      onUpdate();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="cart-page">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Shopping Cart</h1>

        {isEmpty ? (
          <div className="glass rounded-2xl p-12 text-center" data-testid="empty-cart">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start adding some products!</p>
            <Button onClick={() => navigate('/products')} data-testid="continue-shopping">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.variant_id} className="glass rounded-xl p-6" data-testid="cart-item">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/100'} 
                        alt={item.product?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1" data-testid="cart-item-title">
                        {item.product?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.variant?.sku} - {Object.values(item.variant?.attributes || {}).join(' / ')}
                      </p>
                      <p className="text-lg font-bold" data-testid="cart-item-price">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button 
                        onClick={() => removeItem(item.variant_id)}
                        className="text-red-500 hover:text-red-600"
                        data-testid="remove-item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid="decrease-cart-quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-medium w-8 text-center" data-testid="cart-item-quantity">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          data-testid="increase-cart-quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-lg font-bold" data-testid="cart-item-total">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6 sticky top-20" data-testid="order-summary">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium" data-testid="cart-subtotal">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {subtotal >= 100 ? 'FREE' : formatCurrency(10)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{formatCurrency(subtotal * 0.1)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span data-testid="cart-total">
                        {formatCurrency(subtotal + (subtotal >= 100 ? 0 : 10) + subtotal * 0.1)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full text-lg py-6" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  data-testid="proceed-to-checkout"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
