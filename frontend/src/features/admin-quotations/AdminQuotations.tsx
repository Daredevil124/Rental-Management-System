import './AdminQuotations.css';
import { FileText, Send, Plus } from 'lucide-react';

const AdminQuotations = () => {
  return (
    <div className="admin-quotations-container animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Quotations</h1>
          <p className="subtitle">Build and manage rental quotes</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} /> New Quote
        </button>
      </div>

      <div className="table-container glass-panel mt-4">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Customer</th>
              <th>Valid Until</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'QT-1021', name: 'Acme Corp', date: 'Oct 25, 2023', amount: '₹14,500', status: 'Pending' },
              { id: 'QT-1022', name: 'Studio XYZ', date: 'Oct 28, 2023', amount: '₹8,200', status: 'Accepted' },
            ].map((quote) => (
              <tr key={quote.id}>
                <td className="font-medium">{quote.id}</td>
                <td>{quote.name}</td>
                <td>{quote.date}</td>
                <td>{quote.amount}</td>
                <td>
                  <span className={`status-badge status-${quote.status.toLowerCase()}`}>
                    {quote.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn" title="View PDF"><FileText size={16} /></button>
                    {quote.status === 'Pending' && (
                      <button className="icon-btn edit-btn" title="Send to Customer"><Send size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminQuotations;
