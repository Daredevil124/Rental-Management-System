import './Checkout.css';
import { CreditCard, MapPin, Truck, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const Checkout = () => {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="checkout-success animate-fade-in glass-panel">
        <CheckCircle size={64} className="success-icon" />
        <h2>Order Confirmed!</h2>
        <p>Your rental order has been placed successfully.</p>
        <button className="btn-primary mt-4" onClick={() => window.location.href = '/'}>
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container animate-fade-in">
      <h1 className="text-gradient">Checkout</h1>
      
      <div className="checkout-content">
        <div className="checkout-form-section">
          
          <div className="checkout-card glass-panel">
            <div className="checkout-card-header">
              <Truck size={20} className="icon-accent" />
              <h2>Delivery Method</h2>
            </div>
            <div className="delivery-options">
              <label className="delivery-option active">
                <input type="radio" name="delivery" defaultChecked />
                <span>Home Delivery</span>
              </label>
              <label className="delivery-option">
                <input type="radio" name="delivery" />
                <span>Store Pickup</span>
              </label>
            </div>
          </div>

          <div className="checkout-card glass-panel">
            <div className="checkout-card-header">
              <MapPin size={20} className="icon-accent" />
              <h2>Shipping Address</h2>
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
            <div className="form-group mt-4">
              <label>Address</label>
              <textarea rows={3} placeholder="123 Main St, City, Country"></textarea>
            </div>
          </div>

          <div className="checkout-card glass-panel">
            <div className="checkout-card-header">
              <CreditCard size={20} className="icon-accent" />
              <h2>Payment details</h2>
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="XXXX XXXX XXXX XXXX" />
            </div>
            <div className="payment-row mt-4">
              <div className="form-group flex-1">
                <label>Expiry</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div className="form-group flex-1">
                <label>CVV</label>
                <input type="text" placeholder="123" />
              </div>
            </div>
          </div>

        </div>

        <div className="checkout-summary-section">
          <div className="cart-summary glass-panel">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Pro Camera Kit 1</span>
              <span>₹4,500</span>
            </div>
            <div className="summary-divider"></div>
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
              <span>Total to Pay</span>
              <span>₹7,310</span>
            </div>
            <button className="btn-primary w-full justify-center mt-4" onClick={() => setSuccess(true)}>
              Pay Securely
            </button>
            <p className="secure-payment-note">Your payment is encrypted and secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
