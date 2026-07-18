import { useState } from 'react';
import './AdminPricing.css';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';

const AdminPricing = () => {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ category: 'rental-period', label: '', details: '' });

  const [rentalPeriods, setRentalPeriods] = useState([
    { id: 1, label: 'Daily', details: '24 hours' },
    { id: 2, label: 'Weekly', details: '7 days (15% discount)' },
    { id: 3, label: 'Monthly', details: '30 days (30% discount)' },
  ]);

  const [depositRules, setDepositRules] = useState([
    { id: 1, label: 'Default', details: 'Fixed ₹2000 per order' },
    { id: 2, label: 'High-Value Item', details: '20% of product value' },
  ]);

  const handleSaveRule = () => {
    if (newRule.label && newRule.details) {
      if (newRule.category === 'rental-period') {
        setRentalPeriods([...rentalPeriods, { id: Date.now(), label: newRule.label, details: newRule.details }]);
      } else {
        setDepositRules([...depositRules, { id: Date.now(), label: newRule.label, details: newRule.details }]);
      }
      setShowRuleModal(false);
      setNewRule({ category: 'rental-period', label: '', details: '' });
    }
  };

  return (
    <div className="admin-pricing-container animate-fade-in relative">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Pricing & Rules</h1>
          <p className="subtitle">Manage price lists, rental periods, and penalty rules</p>
        </div>
        <button className="btn-primary" onClick={() => setShowRuleModal(true)}>
          <Plus size={18} /> New Rule
        </button>
      </div>

      <div className="pricing-grid mt-4">
        
        <div className="pricing-card glass-panel">
          <div className="pricing-header">
            <h3>Rental Periods</h3>
            <button className="icon-btn edit-btn"><Edit2 size={16} /></button>
          </div>
          <ul className="rule-list">
            {rentalPeriods.map(period => (
              <li key={period.id} className="flex justify-between items-center group">
                <div><strong>{period.label}:</strong> {period.details}</div>
                <button className="text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setRentalPeriods(rentalPeriods.filter(p => p.id !== period.id))}><Trash2 size={14}/></button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pricing-card glass-panel">
          <div className="pricing-header">
            <h3>Deposit Rules</h3>
            <button className="icon-btn edit-btn"><Edit2 size={16} /></button>
          </div>
          <ul className="rule-list">
            {depositRules.map(rule => (
              <li key={rule.id} className="flex justify-between items-center group">
                <div><strong>{rule.label}:</strong> {rule.details}</div>
                <button className="text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDepositRules(depositRules.filter(r => r.id !== rule.id))}><Trash2 size={14}/></button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pricing-card glass-panel">
          <div className="pricing-header">
            <h3>Late Fee Rules</h3>
            <button className="icon-btn edit-btn"><Edit2 size={16} /></button>
          </div>
          <ul className="rule-list">
            <li><strong>Grace Period:</strong> 2 hours</li>
            <li><strong>Penalty:</strong> ₹500 / day</li>
            <li><strong>Max Cap:</strong> 100% of product value</li>
          </ul>
        </div>

      </div>

      {showRuleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-6 w-full max-w-md animate-fade-in border border-indigo-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Rule</h2>
              <button onClick={() => setShowRuleModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Rule Category</label>
                <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newRule.category} onChange={e => setNewRule({...newRule, category: e.target.value})}>
                  <option value="rental-period">Rental Period</option>
                  <option value="deposit">Deposit Rule</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Rule Label (e.g. "Weekend")</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newRule.label} onChange={e => setNewRule({...newRule, label: e.target.value})} placeholder="Rule Name" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Details / Value</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newRule.details} onChange={e => setNewRule({...newRule, details: e.target.value})} placeholder="e.g. 48 hours (10% discount)" />
              </div>
              
              <button className="btn-primary w-full mt-4 justify-center" onClick={handleSaveRule}>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
