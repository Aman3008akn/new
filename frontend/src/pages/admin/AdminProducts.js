import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { axiosInstance } from '../../App';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [productForm, setProductForm] = useState({
    sku: '',
    title: '',
    description: '',
    category: '',
    tags: [],
    status: 'active'
  });
  const [variantForm, setVariantForm] = useState({
    sku: '',
    attributes: {},
    price: 0,
    compare_at_price: 0,
    inventory_quantity: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?limit=200';
      if (search) url += `&search=${search}`;
      const { data } = await axiosInstance.get(url);
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/products', productForm);
      toast.success('Product created successfully');
      setShowProductModal(false);
      fetchProducts();
      setProductForm({ sku: '', title: '', description: '', category: '', tags: [], status: 'active' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axiosInstance.delete(`/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/products/${selectedProduct.id}/variants`, variantForm);
      toast.success('Variant created successfully');
      setShowVariantModal(false);
      fetchProducts();
      setVariantForm({ sku: '', attributes: {}, price: 0, compare_at_price: 0, inventory_quantity: 0 });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create variant');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="admin-products-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Products Management</h1>
            <p className="text-lg text-gray-600">Manage your product catalog</p>
          </div>
          <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
            <DialogTrigger asChild>
              <Button data-testid="create-product-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="product-modal">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    required
                    data-testid="product-sku-input"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={productForm.title}
                    onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    required
                    data-testid="product-title-input"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    required
                    data-testid="product-description-input"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                    data-testid="product-category-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-product">
                  Create Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="product-search"
            />
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200" data-testid="products-table">
                  {products.map((product) => (
                    <tr key={product.id} data-testid="product-row">
                      <td className="px-6 py-4">
                        <div className="font-medium" data-testid="product-row-title">{product.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowVariantModal(true);
                          }}
                          data-testid="add-variant-button"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Variant
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid="delete-product-button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Variant Modal */}
        <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
          <DialogContent data-testid="variant-modal">
            <DialogHeader>
              <DialogTitle>Add Variant to {selectedProduct?.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVariant} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="variant-sku">Variant SKU</Label>
                <Input
                  id="variant-sku"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm({...variantForm, sku: e.target.value})}
                  required
                  data-testid="variant-sku-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({...variantForm, price: parseFloat(e.target.value)})}
                    required
                    data-testid="variant-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="compare_price">Compare At Price</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    value={variantForm.compare_at_price}
                    onChange={(e) => setVariantForm({...variantForm, compare_at_price: parseFloat(e.target.value)})}
                    data-testid="variant-compare-price-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="inventory">Inventory Quantity</Label>
                <Input
                  id="inventory"
                  type="number"
                  value={variantForm.inventory_quantity}
                  onChange={(e) => setVariantForm({...variantForm, inventory_quantity: parseInt(e.target.value)})}
                  required
                  data-testid="variant-inventory-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-variant">
                Add Variant
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
