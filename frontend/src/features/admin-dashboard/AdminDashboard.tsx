import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { Package, Clock, AlertTriangle, IndianRupee } from 'lucide-react';
import { adminApi } from '../../api/admin';

const AdminDashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, activityRes] = await Promise.all([
          adminApi.getDashboardSummary(),
          adminApi.getRentalActivity()
        ]);
        setSummary(summaryRes.data);
        setActivities(activityRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard metrics...</div>;
  }

  const data = summary || { activeRentals: 0, revenueToday: 0, dueToday: 0, overdue: 0 };

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
            <h3 className="metric-value">{data.activeRentals}</h3>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-green">
            <IndianRupee size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Revenue Today</p>
            <h3 className="metric-value">₹{data.revenueToday}</h3>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-orange">
            <Clock size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Returns Due Today</p>
            <h3 className="metric-value">{data.dueToday}</h3>
          </div>
        </div>

        <div className="metric-card glass-panel border-danger">
          <div className="metric-icon-wrapper bg-red">
            <AlertTriangle size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Overdue Rentals</p>
            <h3 className="metric-value text-danger">{data.overdue}</h3>
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
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? activities.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber || order.id}</td>
                  <td>{order.customerName || 'Customer'}</td>
                  <td>
                    <span className={`status-badge status-${(order.status || 'ACTIVE').toLowerCase()}`}>
                      {order.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td>₹{order.grandTotal || order.amount || 0}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center">No recent activity</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
