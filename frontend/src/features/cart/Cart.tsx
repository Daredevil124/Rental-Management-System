import { useState, useEffect } from 'react';
import './Cart.css';
import { Trash2, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { rentalsApi } from '../../api/rentals';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await rentalsApi.getCart();
        setCart(res.data);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      await rentalsApi.removeCartItem(itemId);
      const res = await rentalsApi.getCart();
      setCart(res.data);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading cart...</div>;
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const deposit = cart?.depositTotal || 0;
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
                <h3>{item.productName || 'Product Name'}</h3>
                <p className="cart-item-category">Quantity: {item.quantity}</p>
                <div className="rental-dates">
                  <Calendar size={16} />
                  <span>
                    {new Date(item.startsAt).toLocaleDateString()} - {new Date(item.endsAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="cart-item-price">
                <span className="price-val">₹{item.unitPrice * item.quantity}</span>
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
