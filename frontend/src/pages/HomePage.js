import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Shield, Truck, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

export default function HomePage({ user, onShowAuth }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await axiosInstance.get('/products?limit=6');
      setFeaturedProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (variantId) => {
    if (!user) {
      onShowAuth();
      return;
    }

    try {
      await axiosInstance.post('/cart/items', { variant_id: variantId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen" data-testid="homepage">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Shop Smarter,
              </span>
              <br />
              <span className="text-gray-900">Live Better</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium products at unbeatable prices. Fast shipping, secure payments, and exceptional customer service.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <Button size="lg" className="text-lg px-8 py-6" data-testid="shop-now-button">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6"
                  onClick={onShowAuth}
                  data-testid="sign-up-button"
                >
                  Sign Up Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3" data-testid="feature-card">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-gray-600">Free shipping on orders over $100</p>
            </div>

            <div className="text-center space-y-3" data-testid="feature-card">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>

            <div className="text-center space-y-3" data-testid="feature-card">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>

            <div className="text-center space-y-3" data-testid="feature-card">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Quality Products</h3>
              <p className="text-gray-600">Curated collection of premium items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked items just for you</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline" data-testid="view-all-button">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold">Ready to Start Shopping?</h2>
          <p className="text-xl opacity-90">Join thousands of happy customers today</p>
          {!user && (
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6"
              onClick={onShowAuth}
              data-testid="cta-signup-button"
            >
              Create Your Account
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
