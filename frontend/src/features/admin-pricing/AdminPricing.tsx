import './AdminPricing.css';
import { Plus, Edit2 } from 'lucide-react';

const AdminPricing = () => {
  return (
    <div className="admin-pricing-container animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Pricing & Rules</h1>
          <p className="subtitle">Manage price lists, rental periods, and penalty rules</p>
        </div>
        <button className="btn-primary">
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
            <li><strong>Daily:</strong> 24 hours</li>
            <li><strong>Weekly:</strong> 7 days (15% discount)</li>
            <li><strong>Monthly:</strong> 30 days (30% discount)</li>
          </ul>
        </div>

        <div className="pricing-card glass-panel">
          <div className="pricing-header">
            <h3>Deposit Rules</h3>
            <button className="icon-btn edit-btn"><Edit2 size={16} /></button>
          </div>
          <ul className="rule-list">
            <li><strong>Default:</strong> Fixed ₹2000 per order</li>
            <li><strong>High-Value Item:</strong> 20% of product value</li>
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
    </div>
  );
};

export default AdminPricing;
