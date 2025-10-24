import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/currency';

export default function ProductCard({ product, variant, onAddToCart }) {
  const displayVariant = variant || product.variants?.[0];
  const displayImage = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div className="glass rounded-xl overflow-hidden hover-lift" data-testid="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={displayImage} 
            alt={product.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            data-testid="product-image"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600" data-testid="product-title">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid="product-description">
          {product.description}
        </p>

        {displayVariant && (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900" data-testid="product-price">
                {formatCurrency(displayVariant.price)}
              </span>
              {displayVariant.compare_at_price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatCurrency(displayVariant.compare_at_price)}
                </span>
              )}
            </div>
            
            {onAddToCart && displayVariant.inventory_quantity > 0 && (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(displayVariant.id);
                }}
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        )}

        {displayVariant && displayVariant.inventory_quantity === 0 && (
          <span className="text-red-500 text-sm font-medium">Out of Stock</span>
        )}
      </div>
    </div>
  );
}
