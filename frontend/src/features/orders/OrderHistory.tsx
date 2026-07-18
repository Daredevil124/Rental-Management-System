import { useState, useEffect } from 'react';
import './OrderHistory.css';
import { Download, Package } from 'lucide-react';
import { rentalsApi } from '../../api/rentals';

const OrderHistory = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await rentalsApi.getMyRentals();
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="orders-container animate-fade-in">
      <h1 className="text-gradient">My Rentals</h1>
      <p className="subtitle">View your past and active rentals</p>
      
      {loading ? (
        <p>Loading your rentals...</p>
      ) : (
        <div className="orders-list">
          {orders.length > 0 ? orders.map((order) => (
            <div key={order.id} className="order-card glass-panel">
              <div className="order-header">
                <div className="order-id-group">
                  <Package size={20} className="icon-accent" />
                  <h3>{order.orderNumber || order.id}</h3>
                </div>
                <span className={`status-badge status-${(order.status || 'ACTIVE').toLowerCase()}`}>
                  {order.status || 'ACTIVE'}
                </span>
              </div>
              
              <div className="order-body">
                <div className="order-details">
                  <p className="order-item">{order.item || 'Rental Equipment'}</p>
                  <p className="order-meta">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="order-meta">Return by: {order.endDate ? new Date(order.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="order-actions">
                  <span className="order-amount">₹{order.grandTotal || order.totalAmount || 0}</span>
                  <button className="btn-secondary">
                    <Download size={16} /> Invoice
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <p>You have no past rentals.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
