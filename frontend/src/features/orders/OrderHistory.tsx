import './OrderHistory.css';
import { Download, Package } from 'lucide-react';

const OrderHistory = () => {
  return (
    <div className="orders-container animate-fade-in">
      <h1 className="text-gradient">My Rentals</h1>
      <p className="subtitle">View your past and active rentals</p>
      
      <div className="orders-list">
        {[
          { id: 'ORD-001', date: 'Oct 12, 2023', status: 'Active', item: 'Pro Camera Kit 1', amount: '₹4,500', returnDate: 'Oct 15, 2023' },
          { id: 'ORD-005', date: 'Sep 05, 2023', status: 'Completed', item: 'Lighting Stand Basic', amount: '₹1,200', returnDate: 'Sep 07, 2023' }
        ].map((order) => (
          <div key={order.id} className="order-card glass-panel">
            <div className="order-header">
              <div className="order-id-group">
                <Package size={20} className="icon-accent" />
                <h3>{order.id}</h3>
              </div>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            
            <div className="order-body">
              <div className="order-details">
                <p className="order-item">{order.item}</p>
                <p className="order-meta">Ordered on: {order.date}</p>
                <p className="order-meta">Return by: {order.returnDate}</p>
              </div>
              <div className="order-actions">
                <span className="order-amount">{order.amount}</span>
                <button className="btn-secondary">
                  <Download size={16} /> Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
