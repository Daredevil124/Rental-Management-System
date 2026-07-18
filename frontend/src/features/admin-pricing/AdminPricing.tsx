import { useState, useEffect } from 'react';
import './AdminPricing.css';
import { Plus, Edit2, X, Trash2, Calendar, Star } from 'lucide-react';
import { adminApi } from '../../api/admin';

const AdminPricing = () => {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newPriceList, setNewPriceList] = useState({ 
    name: '', 
    description: '', 
    isDefault: false, 
    startsAt: '', 
    endsAt: '' 
  });

  const [priceLists, setPriceLists] = useState<any[]>([]);

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    try {
      const res: any = await adminApi.getPriceLists();
      if (res.data && res.data.length > 0) {
        setPriceLists(res.data);
      } else {
        // Fallback if empty to show UI
        setPriceLists([
          { id: '1', name: 'Standard Pricing', description: 'Base default rates for all products', isDefault: true, startsAt: null, endsAt: null, status: 'Active' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch price lists', err);
    }
  };

  const handleSavePriceList = async () => {
    if (!newPriceList.name.trim()) {
      alert('Price List Name is required.');
      return;
    }

    if (newPriceList.startsAt && newPriceList.endsAt) {
      if (new Date(newPriceList.endsAt) < new Date(newPriceList.startsAt)) {
        alert('Ends At date cannot be before Starts At date.');
        return;
      }
    }

    try {
        await adminApi.createPriceList({
          name: newPriceList.name,
          description: newPriceList.description,
          isDefault: newPriceList.isDefault,
          startsAt: newPriceList.startsAt ? new Date(newPriceList.startsAt).toISOString() : null,
          endsAt: newPriceList.endsAt ? new Date(newPriceList.endsAt).toISOString() : null,
          isActive: true
        });
        
        await fetchPriceLists();
        setShowRuleModal(false);
        setNewPriceList({ name: '', description: '', isDefault: false, startsAt: '', endsAt: '' });
      } catch (err) {
        console.error('Failed to create price list', err);
        alert('Failed to save price list');
      }
  };

  const deletePriceList = (id: number) => {
    setPriceLists(priceLists.filter(p => p.id !== id));
  };

  return (
    <div className="admin-page animate-fade-in relative">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Price Lists & Seasons</h1>
          <p className="subtitle">Manage default pricing, seasonal sales, and custom tiers</p>
        </div>
        <button className="btn-primary" onClick={() => setShowRuleModal(true)}>
          <Plus size={18} /> Create Price List
        </button>
      </div>

      <div className="mt-6">
        <div className="glass-panel overflow-hidden">
          <table className="admin-table w-full text-left">
            <thead>
              <tr>
                <th>Price List Name</th>
                <th>Description</th>
                <th>Time Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {priceLists.map((list) => (
                <tr key={list.id} className={list.isDefault ? 'bg-indigo-900/10' : ''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{list.name}</span>
                      {list.isDefault && <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-500/30"><Star size={12} fill="currentColor" /> Default</span>}
                    </div>
                  </td>
                  <td className="text-gray-400">{list.description}</td>
                  <td>
                    {list.startsAt || list.endsAt ? (
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Calendar size={14} className="text-indigo-400" />
                        {list.startsAt ? list.startsAt : 'Always'} - {list.endsAt ? list.endsAt : 'Forever'}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Permanent (No expiry)</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${list.status === 'Active' ? 'status-active' : 'status-warning'}`}>
                      {list.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn edit-btn" title="Edit"><Edit2 size={16} /></button>
                      {!list.isDefault && (
                        <button className="icon-btn archive-btn hover:text-danger" onClick={() => deletePriceList(list.id)} title="Delete"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRuleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-6 w-full max-w-lg animate-fade-in border border-indigo-500/30">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-white">Create Price List</h2>
              <button onClick={() => setShowRuleModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Price List Name</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 transition-colors" value={newPriceList.name} onChange={e => setNewPriceList({...newPriceList, name: e.target.value})} placeholder="e.g. Summer Sale 2026" />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 transition-colors" value={newPriceList.description} onChange={e => setNewPriceList({...newPriceList, description: e.target.value})} placeholder="Brief context about this pricing tier" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Starts At (Optional)</label>
                  <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newPriceList.startsAt} onChange={e => setNewPriceList({...newPriceList, startsAt: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Ends At (Optional)</label>
                  <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500" value={newPriceList.endsAt} onChange={e => setNewPriceList({...newPriceList, endsAt: e.target.value})} />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500" checked={newPriceList.isDefault} onChange={e => setNewPriceList({...newPriceList, isDefault: e.target.checked})} />
                  <span className="text-gray-300 text-sm group-hover:text-white transition-colors">Set as Default Price List (Applicable to all products by default)</span>
                </label>
              </div>
              
              <button className="btn-primary w-full mt-6 justify-center py-3" onClick={handleSavePriceList}>Save Price List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
