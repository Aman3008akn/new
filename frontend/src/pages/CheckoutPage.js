import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { axiosInstance } from '../App';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency } from '../lib/currency';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await axiosInstance.get('/cart');
      if (!data.items || data.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCart(data);
    } catch (error) {
      toast.error('Failed to load cart');
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create order and get payment intent
      const { data } = await axiosInstance.post('/checkout', {
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        coupon_code: couponCode || undefined
      });

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingAddress.full_name,
            address: {
              line1: shippingAddress.address_line1,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code,
              country: shippingAddress.country
            }
          }
        }
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm order
        await axiosInstance.post(`/orders/${data.order_id}/confirm`);
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const [discount, setDiscount] = useState(0);

  const applyCoupon = async () => {
    if (!couponCode) {
      setDiscount(0);
      toast.info('Coupon code cleared');
      return;
    }
    try {
      const { data } = await axiosInstance.get(`/coupons/validate/${couponCode}`);
      let calculatedDiscount = 0;
      const currentSubtotal = calculateSubtotal(); // Use current subtotal for calculation
      if (data.type === 'percentage') {
        calculatedDiscount = currentSubtotal * (data.value / 100);
        if (data.max_discount) {
          calculatedDiscount = Math.min(calculatedDiscount, data.max_discount);
        }
      } else {
        calculatedDiscount = data.value;
      }
      setDiscount(calculatedDiscount);
      toast.success(`Coupon "${couponCode}" applied!`);
    } catch (error) {
      setDiscount(0);
      toast.error(error.response?.data?.detail || 'Invalid coupon code');
    }
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = (subtotal - discount) * 0.1; // Tax after discount
  const total = subtotal - discount + shipping + tax;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={shippingAddress.full_name}
                      onChange={(e) => setShippingAddress({...shippingAddress, full_name: e.target.value})}
                      required
                      data-testid="shipping-name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input
                      id="address_line1"
                      value={shippingAddress.address_line1}
                      onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})}
                      required
                      data-testid="shipping-address1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address_line2"
                      value={shippingAddress.address_line2}
                      onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      required
                      data-testid="shipping-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      required
                      data-testid="shipping-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                      required
                      data-testid="shipping-postal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      required
                      data-testid="shipping-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Payment Information</h2>
                </div>
                <div className="mb-4">
                  <Label>Card Details</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-white" data-testid="card-element">
                    <CardElement options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': { color: '#aab7c4' },
                        },
                      }
                    }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Promo Code</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    data-testid="coupon-input"
                  />
                  <Button type="button" onClick={applyCoupon} data-testid="apply-coupon-button">
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-2" data-testid="coupon-discount-message">
                    Discount applied: {formatCurrency(discount)}
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6 sticky top-20" data-testid="checkout-summary">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  {cart?.items?.map(item => (
                    <div key={item.variant_id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product?.title} x {item.quantity}
                      </span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium" data-testid="checkout-subtotal">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium" data-testid="checkout-discount">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span data-testid="checkout-total">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-lg py-6" 
                  size="lg"
                  disabled={!stripe || loading}
                  data-testid="place-order-button"
                >
                  {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
