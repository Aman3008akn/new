import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

export default function ProductDetailPage({ user, onCartUpdate, onShowAuth }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axiosInstance.get(`/products/${id}`);
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      onShowAuth();
      return;
    }

    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    try {
      await axiosInstance.post('/cart/items', { 
        variant_id: selectedVariant.id, 
        quantity 
      });
      toast.success('Added to cart!');
      onCartUpdate();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20" data-testid="product-not-found">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  const displayImage = product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="glass rounded-2xl overflow-hidden">
            <img 
              src={displayImage} 
              alt={product.title} 
              className="w-full h-full object-cover"
              data-testid="product-detail-image"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="product-detail-title">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600" data-testid="product-detail-description">
                {product.description}
              </p>
            </div>

            {product.category && (
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block font-semibold text-lg">Select Option:</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      data-testid="variant-option"
                    >
                      {Object.values(variant.attributes).join(' / ')}
                      <span className="ml-2 text-sm">${variant.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            {selectedVariant && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold" data-testid="product-detail-price">
                    ${selectedVariant.price}
                  </span>
                  {selectedVariant.compare_at_price && (
                    <span className="text-xl text-gray-500 line-through">
                      ${selectedVariant.compare_at_price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600" data-testid="stock-info">
                  {selectedVariant.inventory_quantity > 0 
                    ? `${selectedVariant.inventory_quantity} in stock`
                    : 'Out of stock'
                  }
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {selectedVariant && selectedVariant.inventory_quantity > 0 && (
              <div className="space-y-3">
                <label className="block font-semibold text-lg">Quantity:</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="decrease-quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-medium w-12 text-center" data-testid="quantity-value">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedVariant.inventory_quantity, quantity + 1))}
                    data-testid="increase-quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            {selectedVariant && selectedVariant.inventory_quantity > 0 ? (
              <Button 
                size="lg" 
                className="w-full text-lg py-6"
                onClick={handleAddToCart}
                data-testid="add-to-cart-detail-button"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
