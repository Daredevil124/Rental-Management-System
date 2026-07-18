import { useState, useEffect } from 'react';
import './Cart.css';
import { Trash2, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);

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

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const deposit = items.reduce((acc, item) => acc + item.deposit, 0);
  const taxes = subtotal * 0.18; // Mock 18% tax
  const total = subtotal + deposit + taxes;

  return (
    <div className="cart-container animate-fade-in">
      <h1 className="text-gradient">Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items-section glass-panel">
          {items.length > 0 ? items.map((item: any) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image text-xs flex items-center justify-center text-gray-400">IMG</div>
              <div className="cart-item-info">
                <h3>{item.name || 'Product Name'}</h3>
                <div className="rental-dates mt-1">
                  <Calendar size={16} />
                  <span className="text-sm">
                    {new Date(item.startDate).toLocaleString()}
                  </span>
                </div>
                <p className="cart-item-category mt-1">Duration: {item.duration}</p>
              </div>
              <div className="cart-item-price">
                <span className="price-val">₹{item.price}</span>
                <button className="btn-remove" onClick={() => handleRemove(item.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-4 text-center">Your cart is empty.</div>
          )}
        </div>

        <div className="cart-summary glass-panel">
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
