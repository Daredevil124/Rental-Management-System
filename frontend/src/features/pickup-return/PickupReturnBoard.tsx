import './PickupReturnBoard.css';
import { Truck, MapPin, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const PickupReturnBoard = () => {
  const [activeTab, setActiveTab] = useState<'pickups' | 'returns'>('pickups');

  return (
    <div className="board-container animate-fade-in">
      <div className="board-header">
        <h1 className="text-gradient">Operations Board</h1>
        <div className="tabs glass-panel">
          <button 
            className={`tab-btn ${activeTab === 'pickups' ? 'active' : ''}`}
            onClick={() => setActiveTab('pickups')}
          >
            <Truck size={18} />
            Pickups Today
          </button>
          <button 
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            <MapPin size={18} />
            Returns Today
          </button>
        </div>
      </div>

      <div className="board-content">
        {activeTab === 'pickups' && (
          <div className="tasks-grid">
            <div className="task-card glass-panel">
              <div className="task-header">
                <div>
                  <h3 className="task-id">ORD-001</h3>
                  <p className="task-customer">Alice Smith</p>
                </div>
                <span className="status-badge status-active">Scheduled</span>
              </div>
              <div className="task-body">
                <p className="task-item">1x Pro Camera Kit 1</p>
                <div className="task-action-row">
                  <button className="btn-secondary">
                    <QrCode size={16} /> Scan QR
                  </button>
                  <button className="btn-primary">Confirm Pickup</button>
                </div>
              </div>
            </div>
            
            <div className="task-card glass-panel">
              <div className="task-header">
                <div>
                  <h3 className="task-id">ORD-004</h3>
                  <p className="task-customer">David Miller</p>
                </div>
                <span className="status-badge status-completed">Picked Up</span>
              </div>
              <div className="task-body">
                <p className="task-item">2x Lighting Stand Basic</p>
                <div className="task-action-row success-text">
                  <CheckCircle size={16} /> Handed over at 10:15 AM
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="tasks-grid">
            <div className="task-card glass-panel border-warning">
              <div className="task-header">
                <div>
                  <h3 className="task-id">ORD-002</h3>
                  <p className="task-customer">Bob Johnson</p>
                </div>
                <span className="status-badge status-overdue">Overdue</span>
              </div>
              <div className="task-body">
                <p className="task-item">1x Drone Pro Max</p>
                <div className="return-inspection">
                  <AlertCircle size={16} className="text-warning" />
                  <span className="text-warning text-sm">Late fee applies (₹500/day)</span>
                </div>
                <div className="task-action-row mt-4">
                  <button className="btn-secondary text-danger">Report Damage</button>
                  <button className="btn-primary">Process Return</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupReturnBoard;
