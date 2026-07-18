import './AdminDashboard.css';
import { Package, Clock, AlertTriangle, IndianRupee } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="admin-container animate-fade-in">
      <header className="admin-header">
        <h1 className="text-gradient">Operational Dashboard</h1>
        <p className="subtitle">Real-time overview of rental operations</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-blue">
            <Package size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Active Rentals</p>
            <h3 className="metric-value">42</h3>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-green">
            <IndianRupee size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Revenue Today</p>
            <h3 className="metric-value">₹12,450</h3>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-orange">
            <Clock size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Returns Due Today</p>
            <h3 className="metric-value">8</h3>
          </div>
        </div>

        <div className="metric-card glass-panel border-danger">
          <div className="metric-icon-wrapper bg-red">
            <AlertTriangle size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Overdue Rentals</p>
            <h3 className="metric-value text-danger">3</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="table-container glass-panel">
          <div className="table-header">
            <h2>Recent Orders</h2>
            <button className="btn-secondary">View All</button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'ORD-001', name: 'Alice Smith', items: 2, status: 'Active', amount: '₹4,200' },
                { id: 'ORD-002', name: 'Bob Johnson', items: 1, status: 'Overdue', amount: '₹1,500' },
                { id: 'ORD-003', name: 'Charlie Brown', items: 4, status: 'Completed', amount: '₹8,900' },
              ].map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.name}</td>
                  <td>{order.items}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
