import './PickupReturnBoard.css';
import { Truck, MapPin, QrCode, CheckCircle, AlertCircle, X, ShieldAlert, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';

const PickupReturnBoard = () => {
  const [pickups, setPickups] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pickups' | 'returns'>('pickups');

  // Return processing modal form states
  const [processingReturn, setProcessingReturn] = useState<any>(null); 
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnDamageNotes, setReturnDamageNotes] = useState('');
  const [returnDamageFee, setReturnDamageFee] = useState<number>(0);
  const [selectedMissingAccessories, setSelectedMissingAccessories] = useState<string[]>([]);

  // Checklist verification states (keyed by taskId)
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});
  const [qrCodeVerified, setQrCodeVerified] = useState<Record<string, boolean>>({});
  const [qrInputText, setQrInputText] = useState<Record<string, string>>({});
  const [qrError, setQrError] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pickupRes, returnRes] = await Promise.all([
        adminApi.getPickups(),
        adminApi.getReturns()
      ]);
      setPickups(pickupRes.data?.data || []);
      setReturns(returnRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch operations board tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmPickup = async (rentalOrderId: string) => {
    try {
      await adminApi.confirmPickup(rentalOrderId);
      alert('Pickup confirmed successfully! Inventory unit status updated to RENTED.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm pickup');
    }
  };

  const handleProcessReturn = (task: any) => {
    setProcessingReturn(task);
    setReturnCondition('GOOD');
    setReturnDamageNotes('');
    setReturnDamageFee(0);
    setSelectedMissingAccessories([]);
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.confirmReturn(processingReturn.rentalOrderId, {
        condition: returnCondition,
        damageNotes: returnDamageNotes,
        damageFeeAmount: Number(returnDamageFee),
        missingAccessories: selectedMissingAccessories
      });
      alert('Return processed! Late fees calculated, repair tasks dispatched (if damaged), and deposit settled.');
      setProcessingReturn(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to process return');
    }
  };

  const toggleChecklist = (taskId: string, item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [item]: !prev[taskId]?.[item]
      }
    }));
  };

  const handleVerifyQR = (taskId: string, expectedQr: string) => {
    const input = (qrInputText[taskId] || '').trim();
    if (input.toLowerCase() === expectedQr.toLowerCase()) {
      setQrCodeVerified(prev => ({ ...prev, [taskId]: true }));
      setQrError(prev => ({ ...prev, [taskId]: '' }));
    } else {
      setQrError(prev => ({ ...prev, [taskId]: 'Invalid QR code asset tag!' }));
    }
  };

  const isPickupReady = (task: any) => {
    const checklist = task.checklist || [];
    const taskChecked = checkedItems[task.id] || {};
    const allChecked = checklist.every((item: string) => taskChecked[item]);
    
    // Check if QR code is verified
    const expectedQr = task.rentalOrder?.items?.[0]?.inventoryUnit?.qrCode || 'QR-HAMMER-001';
    const qrVerified = qrCodeVerified[task.id] || false;
    
    return allChecked && qrVerified;
  };

  const toggleMissingAccessory = (accId: string) => {
    setSelectedMissingAccessories(prev => 
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  };

  const calculateRefundAmount = () => {
    if (!processingReturn) return 0;
    const deposit = Number(processingReturn.rentalOrder?.depositTotal || 0);
    
    // Calculate late fee
    let lateDays = 0;
    let lateFee = 0;
    const item = processingReturn.rentalOrder?.items?.[0];
    if (item && new Date(item.endsAt) < new Date()) {
      lateDays = Math.ceil((Date.now() - new Date(item.endsAt).getTime()) / 86400000);
      if (lateDays > 0) {
        lateFee = lateDays * 500; // Default ₹500/day
      }
    }

    const missingAccessoriesPenalty = selectedMissingAccessories.length * 200; // ₹200 fee per missing accessory
    const totalDeductions = lateFee + Number(returnDamageFee) + missingAccessoriesPenalty;
    return Math.max(0, deposit - totalDeductions);
  };

  const getLateDays = (endsAt: string) => {
    if (new Date(endsAt) >= new Date()) return 0;
    return Math.ceil((Date.now() - new Date(endsAt).getTime()) / 86400000);
  };

  if (loading) {
    return (
      <div className="board-container animate-fade-in">
        <h1 className="text-gradient">Operations Board</h1>
        <p className="p-8 text-center text-gray-400">Loading daily tasks...</p>
      </div>
    );
  }

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
            Pickups Today ({pickups.filter(p => p.status === 'SCHEDULED').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            <MapPin size={18} />
            Returns Today ({returns.filter(r => r.status === 'SCHEDULED').length})
          </button>
        </div>
      </div>

      <div className="board-content">
        {/* PICKUPS LIST */}
        {activeTab === 'pickups' && (
          <div className="tasks-grid">
            {pickups.length > 0 ? (
              pickups.map(task => {
                const item = task.rentalOrder?.items?.[0];
                const expectedQr = item?.inventoryUnit?.qrCode || 'QR-HAMMER-001';
                const isCompleted = task.status === 'COMPLETED';

                return (
                  <div key={task.id} className={`task-card glass-panel ${isCompleted ? 'border-success' : ''}`}>
                    <div className="task-header">
                      <div>
                        <h3 className="task-id">{task.rentalOrder?.orderNumber}</h3>
                        <p className="task-customer">{task.rentalOrder?.customer?.fullName || 'Customer'}</p>
                      </div>
                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="task-body mt-4">
                      <div className="task-item-detail p-3 rounded bg-white/5 border border-white/10 mb-4">
                        <p className="font-semibold text-white">{item?.product?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Asset Tag: {item?.inventoryUnit?.assetTag || 'N/A'}</p>
                        <p className="text-xs text-gray-400">Location Shelf: A12</p>
                      </div>

                      {/* Route & Sequence Notes */}
                      {task.routeNotes && (
                        <div className="mb-4 text-xs text-gray-400 bg-blue-500/5 p-2 border border-blue-500/20 rounded">
                          <strong>Route Notes:</strong> {task.routeNotes}
                        </div>
                      )}

                      {!isCompleted && (
                        <>
                          {/* Barcode/QR Check */}
                          <div className="qr-scanner-section mb-4 p-3 rounded bg-white/5 border border-white/10">
                            <label className="text-xs font-semibold text-gray-300 block mb-1">
                              Scan QR Code or Enter Asset Tag
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder={`Enter ${expectedQr}`}
                                value={qrInputText[task.id] || ''}
                                onChange={(e) => setQrInputText(prev => ({ ...prev, [task.id]: e.target.value }))}
                                className="input-custom py-1 px-2 text-xs"
                                disabled={qrCodeVerified[task.id]}
                              />
                              <button 
                                onClick={() => handleVerifyQR(task.id, expectedQr)}
                                className="btn-secondary py-1 px-3 text-xs"
                                disabled={qrCodeVerified[task.id]}
                              >
                                {qrCodeVerified[task.id] ? <Check size={14} className="text-success" /> : 'Verify'}
                              </button>
                            </div>
                            {qrError[task.id] && <p className="text-red-500 text-xs mt-1">{qrError[task.id]}</p>}
                            {qrCodeVerified[task.id] && <p className="text-success text-xs mt-1">✓ QR Code Verified Successfully!</p>}
                          </div>

                          {/* Pickup Checklist */}
                          {task.checklist && Array.isArray(task.checklist) && (
                            <div className="checklist-section mb-4">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Pickup Checklist
                              </h4>
                              <div className="space-y-2">
                                {task.checklist.map((check: string) => (
                                  <label key={check} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={checkedItems[task.id]?.[check] || false}
                                      onChange={() => toggleChecklist(task.id, check)}
                                    />
                                    {check}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          <button 
                            className="btn-primary w-full justify-center mt-2"
                            onClick={() => handleConfirmPickup(task.rentalOrderId)}
                            disabled={!isPickupReady(task)}
                          >
                            <CheckCircle size={16} /> Confirm Pickup
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-gray-400 w-full col-span-2">No pickups scheduled for today.</div>
            )}
          </div>
        )}

        {/* RETURNS LIST */}
        {activeTab === 'returns' && (
          <div className="tasks-grid">
            {returns.length > 0 ? (
              returns.map(task => {
                const item = task.rentalOrder?.items?.[0];
                const isCompleted = task.status === 'COMPLETED';
                const lateDays = getLateDays(item?.endsAt);

                return (
                  <div key={task.id} className={`task-card glass-panel ${isCompleted ? 'border-success' : ''} ${lateDays > 0 && !isCompleted ? 'border-warning' : ''}`}>
                    <div className="task-header">
                      <div>
                        <h3 className="task-id">{task.rentalOrder?.orderNumber}</h3>
                        <p className="task-customer">{task.rentalOrder?.customer?.fullName || 'Customer'}</p>
                      </div>
                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="task-body mt-4">
                      <div className="task-item-detail p-3 rounded bg-white/5 border border-white/10 mb-3">
                        <p className="font-semibold text-white">{item?.product?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Serial Code: {item?.inventoryUnit?.assetTag || 'N/A'}</p>
                      </div>

                      {lateDays > 0 && !isCompleted && (
                        <div className="return-inspection mb-4 bg-warning/10 p-3 rounded flex items-start gap-2 border border-warning/20">
                          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                          <div>
                            <p className="text-warning text-sm font-semibold">{lateDays} Days Overdue</p>
                            <p className="text-gray-400 text-xs">Late fee applies (₹500/day). Cumulative fee: ₹{lateDays * 500}</p>
                          </div>
                        </div>
                      )}

                      {!isCompleted && (
                        <div className="task-action-row mt-4">
                          <button 
                            className="btn-primary w-full justify-center"
                            onClick={() => handleProcessReturn(task)}
                          >
                            Process Return & Check
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-gray-400 w-full col-span-2">No returns scheduled for today.</div>
            )}
          </div>
        )}
      </div>

      {/* RETURN INSPECTION MODAL */}
      {processingReturn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleConfirmReturn} className="glass-panel p-6 w-full max-w-lg animate-fade-in border border-warning max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert size={22} className="text-warning" />
                Return Inspection & Settle
              </h2>
              <button 
                type="button" 
                onClick={() => setProcessingReturn(null)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Product Condition */}
              <div className="form-group-custom">
                <label className="label-custom">Product Condition</label>
                <select 
                  value={returnCondition} 
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="input-custom w-full"
                >
                  <option value="GOOD">Good / Ready to Rent</option>
                  <option value="FAIR">Fair (Needs clean)</option>
                  <option value="DAMAGED">Damaged (Requires Repair)</option>
                </select>
              </div>

              {/* Damage Fee & Notes */}
              {returnCondition === 'DAMAGED' && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded space-y-3">
                  <div className="form-group-custom">
                    <label className="label-custom text-red-400">Damage Fee Amount (₹)</label>
                    <input 
                      type="number"
                      value={returnDamageFee}
                      onChange={(e) => setReturnDamageFee(Number(e.target.value))}
                      className="input-custom"
                      min={0}
                      required
                    />
                  </div>
                  <div className="form-group-custom">
                    <label className="label-custom text-red-400">Describe Damage (Repair workflow will initiate)</label>
                    <textarea 
                      value={returnDamageNotes}
                      onChange={(e) => setReturnDamageNotes(e.target.value)}
                      className="input-custom"
                      rows={2}
                      required
                      placeholder="Specify broken parts or malfunctioning components..."
                    />
                  </div>
                </div>
              )}

              {/* Accessory Verification */}
              {processingReturn.rentalOrder?.items?.[0]?.product?.accessories?.length > 0 && (
                <div className="form-group-custom">
                  <label className="label-custom">Verify Accessories</label>
                  <div className="space-y-2 mt-1">
                    {processingReturn.rentalOrder.items[0].product.accessories.map((acc: any) => (
                      <label key={acc.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={!selectedMissingAccessories.includes(acc.id)}
                          onChange={() => toggleMissingAccessory(acc.id)}
                        />
                        {acc.name} (Qty: {acc.quantity})
                        {selectedMissingAccessories.includes(acc.id) && (
                          <span className="text-xs text-red-400 font-bold ml-auto">Missing (₹200 Fee)</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Settlement Summary */}
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Deposit Settlement
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Security Deposit Held:</span>
                    <span className="text-white">₹{processingReturn.rentalOrder?.depositTotal}</span>
                  </div>

                  {/* Late Fee calculations */}
                  {getLateDays(processingReturn.rentalOrder?.items?.[0]?.endsAt) > 0 && (
                    <div className="flex justify-between text-warning">
                      <span>Late Penalty ({getLateDays(processingReturn.rentalOrder.items[0].endsAt)} days):</span>
                      <span>- ₹{getLateDays(processingReturn.rentalOrder.items[0].endsAt) * 500}</span>
                    </div>
                  )}

                  {/* Damage Fee */}
                  {returnCondition === 'DAMAGED' && (
                    <div className="flex justify-between text-red-400">
                      <span>Damage Penalty:</span>
                      <span>- ₹{returnDamageFee}</span>
                    </div>
                  )}

                  {/* Missing Accessories Fee */}
                  {selectedMissingAccessories.length > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Missing Accessories ({selectedMissingAccessories.length}):</span>
                      <span>- ₹{selectedMissingAccessories.length * 200}</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-800 my-2"></div>
                  <div className="flex justify-between text-base font-bold text-success">
                    <span>Amount to Refund:</span>
                    <span>₹{calculateRefundAmount()}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full justify-center bg-success hover:bg-success/90 border-success"
              >
                Confirm Return & Settle Deposit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PickupReturnBoard;
