import { useState } from 'react';
import './AdminProducts.css';
import { Plus, Edit2, Archive, X } from 'lucide-react';

const AdminProducts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([
    { sku: 'CAM-PRO-01', name: 'Pro Camera Kit 1', cat: 'Photography', price: '₹4,500/day', stock: 5, depositRule: '20% of Value', lateFeeRule: '₹500/day' },
    { sku: 'DRN-MAX-02', name: 'Drone Pro Max', cat: 'Videography', price: '₹6,000/day', stock: 2, depositRule: 'Fixed ₹5000', lateFeeRule: '₹1000/day' },
    { sku: 'LGT-STD-01', name: 'Lighting Stand Basic', cat: 'Lighting', price: '₹1,200/day', stock: 12, depositRule: 'Fixed ₹1000', lateFeeRule: '₹200/day' },
  ]);

  const [newProduct, setNewProduct] = useState({ 
    sku: '', name: '', cat: 'Photography', price: '', stock: 0, 
    depositRule: '', lateFeeRule: '', rentalPeriods: '',
    lateFeeUnit: 'Daily', lateFeeAmount: 500, gracePeriod: 120, maxFee: 5000
  });

  const handleAddProduct = () => {
    if (newProduct.sku && newProduct.name) {
      setProducts([...products, { ...newProduct }]);
      setShowAddModal(false);
      setNewProduct({ 
        sku: '', name: '', cat: '', price: '', stock: 0,
        depositRule: 'Fixed ₹2000 per order',
        lateFeeRule: '₹500 / day',
        rentalPeriods: 'Daily, Weekly',
        lateFeeUnit: 'Daily', lateFeeAmount: 500, gracePeriod: 120, maxFee: 5000
      });
    }
  };

  return (
    <div className="admin-products-container animate-fade-in relative">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Product Catalog</h1>
          <p className="subtitle">Manage products, variants, and inventory pricing rules</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="table-container glass-panel mt-4">
        <table className="admin-table w-full text-left">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>Rules</th>
              <th>Available Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.sku}>
                <td><span className="sku-badge">{prod.sku}</span></td>
                <td className="font-medium">{prod.name}</td>
                <td>{prod.cat}</td>
                <td>{prod.price}</td>
                <td>
                  <div className="text-xs text-gray-400">Deposit: {prod.depositRule}</div>
                  <div className="text-xs text-gray-400">Late Fee: {prod.lateFeeRule}</div>
                </td>
                <td>
                  <span className={`status-badge ${prod.stock < 3 ? 'status-warning' : 'status-active'}`}>
                    {prod.stock} units
                  </span>
                </td>
                <td>
                  <div className="action-buttons flex gap-2">
                    <button className="icon-btn edit-btn" title="Edit Product"><Edit2 size={16} /></button>
                    <button className="icon-btn archive-btn" title="Archive"><Archive size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
          <div className="glass-panel p-6 w-full max-w-2xl animate-fade-in border border-indigo-500/30 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Product & Pricing Rules</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-indigo-400 mb-2 border-b border-gray-700 pb-2">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">SKU</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. CAM-02" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Product Name</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Cinema Camera" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Category</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.cat} onChange={e => setNewProduct({...newProduct, cat: e.target.value})} placeholder="e.g. Photography" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Base Price</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="e.g. ₹5,000/day" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Initial Stock</label>
                  <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <h3 className="text-lg font-medium text-indigo-400 mb-2 mt-6 border-b border-gray-700 pb-2">Pricing & Penalty Rules</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Security Deposit</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.depositRule} onChange={e => setNewProduct({...newProduct, depositRule: e.target.value})} placeholder="e.g. 20% or ₹5000" />
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded border border-gray-700 space-y-3">
                  <label className="block text-gray-300 text-sm font-medium">Late Return Configuration</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Fee Type</label>
                      <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" value={newProduct.lateFeeUnit || 'Daily'} onChange={e => setNewProduct({...newProduct, lateFeeUnit: e.target.value})}>
                        <option>Hourly</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Amount (₹)</label>
                      <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" value={newProduct.lateFeeAmount || 500} onChange={e => setNewProduct({...newProduct, lateFeeAmount: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Grace Period (Minutes)</label>
                      <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" value={newProduct.gracePeriod || 120} onChange={e => setNewProduct({...newProduct, gracePeriod: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Maximum Cap (₹)</label>
                      <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" value={newProduct.maxFee || 5000} onChange={e => setNewProduct({...newProduct, maxFee: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full mt-6 justify-center py-3" onClick={handleAddProduct}>Save Product & Rules</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
