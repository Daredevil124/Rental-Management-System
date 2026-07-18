import './PickupReturnBoard.css';
import { Truck, MapPin, QrCode, AlertCircle, X, Receipt } from 'lucide-react';
import { useState } from 'react';

const PickupReturnBoard = () => {
  const [activeTab, setActiveTab] = useState<'pickups' | 'returns'>('pickups');
  const [processingReturn, setProcessingReturn] = useState<any>(null);
  const [returnedOrders, setReturnedOrders] = useState<string[]>([]);
  
  const handleProcessReturn = () => {
    setReturnedOrders([...returnedOrders, processingReturn.id]);
    setProcessingReturn(null);
    alert('Return processed! Late Fee rules calculated, security deposit adjusted, and invoice generated.');
  };

  return (
    <div className="board-container animate-fade-in relative">
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
                <div className="task-action-row mt-4">
                  <button className="btn-secondary">
                    <QrCode size={16} /> Scan QR
                  </button>
                  <button className="btn-primary" onClick={() => alert('Pickup confirmed')}>Confirm Pickup</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="tasks-grid">
            {!returnedOrders.includes('ORD-002') && (
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
                  <div className="return-inspection mt-2 bg-warning/10 p-3 rounded flex items-start gap-2">
                    <AlertCircle size={18} className="text-warning mt-0.5 shrink-0" />
                    <div>
                      <p className="text-warning text-sm font-semibold">Overdue by 3 hours</p>
                      <p className="text-gray-400 text-xs mt-1">Rule applied: Hourly | Grace Period: 120 mins | ₹200/hr</p>
                    </div>
                  </div>
                  <div className="task-action-row mt-4">
                    <button className="btn-secondary text-danger">Report Damage</button>
                    <button className="btn-primary" onClick={() => setProcessingReturn({ 
                      id: 'ORD-002', 
                      deposit: 5000, 
                      overdueText: '3 hours',
                      ruleConfig: 'Hourly (₹200/hr)',
                      gracePeriod: 'Exceeded (Allowed 120 mins)',
                      calculatedFee: 600,
                      maxFeeCap: 2000
                    })}>Process Return</button>
                  </div>
                </div>
              </div>
            )}
            {returnedOrders.includes('ORD-002') && (
              <div className="text-center p-8 text-gray-400 w-full col-span-2">
                All returns processed for today!
              </div>
            )}
          </div>
        )}
      </div>

      {processingReturn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-6 w-full max-w-md animate-fade-in border border-warning">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Process Late Return</h2>
              <button onClick={() => setProcessingReturn(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-4 text-warning">
                  <Receipt size={18} />
                  <span className="font-semibold text-sm">Automatic Invoice Generation</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-400">Security Deposit Held:</span>
                  <span className="text-white font-medium">₹{processingReturn.deposit}</span>
                </div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-400">Late Penalty Configuration:</span>
                  <span className="text-white text-right">{processingReturn.ruleConfig}<br/><span className="text-xs text-gray-500">Max Cap: ₹{processingReturn.maxFeeCap}</span></span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-400">Grace Period:</span>
                  <span className="text-danger text-xs">{processingReturn.gracePeriod}</span>
                </div>
                <div className="flex justify-between mb-2 text-warning font-medium">
                  <span>Penalty ({processingReturn.overdueText} late):</span>
                  <span>- ₹{processingReturn.calculatedFee}</span>
                </div>
                
                <div className="h-px bg-gray-700 my-3"></div>
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-300">Amount to Refund:</span>
                  <span className="text-success">₹{processingReturn.deposit - processingReturn.calculatedFee}</span>
                </div>
              </div>

              <button className="btn-primary w-full justify-center bg-success hover:bg-success/80 border-success py-3" onClick={handleProcessReturn}>
                Confirm Return & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupReturnBoard;
