import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { axiosInstance } from '../../App';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    min_order_value: 0,
    max_discount: null,
    usage_limit: null,
    valid_from: '',
    valid_to: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/coupons?limit=200');
      setCoupons(data.coupons);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponForm,
        value: parseFloat(couponForm.value),
        min_order_value: parseFloat(couponForm.min_order_value),
        max_discount: couponForm.max_discount ? parseFloat(couponForm.max_discount) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
        valid_from: new Date(couponForm.valid_from).toISOString(),
        valid_to: new Date(couponForm.valid_to).toISOString()
      };
      
      await axiosInstance.post('/admin/coupons', payload);
      toast.success('Coupon created successfully');
      setShowModal(false);
      fetchCoupons();
      setCouponForm({
        code: '',
        type: 'percentage',
        value: 0,
        min_order_value: 0,
        max_discount: null,
        usage_limit: null,
        valid_from: '',
        valid_to: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create coupon');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="admin-coupons-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Coupons Management</h1>
            <p className="text-lg text-gray-600">Create and manage promotional codes</p>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button data-testid="create-coupon-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="coupon-modal">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCoupon} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                    required
                    data-testid="coupon-code-input"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Discount Type</Label>
                  <select
                    id="type"
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({...couponForm, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    data-testid="coupon-type-input"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="value">
                    {couponForm.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount ($)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({...couponForm, value: e.target.value})}
                    required
                    data-testid="coupon-value-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_order">Min Order Value ($)</Label>
                    <Input
                      id="min_order"
                      type="number"
                      step="0.01"
                      value={couponForm.min_order_value}
                      onChange={(e) => setCouponForm({...couponForm, min_order_value: e.target.value})}
                      data-testid="coupon-min-order-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_discount">Max Discount ($)</Label>
                    <Input
                      id="max_discount"
                      type="number"
                      step="0.01"
                      value={couponForm.max_discount || ''}
                      onChange={(e) => setCouponForm({...couponForm, max_discount: e.target.value || null})}
                      data-testid="coupon-max-discount-input"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={couponForm.usage_limit || ''}
                    onChange={(e) => setCouponForm({...couponForm, usage_limit: e.target.value || null})}
                    data-testid="coupon-usage-limit-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_from">Valid From</Label>
                    <Input
                      id="valid_from"
                      type="datetime-local"
                      value={couponForm.valid_from}
                      onChange={(e) => setCouponForm({...couponForm, valid_from: e.target.value})}
                      required
                      data-testid="coupon-valid-from-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_to">Valid To</Label>
                    <Input
                      id="valid_to"
                      type="datetime-local"
                      value={couponForm.valid_to}
                      onChange={(e) => setCouponForm({...couponForm, valid_to: e.target.value})}
                      required
                      data-testid="coupon-valid-to-input"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" data-testid="submit-coupon">
                  Create Coupon
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Coupons Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200" data-testid="coupons-table">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} data-testid="coupon-row">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold" data-testid="coupon-code">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{coupon.type}</td>
                      <td className="px-6 py-4 text-sm">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                      </td>
                      <td className="px-6 py-4 text-sm">${coupon.min_order_value}</td>
                      <td className="px-6 py-4 text-sm">
                        {coupon.usage_count} / {coupon.usage_limit || '∞'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_to).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
