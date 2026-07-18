import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Receipt,
  Users
} from 'lucide-react';
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
        setSummary(summaryRes.data?.data);
        setActivities(activityRes.data?.data || []);
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

  const data = summary || { 
    activeRentals: 0, 
    revenueToday: 0, 
    dueToday: 0, 
    overdue: 0,
    upcomingPickups: 0,
    upcomingReturns: 0,
    rentalRevenue: 0,
    securityDepositsHeld: 0,
    lateFeeCollection: 0
  };

  return (
    <div className="admin-container animate-fade-in">
      <header className="admin-header">
        <h1 className="text-gradient">Operational Dashboard</h1>
        <p className="subtitle">Real-time overview of rental operations and financial status</p>
      </header>

      {/* Main Metric Cards Grid (3x3 or 4-columns) */}
      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Active Rentals */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-blue">
            <Package size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Active Rentals</p>
            <h3 className="metric-value">{data.activeRentals}</h3>
          </div>
        </div>

        {/* Due Today */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-orange">
            <Clock size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Returns Due Today</p>
            <h3 className="metric-value">{data.dueToday}</h3>
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-purple">
            <ArrowUpRight size={24} className="metric-icon" style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Upcoming Pickups</p>
            <h3 className="metric-value">{data.upcomingPickups}</h3>
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-cyan">
            <ArrowDownLeft size={24} className="metric-icon" style={{ color: '#06b6d4' }} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Upcoming Returns</p>
            <h3 className="metric-value">{data.upcomingReturns}</h3>
          </div>
        </div>

        {/* Overdue */}
        <div className="metric-card glass-panel border-danger">
          <div className="metric-icon-wrapper bg-red">
            <AlertTriangle size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Overdue Rentals</p>
            <h3 className="metric-value text-danger">{data.overdue}</h3>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-green">
            <IndianRupee size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Revenue Today</p>
            <h3 className="metric-value">₹{data.revenueToday}</h3>
          </div>
        </div>

        {/* Total Rental Revenue */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-green">
            <IndianRupee size={24} className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Rental Revenue</p>
            <h3 className="metric-value">₹{data.rentalRevenue}</h3>
          </div>
        </div>

        {/* Security Deposits Held */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-yellow" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}>
            <ShieldCheck size={24} className="metric-icon" style={{ color: '#eab308' }} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Security Deposits Held</p>
            <h3 className="metric-value">₹{data.securityDepositsHeld}</h3>
          </div>
        </div>

        {/* Late Fee Collection */}
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper bg-purple" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
            <Receipt size={24} className="metric-icon" style={{ color: '#a855f7' }} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Late Fee Collection</p>
            <h3 className="metric-value">₹{data.lateFeeCollection}</h3>
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
