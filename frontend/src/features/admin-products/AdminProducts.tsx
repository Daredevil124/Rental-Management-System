import { useState } from 'react';
import './AdminProducts.css';
import { Plus, Edit2, Archive, X } from 'lucide-react';

const AdminProducts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([
    { sku: 'CAM-PRO-01', name: 'Pro Camera Kit 1', cat: 'Photography', price: '₹4,500/day', stock: 5 },
    { sku: 'DRN-MAX-02', name: 'Drone Pro Max', cat: 'Videography', price: '₹6,000/day', stock: 2 },
    { sku: 'LGT-STD-01', name: 'Lighting Stand Basic', cat: 'Lighting', price: '₹1,200/day', stock: 12 },
  ]);

  const [newProduct, setNewProduct] = useState({ sku: '', name: '', cat: '', price: '', stock: 0 });

  const handleAddProduct = () => {
    if (newProduct.sku && newProduct.name) {
      setProducts([...products, { ...newProduct }]);
      setShowAddModal(false);
      setNewProduct({ sku: '', name: '', cat: '', price: '', stock: 0 });
    }
  };

  return (
    <div className="admin-products-container animate-fade-in relative">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Product Catalog</h1>
          <p className="subtitle">Manage products, variants, and inventory</p>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-6 w-full max-w-md animate-fade-in border border-indigo-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">SKU</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. CAM-02" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Product Name</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Cinema Camera" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.cat} onChange={e => setNewProduct({...newProduct, cat: e.target.value})} placeholder="e.g. Photography" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">Price (e.g. ₹5,000/day)</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">Initial Stock</label>
                  <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <button className="btn-primary w-full mt-4 justify-center" onClick={handleAddProduct}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
