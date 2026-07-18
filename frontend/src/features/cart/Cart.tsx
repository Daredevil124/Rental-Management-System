import { useState, useEffect } from 'react';
import './Cart.css';
import { Trash2, ArrowRight, Calendar, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<any>({});

  const fetchCart = () => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    } else {
      setItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
    
    const handleStorageUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('local-storage-update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('local-storage-update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleRemove = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('local-storage-update'));
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditState({
      quantity: item.quantity || 1,
      durationHours: item.durationHours || 0,
      durationDays: item.durationDays || 1,
      durationWeeks: item.durationWeeks || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (item: any) => {
    const updatedItems = items.map(curr => {
      if (curr.id === item.id) {
        // Calculate new price
        const prices = curr.prices || { hourly: 0, daily: 0, weekly: 0 };
        const baseItemPrice = (prices.hourly * editState.durationHours) + 
                              (prices.daily * editState.durationDays) + 
                              (prices.weekly * editState.durationWeeks);
        const totalPrice = baseItemPrice * editState.quantity;
        
        return {
          ...curr,
          quantity: editState.quantity,
          durationHours: editState.durationHours,
          durationDays: editState.durationDays,
          durationWeeks: editState.durationWeeks,
          duration: `${editState.durationWeeks}w ${editState.durationDays}d ${editState.durationHours}h`,
          price: totalPrice
        };
      }
      return curr;
    });

    setItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('local-storage-update'));
    setEditingId(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const deposit = items.reduce((acc, item) => acc + (item.deposit * (item.quantity || 1)), 0);
  const taxes = subtotal * 0.18; // Mock 18% tax
  const total = subtotal + deposit + taxes;

  return (
    <div className="cart-container animate-fade-in">
      <h1 className="text-gradient">Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items-section glass-panel">
          {items.length > 0 ? items.map((item: any) => (
            <div key={item.id} className="cart-item relative">
              <div className="cart-item-image text-xs flex items-center justify-center text-gray-400">IMG</div>
              
              {editingId === item.id ? (
                <div className="flex-1 ml-4 py-2 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{item.name || 'Product Name'}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Quantity</label>
                      <input 
                        type="number" min="1" 
                        value={editState.quantity} 
                        onChange={(e) => setEditState({...editState, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Hours</label>
                      <input 
                        type="number" min="0" 
                        value={editState.durationHours} 
                        onChange={(e) => setEditState({...editState, durationHours: Math.max(0, parseInt(e.target.value) || 0)})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Days</label>
                      <input 
                        type="number" min="0" 
                        value={editState.durationDays} 
                        onChange={(e) => setEditState({...editState, durationDays: Math.max(0, parseInt(e.target.value) || 0)})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Weeks</label>
                      <input 
                        type="number" min="0" 
                        value={editState.durationWeeks} 
                        onChange={(e) => setEditState({...editState, durationWeeks: Math.max(0, parseInt(e.target.value) || 0)})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 justify-end w-full">
                    <button className="text-sm px-3 py-1.5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-1" onClick={cancelEdit}>
                      <X size={14} /> Cancel
                    </button>
                    <button className="text-sm px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1" onClick={() => saveEdit(item)}>
                      <Check size={14} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="cart-item-info flex-1">
                    <h3>{item.name || 'Product Name'}</h3>
                    <p className="cart-item-category mt-1">Quantity: {item.quantity || 1}</p>
                    <div className="rental-dates mt-1">
                      <Calendar size={16} />
                      <span className="text-sm">
                        {new Date(item.startDate).toLocaleString()}
                      </span>
                    </div>
                    <p className="cart-item-category mt-1">Duration: {item.duration}</p>
                  </div>
                  <div className="cart-item-price flex flex-col items-end gap-3">
                    <span className="price-val">₹{item.price}</span>
                    <div className="flex gap-2">
                      <button className="text-indigo-400 hover:text-indigo-300 p-1 transition-colors" onClick={() => startEdit(item)} title="Edit item">
                        <Edit2 size={18} />
                      </button>
                      <button className="text-red-400 hover:text-red-300 p-1 transition-colors" onClick={() => handleRemove(item.id)} title="Remove item">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )) : (
            <div className="p-4 text-center">Your cart is empty.</div>
          )}
        </div>

        <div className="cart-summary glass-panel h-max">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Rental Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Security Deposit (Refundable)</span>
            <span>₹{deposit.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Taxes</span>
            <span>₹{taxes.toFixed(2)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary w-full justify-center" 
            onClick={() => navigate('/checkout')}
            disabled={items.length === 0}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
