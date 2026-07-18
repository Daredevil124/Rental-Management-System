import { useState, useEffect } from 'react';
import './AdminProducts.css';
import { Plus, Edit2, Archive, X, Tag } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { productsApi } from '../../api/products';

const AdminProducts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res: any = await productsApi.getProducts();
      if (res.data && res.data.length > 0) {
        // Map the backend data to our table structure
        const mappedProducts = res.data.map((p: any) => ({
          sku: p.slug, // using slug as SKU for display if needed
          name: p.name,
          cat: p.category,
          price: '₹5,000/day', // mock base for now
          stock: p.variants?.reduce((acc: number, v: any) => acc + (v.inventoryUnits?.length || 0), 0) || 0,
          depositRule: p.depositRules?.[0]?.amount || 'Fixed',
          lateFeeRule: p.lateFeeRules?.[0]?.amount || '500',
          variants: p.variants?.length || 0
        }));
        setProducts(mappedProducts);
      } else {
        setProducts([
          { sku: 'CAM-PRO-01', name: 'Pro Camera Kit 1', cat: 'Photography', price: '₹4,500/day', stock: 5, depositRule: '20% of Value', lateFeeRule: '₹500/day', variants: 2 },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const [newProduct, setNewProduct] = useState({ 
    sku: '', name: '', cat: 'Photography', price: '', stock: 0, 
    depositRule: '', lateFeeRule: '', rentalPeriods: '',
    lateFeeUnit: 'Daily', lateFeeAmount: 500, gracePeriod: 120, maxFee: 5000,
    variants: [{ sku: '', brand: '', manufacturer: '', color: '', size: '' }]
  });

  const handleAddVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { sku: '', brand: '', manufacturer: '', color: '', size: '' }]
    });
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...newProduct.variants];
    updated[index] = { ...updated[index], [field]: value };
    setNewProduct({ ...newProduct, variants: updated });
  };

  const removeVariant = (index: number) => {
    const updated = [...newProduct.variants];
    updated.splice(index, 1);
    setNewProduct({ ...newProduct, variants: updated });
  };

  const handleAddProduct = async () => {
    if (newProduct.sku && newProduct.name) {
      try {
        // 1. Create Base Product
        const productRes: any = await adminApi.createProduct({
          name: newProduct.name,
          slug: newProduct.sku.toLowerCase(),
          category: newProduct.cat,
          description: newProduct.name
        });
        
        const productId = productRes.data.id;

        // 2. Create Variants
        for (const v of newProduct.variants) {
          if (v.sku) {
            await adminApi.createVariant(productId, {
              sku: v.sku,
              brand: v.brand,
              manufacturer: v.manufacturer,
              color: v.color,
              size: v.size
            });
          }
        }

        // 3. Create Late Fee Rules, Deposit Rules, etc... (skipped for brevity, but could be added here)
        
        await fetchProducts();
        setShowAddModal(false);
        setNewProduct({ 
          sku: '', name: '', cat: 'Photography', price: '', stock: 0,
          depositRule: '',
          lateFeeRule: '',
          rentalPeriods: 'Daily, Weekly',
          lateFeeUnit: 'Daily', lateFeeAmount: 500, gracePeriod: 120, maxFee: 5000,
          variants: [{ sku: '', brand: '', manufacturer: '', color: '', size: '' }]
        });
      } catch (err) {
        console.error('Failed to create product and variants', err);
        alert('Failed to save product completely');
      }
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
              <th>Variants</th>
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
                  <span className="text-xs bg-gray-800 text-indigo-300 px-2 py-1 rounded border border-gray-700 flex items-center gap-1 w-max">
                    <Tag size={12} /> {prod.variants} Variant(s)
                  </span>
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
          <div className="glass-panel p-6 w-full max-w-3xl animate-fade-in border border-indigo-500/30 my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-white">Add New Product & Variants</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              
              <div>
                <h3 className="text-lg font-medium text-indigo-400 mb-3 border-b border-gray-700 pb-2">Basic Info</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Base Product SKU</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. CAM-02" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Product Name</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Cinema Camera" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Category</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newProduct.cat} onChange={e => setNewProduct({...newProduct, cat: e.target.value})} placeholder="e.g. Photography" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Base Price</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="e.g. ₹5,000/day" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Initial Total Stock</label>
                    <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-medium text-indigo-400">Product Variants</h3>
                  <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors" onClick={handleAddVariant}>
                    <Plus size={12} /> Add Variant
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newProduct.variants.map((variant, index) => (
                    <div key={index} className="bg-gray-800/50 p-3 rounded border border-gray-700 relative group">
                      {newProduct.variants.length > 1 && (
                        <button className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeVariant(index)}>
                          <X size={12} />
                        </button>
                      )}
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Variant SKU</label>
                          <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-indigo-500" value={variant.sku} onChange={e => updateVariant(index, 'sku', e.target.value)} placeholder="e.g. CAM-02-BLK" />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Brand</label>
                          <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-indigo-500" value={variant.brand} onChange={e => updateVariant(index, 'brand', e.target.value)} placeholder="Sony, Canon" />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Manufacturer</label>
                          <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-indigo-500" value={variant.manufacturer} onChange={e => updateVariant(index, 'manufacturer', e.target.value)} placeholder="Manufacturer" />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Color</label>
                          <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-indigo-500" value={variant.color} onChange={e => updateVariant(index, 'color', e.target.value)} placeholder="Black, Silver" />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Size / Specs</label>
                          <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-sm focus:border-indigo-500" value={variant.size} onChange={e => updateVariant(index, 'size', e.target.value)} placeholder="35mm, Large" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-indigo-400 mb-3 border-b border-gray-700 pb-2">Pricing & Penalty Rules</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Security Deposit Rule</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newProduct.depositRule} onChange={e => setNewProduct({...newProduct, depositRule: e.target.value})} placeholder="e.g. 20% or ₹5000" />
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
                        <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500" value={newProduct.lateFeeAmount || 500} onChange={e => setNewProduct({...newProduct, lateFeeAmount: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Grace Period (Minutes)</label>
                        <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500" value={newProduct.gracePeriod || 120} onChange={e => setNewProduct({...newProduct, gracePeriod: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Maximum Cap (₹)</label>
                        <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500" value={newProduct.maxFee || 5000} onChange={e => setNewProduct({...newProduct, maxFee: Number(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="pt-4 border-t border-gray-700 mt-4">
              <button className="btn-primary w-full justify-center py-3" onClick={handleAddProduct}>Save Product & Variants</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
