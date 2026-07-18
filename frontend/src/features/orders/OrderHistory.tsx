import { useState, useEffect } from 'react';
import './OrderHistory.css';
import { Download, Package } from 'lucide-react';
import { rentalsApi } from '../../api/rentals';

import { API_BASE_URL } from '../../api/client';

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
                  <p className="order-meta">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                  {order.returnedAt && (
                    <p className="order-meta text-success font-medium">Returned on: {new Date(order.returnedAt).toLocaleDateString()}</p>
                  )}
                  <div className="deposit-breakdown mt-2 text-xs text-gray-400 space-y-1">
                    <div>Base Rent: ₹{Number(order.subtotal || 0).toFixed(2)}</div>
                    <div>Security Deposit: ₹{Number(order.depositTotal || 0).toFixed(2)} (Refundable)</div>
                    {Number(order.lateFeeTotal) > 0 && (
                      <div className="text-warning font-semibold">Late Fee Deduction: ₹{Number(order.lateFeeTotal).toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <div className="order-actions">
                  <span className="order-amount">Total: ₹{Number(order.grandTotal || 0).toFixed(2)}</span>
                  <button 
                    className="btn-secondary"
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/rentals/${order.id}/invoice`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (!response.ok) throw new Error('Failed to download');
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Invoice-${order.orderNumber || order.id}.html`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Invoice download failed:', error);
                        alert('Invoice is not available for this order yet.');
                      }
                    }}
                  >
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
