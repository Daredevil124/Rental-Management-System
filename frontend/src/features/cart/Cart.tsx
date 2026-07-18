import './Cart.css';
import { Trash2, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();

  return (
    <div className="cart-container animate-fade-in">
      <h1 className="text-gradient">Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items-section glass-panel">
          <div className="cart-item">
            <div className="cart-item-image"></div>
            <div className="cart-item-info">
              <h3>Pro Camera Kit 1</h3>
              <p className="cart-item-category">Photography</p>
              <div className="rental-dates">
                <Calendar size={16} />
                <span>Oct 12 - Oct 15 (3 days)</span>
              </div>
            </div>
            <div className="cart-item-price">
              <span className="price-val">₹4,500</span>
              <button className="btn-remove">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="cart-summary glass-panel">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Rental Total</span>
            <span>₹4,500</span>
          </div>
          <div className="summary-row">
            <span>Security Deposit (Refundable)</span>
            <span>₹2,000</span>
          </div>
          <div className="summary-row">
            <span>Taxes</span>
            <span>₹810</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹7,310</span>
          </div>
          <button className="btn-primary w-full justify-center" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
