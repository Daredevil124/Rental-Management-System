import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Settings, Check, X, Tag, User as UserIcon, Calendar } from 'lucide-react';
import './AdminQuotations.css';
import { adminApi } from '../../api/admin';
import { productsApi } from '../../api/products';

const AdminQuotations = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'template' | 'create'>('list');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown lists
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [rentalPeriods, setRentalPeriods] = useState<any[]>([]);

  // New quotation form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quoteItems, setQuoteItems] = useState<any[]>([
    { productId: '', variantId: '', rentalPeriodId: '', quantity: 1, startsAt: '', endsAt: '' }
  ]);

  useEffect(() => {
    fetchQuotations();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [uRes, pRes, rpRes, tRes] = await Promise.all([
        adminApi.getUsers(),
        productsApi.getProducts(),
        adminApi.getRentalPeriods(),
        adminApi.getQuotationTemplates()
      ]);
      
      // Filter for CUSTOMER role
      setCustomers((uRes.data || []).filter((u: any) => u.role === 'CUSTOMER'));
      setProducts(pRes.data || []);
      setRentalPeriods(rpRes.data || []);
      
      if (tRes.data) {
        setHeaderText(tRes.data.header || '');
        setFooterText(tRes.data.footer || '');
      }
    } catch (err) {
      console.error('Failed to load quotation builder metadata:', err);
    }
  };

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.getQuotations();
      setQuotations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplates = async () => {
    try {
      await adminApi.createQuotationTemplate({ header: headerText, footer: footerText });
      alert('Quotation templates saved successfully!');
      setActiveTab('list');
    } catch (err) {
      console.error('Failed to save templates:', err);
      alert('Failed to save templates');
    }
  };

  const handleAddQuoteItem = () => {
    setQuoteItems([...quoteItems, { productId: '', variantId: '', rentalPeriodId: '', quantity: 1, startsAt: '', endsAt: '' }]);
  };

  const handleRemoveQuoteItem = (index: number) => {
    const updated = [...quoteItems];
    updated.splice(index, 1);
    setQuoteItems(updated);
  };

  const updateQuoteItem = (index: number, field: string, value: any) => {
    const updated = [...quoteItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Clear variant selection if product changes
    if (field === 'productId') {
      updated[index].variantId = '';
    }
    
    setQuoteItems(updated);
  };

  const handleCreateQuotation = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    
    const validItems = quoteItems.filter(item => item.productId && item.rentalPeriodId && item.startsAt && item.endsAt);
    if (validItems.length === 0) {
      alert('Please add at least one complete item with dates.');
      return;
    }

    try {
      await adminApi.createQuotation({
        customerId: selectedCustomerId,
        items: validItems
      });
      await fetchQuotations();
      setActiveTab('list');
      setSelectedCustomerId('');
      setQuoteItems([{ productId: '', variantId: '', rentalPeriodId: '', quantity: 1, startsAt: '', endsAt: '' }]);
    } catch (err) {
      console.error('Failed to save quotation:', err);
      alert('Failed to create quotation. Please check your inputs.');
    }
  };

  const handleConfirmQuotation = async (id: string) => {
    if (confirm('Are you sure you want to confirm this quote? This will convert it into an active Rental Order, create an Invoice, and lock inventory stock.')) {
      try {
        await adminApi.confirmQuotation(id);
        await fetchQuotations();
        alert('Quote confirmed successfully!');
      } catch (err) {
        console.error('Failed to confirm quote:', err);
        alert('Failed to confirm quotation. Ensure inventory units are available.');
      }
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(searchLower) ||
      q.customer?.fullName?.toLowerCase().includes(searchLower) ||
      q.customer?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gradient">Quotations</h1>
          <p className="subtitle">Manage customer quotes and templates</p>
        </div>
        <div className="flex gap-4">
          <button 
            className={`btn-secondary ${activeTab === 'template' ? 'border-indigo-500 text-indigo-400' : ''}`} 
            onClick={() => setActiveTab('template')}
          >
            <Settings size={18} /> Templates
          </button>
          {activeTab !== 'create' ? (
            <button className="btn-primary" onClick={() => setActiveTab('create')}>
              <Plus size={18} /> New Quote
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setActiveTab('list')}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {activeTab === 'template' && (
        <div className="glass-panel p-6 max-w-3xl mx-auto mt-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="text-indigo-400" /> Quotation Template Settings
          </h2>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Header Template</label>
            <textarea 
              rows={4} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Enter company name, address, logo URL etc."
            />
            <p className="text-xs text-gray-500 mt-1">This appears at the top of every generated quote/invoice.</p>
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Footer Template</label>
            <textarea 
              rows={3} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter terms, conditions, signatures etc."
            />
            <p className="text-xs text-gray-500 mt-1">This appears at the bottom of every generated quote/invoice.</p>
          </div>
          <div className="flex justify-end gap-4">
            <button className="btn-secondary" onClick={() => setActiveTab('list')}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveTemplates}>Save Templates</button>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="glass-panel p-6 max-w-4xl mx-auto mt-8 animate-fade-in space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-4 flex items-center gap-2">
            <Plus className="text-indigo-400" /> Build New Quotation
          </h2>

          <div className="form-group">
            <label className="block text-gray-300 mb-2 font-medium">1. Select Target Customer</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-gray-300 font-medium">2. Rental Line Items</label>
              <button className="btn-secondary text-xs py-1.5 px-3" onClick={handleAddQuoteItem}>
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            {quoteItems.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              const selectedProductVariants = selectedProduct?.variants || [];
              
              return (
                <div key={index} className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-4 relative">
                  {quoteItems.length > 1 && (
                    <button 
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                      onClick={() => handleRemoveQuoteItem(index)}
                    >
                      <X size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="text-xs text-gray-400">Product</label>
                      <select 
                        className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm"
                        value={item.productId}
                        onChange={e => updateQuoteItem(index, 'productId', e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="text-xs text-gray-400">Variant</label>
                      <select 
                        className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm"
                        value={item.variantId}
                        onChange={e => updateQuoteItem(index, 'variantId', e.target.value)}
                        disabled={!item.productId}
                      >
                        <option value="">Select Variant (Optional)</option>
                        {selectedProductVariants.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.brand} {v.color} ({v.sku})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="form-group col-span-2">
                      <label className="text-xs text-gray-400">Rental Period Tier</label>
                      <select 
                        className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm"
                        value={item.rentalPeriodId}
                        onChange={e => updateQuoteItem(index, 'rentalPeriodId', e.target.value)}
                      >
                        <option value="">Select Period</option>
                        {rentalPeriods.map(rp => (
                          <option key={rp.id} value={rp.id}>{rp.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="text-xs text-gray-400">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm"
                        value={item.quantity}
                        onChange={e => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="text-xs text-gray-400">Dates</label>
                      <div className="flex gap-2">
                        <input 
                          type="date" 
                          className="w-full bg-gray-950 border border-gray-700 rounded p-1 text-white text-xs"
                          value={item.startsAt}
                          onChange={e => updateQuoteItem(index, 'startsAt', e.target.value)}
                        />
                        <input 
                          type="date" 
                          className="w-full bg-gray-950 border border-gray-700 rounded p-1 text-white text-xs"
                          value={item.endsAt}
                          onChange={e => updateQuoteItem(index, 'endsAt', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-700 pt-6">
            <button className="btn-secondary" onClick={() => setActiveTab('list')}>Cancel</button>
            <button className="btn-primary" onClick={handleCreateQuotation}>Generate Quotation</button>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <>
          <div className="search-bar my-6">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search quotations by ID or customer..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="data-table-container glass-panel">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading quotations...</div>
            ) : (
              <table className="data-table w-full text-left">
                <thead>
                  <tr>
                    <th>Quote Number</th>
                    <th>Customer</th>
                    <th>Subtotal</th>
                    <th>Deposit</th>
                    <th>Grand Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.length > 0 ? (
                    filteredQuotations.map(quote => (
                      <tr key={quote.id}>
                        <td><strong>{quote.quotationNumber}</strong></td>
                        <td>
                          <div>
                            <div className="font-semibold text-white">{quote.customer?.fullName}</div>
                            <div className="text-xs text-gray-400">{quote.customer?.email}</div>
                          </div>
                        </td>
                        <td>₹{Number(quote.subtotal).toFixed(2)}</td>
                        <td>₹{Number(quote.depositTotal).toFixed(2)}</td>
                        <td className="text-indigo-300 font-semibold">₹{Number(quote.grandTotal).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${quote.status.toLowerCase()}`}>
                            {quote.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons flex items-center gap-2">
                            {quote.status === 'DRAFT' ? (
                              <button 
                                className="btn-success text-xs px-2.5 py-1.5 rounded flex items-center gap-1"
                                title="Confirm Quote"
                                onClick={() => handleConfirmQuotation(quote.id)}
                                style={{ border: 'none', cursor: 'pointer', backgroundColor: 'hsl(var(--success))', color: '#fff' }}
                              >
                                <Check size={14} /> Confirm Quote
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs flex items-center gap-1">
                                <Check size={14} className="text-green-500" /> Active Order
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No quotations found. Click "New Quote" to build one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminQuotations;
