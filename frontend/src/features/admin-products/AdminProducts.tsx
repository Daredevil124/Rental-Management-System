import { useState, useEffect } from 'react';
import './AdminProducts.css';
import { Plus, Edit2, Archive, X, Tag } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { productsApi } from '../../api/products';

const AdminProducts = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [rentalPeriods, setRentalPeriods] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [plRes, rpRes] = await Promise.all([
        adminApi.getPriceLists(),
        adminApi.getRentalPeriods()
      ]);
      setPriceLists(plRes.data || []);
      setRentalPeriods(rpRes.data || []);
    } catch (err) {
      console.error('Failed to fetch pricing metadata', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res: any = await productsApi.getProducts();
      if (res.data && res.data.length > 0) {
        // Map the backend data to our table structure
        const mappedProducts = res.data.map((p: any) => ({
          id: p.id,
          sku: p.slug, // using slug as SKU for display
          name: p.name,
          cat: p.category,
          price: p.pricingRules?.[0]?.price ? `₹${p.pricingRules[0].price}/day` : '₹100/day',
          stock: p.variants?.reduce((acc: number, v: any) => acc + (v.inventoryUnits?.length || 0), 0) || 0,
          depositRule: p.depositRules?.[0]?.amount ? `Fixed (₹${p.depositRules[0].amount})` : 'Fixed (₹0)',
          lateFeeRule: p.lateFeeRules?.[0]?.amount ? `₹${p.lateFeeRules[0].amount}/${p.lateFeeRules[0].unit.toLowerCase()}` : '₹500/day',
          variants: p.variants?.length || 0,
          rawProduct: p
        }));
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const [newProduct, setNewProduct] = useState({ 
    sku: '', name: '', cat: 'Photography', price: '', stock: 0, 
    depositAmount: 0, lateFeeRule: '', rentalPeriods: '',
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

        // 2. Create Variants & Inventory Units
        const createdVariants = [];
        for (const v of newProduct.variants) {
          if (v.sku) {
            const variantRes: any = await adminApi.createVariant(productId, {
              sku: v.sku,
              brand: v.brand || 'Generic',
              manufacturer: v.manufacturer || 'Generic',
              color: v.color || 'Default',
              size: v.size || 'Standard'
            });
            createdVariants.push(variantRes.data);
          }
        }

        // Create Inventory Units
        if (createdVariants.length > 0 && newProduct.stock > 0) {
          const unitsPerVariant = Math.ceil(newProduct.stock / createdVariants.length);
          let createdCount = 0;
          for (const variant of createdVariants) {
            for (let i = 0; i < unitsPerVariant && createdCount < newProduct.stock; i++) {
              await adminApi.createInventoryUnit({
                variantId: variant.id,
                assetTag: `AST-${variant.sku}-${String(i + 1).padStart(3, '0')}`,
                qrCode: `QR-${variant.sku}-${String(i + 1).padStart(3, '0')}`,
                status: 'AVAILABLE',
                condition: 'GOOD',
                location: 'Warehouse A'
              });
              createdCount++;
            }
          }
        }

        // 3. Create Pricing Rules (Daily & Weekly)
        const defaultPl = priceLists.find(pl => pl.isDefault) || priceLists[0];
        const dailyPeriod = rentalPeriods.find(p => p.name === 'Daily');
        const weeklyPeriod = rentalPeriods.find(p => p.name === 'Weekly');
        
        const parsedPrice = Number(newProduct.price.replace(/[^0-9.]/g, '')) || 500;

        if (defaultPl?.id) {
          if (dailyPeriod?.id) {
            await adminApi.createPricingRule({
              priceListId: defaultPl.id,
              rentalPeriodId: dailyPeriod.id,
              productId: productId,
              price: parsedPrice
            });
          }
          if (weeklyPeriod?.id) {
            await adminApi.createPricingRule({
              priceListId: defaultPl.id,
              rentalPeriodId: weeklyPeriod.id,
              productId: productId,
              price: parsedPrice * 5 // default weekly multiplier
            });
          }
        }

        // 4. Create Deposit Rule
        if (newProduct.depositAmount > 0) {
          await adminApi.createDepositRule({
            productId: productId,
            type: 'FIXED',
            amount: newProduct.depositAmount,
            priceListId: defaultPl?.id || null
          });
        }

        // 5. Create Late Fee Rule
        if (newProduct.lateFeeAmount > 0) {
          await adminApi.createLateFeeRule({
            productId: productId,
            unit: newProduct.lateFeeUnit.toUpperCase() === 'HOURLY' ? 'HOURLY' : 'DAILY',
            amount: newProduct.lateFeeAmount,
            gracePeriodMinutes: newProduct.gracePeriod,
            maxFee: newProduct.maxFee,
            priceListId: defaultPl?.id || null
          });
        }
        
        await fetchProducts();
        setShowAddModal(false);
        setNewProduct({ 
          sku: '', name: '', cat: 'Photography', price: '', stock: 0,
          depositAmount: 0,
          lateFeeRule: '',
          rentalPeriods: 'Daily, Weekly',
          lateFeeUnit: 'Daily', lateFeeAmount: 500, gracePeriod: 120, maxFee: 5000,
          variants: [{ sku: '', brand: '', manufacturer: '', color: '', size: '' }]
        });
      } catch (err) {
        console.error('Failed to create product completely', err);
        alert('Failed to save product completely. Check that SKU is unique.');
      }
    }
  };

  const handleOpenEditModal = (prod: any) => {
    setEditingProduct({
      id: prod.id,
      name: prod.name,
      category: prod.cat,
      description: prod.rawProduct?.description || '',
      price: prod.rawProduct?.pricingRules?.[0]?.price ? Number(prod.rawProduct.pricingRules[0].price) : 500,
      depositAmount: prod.rawProduct?.depositRules?.[0]?.amount ? Number(prod.rawProduct.depositRules[0].amount) : 0,
      lateFeeAmount: prod.rawProduct?.lateFeeRules?.[0]?.amount ? Number(prod.rawProduct.lateFeeRules[0].amount) : 500,
      lateFeeUnit: prod.rawProduct?.lateFeeRules?.[0]?.unit === 'HOURLY' ? 'Hourly' : 'Daily',
      gracePeriod: prod.rawProduct?.lateFeeRules?.[0]?.gracePeriodMinutes || 120,
      maxFee: prod.rawProduct?.lateFeeRules?.[0]?.maxFee || 5000
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct && editingProduct.name) {
      try {
        await adminApi.updateProduct(editingProduct.id, {
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description,
          price: Number(editingProduct.price) || 0,
          depositAmount: Number(editingProduct.depositAmount) || 0,
          lateFeeAmount: Number(editingProduct.lateFeeAmount) || 0,
          lateFeeUnit: editingProduct.lateFeeUnit.toUpperCase() === 'HOURLY' ? 'HOURLY' : 'DAILY',
          gracePeriod: Number(editingProduct.gracePeriod) || 0,
          maxFee: Number(editingProduct.maxFee) || null
        });
        await fetchProducts();
        setShowEditModal(false);
        setEditingProduct(null);
      } catch (err) {
        console.error('Failed to update product', err);
        alert('Failed to update product details');
      }
    }
  };

  const handleArchiveProduct = async (productId: string) => {
    if (confirm('Are you sure you want to archive this product? This will remove it from the customer storefront.')) {
      try {
        await adminApi.updateProduct(productId, { isActive: false });
        await fetchProducts();
      } catch (err) {
        console.error('Failed to archive product', err);
        alert('Failed to archive product');
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
            {products.length > 0 ? (
              products.map((prod) => (
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
                    <span className={`status-badge ${prod.stock < 2 ? 'status-warning' : 'status-active'}`}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons flex gap-2">
                      <button 
                        className="icon-btn edit-btn" 
                        title="Edit Product"
                        onClick={() => handleOpenEditModal(prod)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="icon-btn archive-btn" 
                        title="Archive"
                        onClick={() => handleArchiveProduct(prod.id)}
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No active products found. Click "Add Product" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel max-w-3xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-white">Add New Product & Variants</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <div className="form-group-title">Basic Info</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Base Product SKU</label>
                    <input type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. CAM-02" />
                  </div>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Cinema Camera" />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" value={newProduct.cat} onChange={e => setNewProduct({...newProduct, cat: e.target.value})} placeholder="e.g. Photography" />
                  </div>
                  <div className="form-group">
                    <label>Base Daily Price (₹)</label>
                    <input type="text" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="e.g. 1500" />
                  </div>
                  <div className="form-group">
                    <label>Initial Total Stock</label>
                    <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              </div>

              <div>
                <div className="variants-header">
                  <h3>Product Variants</h3>
                  <button className="add-variant-btn" type="button" onClick={handleAddVariant}>
                    <Plus size={12} /> Add Variant
                  </button>
                </div>
                
                <div className="variants-list">
                  {newProduct.variants.map((variant, index) => (
                    <div key={index} className="variant-card">
                      {newProduct.variants.length > 1 && (
                        <button className="remove-variant-btn" type="button" onClick={() => removeVariant(index)}>
                          <X size={12} />
                        </button>
                      )}
                      <div className="form-grid-5">
                        <div className="form-group">
                          <label>Variant SKU</label>
                          <input type="text" value={variant.sku} onChange={e => updateVariant(index, 'sku', e.target.value)} placeholder="e.g. CAM-02-BLK" />
                        </div>
                        <div className="form-group">
                          <label>Brand</label>
                          <input type="text" value={variant.brand} onChange={e => updateVariant(index, 'brand', e.target.value)} placeholder="Sony, Canon" />
                        </div>
                        <div className="form-group">
                          <label>Manufacturer</label>
                          <input type="text" value={variant.manufacturer} onChange={e => updateVariant(index, 'manufacturer', e.target.value)} placeholder="Manufacturer" />
                        </div>
                        <div className="form-group">
                          <label>Color</label>
                          <input type="text" value={variant.color} onChange={e => updateVariant(index, 'color', e.target.value)} placeholder="Black, Silver" />
                        </div>
                        <div className="form-group">
                          <label>Size / Specs</label>
                          <input type="text" value={variant.size} onChange={e => updateVariant(index, 'size', e.target.value)} placeholder="35mm, Large" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="form-group-title">Pricing & Penalty Rules</div>
                <div className="space-y-4">
                  <div className="form-group">
                    <label>Security Deposit Amount (₹)</label>
                    <input type="number" value={newProduct.depositAmount || ''} onChange={e => setNewProduct({...newProduct, depositAmount: Number(e.target.value)})} placeholder="e.g. 5000" />
                  </div>
                  
                  <div className="late-fee-config">
                    <div className="late-fee-config-title">Late Return Configuration</div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Fee Type</label>
                        <select value={newProduct.lateFeeUnit || 'Daily'} onChange={e => setNewProduct({...newProduct, lateFeeUnit: e.target.value})}>
                          <option>Hourly</option>
                          <option>Daily</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" value={newProduct.lateFeeAmount || 500} onChange={e => setNewProduct({...newProduct, lateFeeAmount: Number(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Grace Period (Minutes)</label>
                        <input type="number" value={newProduct.gracePeriod || 120} onChange={e => setNewProduct({...newProduct, gracePeriod: Number(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Maximum Cap (₹)</label>
                        <input type="number" value={newProduct.maxFee || 5000} onChange={e => setNewProduct({...newProduct, maxFee: Number(e.target.value)})} />
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

      {/* EDIT PRODUCT DETAILS MODAL */}
      {showEditModal && editingProduct && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel max-w-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-white">Edit Product Details</h2>
              <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <div className="form-group-title">Basic Info</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input 
                      type="text" 
                      value={editingProduct.name} 
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input 
                      type="text" 
                      value={editingProduct.category} 
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Base Daily Price (₹)</label>
                    <input 
                      type="number" 
                      value={editingProduct.price} 
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input 
                      type="text" 
                      value={editingProduct.description} 
                      onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="form-group-title">Pricing & Penalty Rules</div>
                <div className="space-y-4">
                  <div className="form-group">
                    <label>Security Deposit Amount (₹)</label>
                    <input 
                      type="number" 
                      value={editingProduct.depositAmount} 
                      onChange={e => setEditingProduct({...editingProduct, depositAmount: Number(e.target.value)})} 
                    />
                  </div>
                  
                  <div className="late-fee-config">
                    <div className="late-fee-config-title">Late Return Configuration</div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Fee Type</label>
                        <select 
                          value={editingProduct.lateFeeUnit} 
                          onChange={e => setEditingProduct({...editingProduct, lateFeeUnit: e.target.value})}
                        >
                          <option>Hourly</option>
                          <option>Daily</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Amount (₹)</label>
                        <input 
                          type="number" 
                          value={editingProduct.lateFeeAmount} 
                          onChange={e => setEditingProduct({...editingProduct, lateFeeAmount: Number(e.target.value)})} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Grace Period (Minutes)</label>
                        <input 
                          type="number" 
                          value={editingProduct.gracePeriod} 
                          onChange={e => setEditingProduct({...editingProduct, gracePeriod: Number(e.target.value)})} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Maximum Cap (₹)</label>
                        <input 
                          type="number" 
                          value={editingProduct.maxFee} 
                          onChange={e => setEditingProduct({...editingProduct, maxFee: Number(e.target.value)})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700 mt-6 flex gap-3">
              <button 
                className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white rounded py-2 transition-colors"
                onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="w-1/2 btn-primary justify-center py-2"
                onClick={handleUpdateProduct}
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
