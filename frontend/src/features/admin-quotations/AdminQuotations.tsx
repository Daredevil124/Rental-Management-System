import { useState } from 'react';
import { FileText, Plus, Search, Settings, Send } from 'lucide-react';
import './AdminQuotations.css';

const AdminQuotations = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'template'>('list');
  const [headerText, setHeaderText] = useState('RentOps Inc. Quotation\n123 Business Rd.\nContact: info@rentops.com');
  const [footerText, setFooterText] = useState('Thank you for your business. Valid for 30 days.');

  const quotations = [
    { id: 'QT-1001', customer: 'Alice Smith', total: 245.00, status: 'DRAFT', date: '2023-11-20' },
    { id: 'QT-1002', customer: 'Bob Jones', total: 890.00, status: 'CONFIRMED', date: '2023-11-19' },
  ];

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gradient">Quotations</h1>
          <p className="subtitle">Manage customer quotes and templates</p>
        </div>
        <div className="flex gap-4">
          <button className={`btn-secondary ${activeTab === 'template' ? 'border-indigo-500 text-indigo-400' : ''}`} onClick={() => setActiveTab('template')}>
            <Settings size={18} /> Templates
          </button>
          <button className="btn-primary" onClick={() => setActiveTab('list')}>
            <Plus size={18} /> New Quote
          </button>
        </div>
      </div>

      {activeTab === 'template' ? (
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
            <button className="btn-primary" onClick={() => { alert('Templates saved successfully!'); setActiveTab('list'); }}>Save Templates</button>
          </div>
        </div>
      ) : (
        <>
          <div className="search-bar my-6">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search quotations by ID or customer..." />
          </div>

          <div className="data-table-container glass-panel">
            <table className="data-table w-full text-left">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(quote => (
                  <tr key={quote.id}>
                    <td><strong>{quote.id}</strong></td>
                    <td>{quote.customer}</td>
                    <td>{quote.date}</td>
                    <td>₹{quote.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${quote.status.toLowerCase()}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons flex gap-2">
                        <button className="icon-btn" title="View PDF"><FileText size={16} /></button>
                        {quote.status === 'DRAFT' && (
                          <button className="icon-btn edit-btn" title="Send to Customer"><Send size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminQuotations;
