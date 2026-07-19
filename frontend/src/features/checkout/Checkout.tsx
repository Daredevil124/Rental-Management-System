import { useState, useEffect } from 'react';
import './Checkout.css';
import { CreditCard, MapPin, Truck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { rentalsApi } from '../../api/rentals';

const Checkout = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const fetchCart = () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      } else {
        setItems([]);
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCheckout = async () => {
    if (items.length === 0) {
      showToast('Your cart is empty.');
      return;
    }

    if (deliveryMethod === 'DELIVERY' && (!fullName.trim() || !address.trim())) {
      showToast('Input field is not as per requirement: Full Name and Address are required for delivery.');
      return;
    }

    // Validate Payment Details
    const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      showToast('Input field is not as per requirement: Card Number must be 16 digits.');
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      showToast('Input field is not as per requirement: Expiry Date must be in MM/YY format.');
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      showToast('Input field is not as per requirement: CVV must be 3 or 4 digits.');
      return;
    }

    setCheckingOut(true);
    try {
      // Create a checkout payload matching our new format
      await rentalsApi.checkout({
        addressId: 'temp-address-id', 
        deliveryMethod,
        items
      });
      // Clear cart on successful checkout
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('local-storage-update'));
      setSuccess(true);
    } catch (err) {
      console.error('Checkout failed', err);
      showToast('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success animate-fade-in glass-panel text-center p-12 max-w-md mx-auto mt-12">
        <CheckCircle size={64} className="success-icon mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gradient">Order Confirmed!</h2>
        <p className="text-gray-400 mb-6">Your rental order has been placed successfully.</p>
        <button className="btn-primary w-full justify-center" onClick={() => navigate('/orders')}>
          View My Rentals
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center">Loading checkout...</div>;
  }

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const deposit = items.reduce((acc, item) => acc + (item.deposit * (item.quantity || 1)), 0);
  const taxes = subtotal * 0.18;
  const total = subtotal + deposit + taxes;

  return (
    <div className="checkout-container animate-fade-in">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50 backdrop-blur-sm border border-red-400 font-medium">
          {toastMessage}
        </div>
      )}
      <h1 className="text-gradient">Checkout</h1>
      
      <div className="checkout-content">
        <div className="checkout-form-section">
          
          <div className="checkout-card glass-panel">
            <div className="checkout-card-header">
              <Truck size={20} className="icon-accent" />
              <h2>Delivery Method</h2>
            </div>
            <div className="delivery-options">
              <label className={`delivery-option ${deliveryMethod === 'DELIVERY' ? 'active' : ''}`}>
                <input type="radio" name="delivery" checked={deliveryMethod === 'DELIVERY'} onChange={() => setDeliveryMethod('DELIVERY')} />
                <span>Home Delivery</span>
              </label>
              <label className={`delivery-option ${deliveryMethod === 'STORE_PICKUP' ? 'active' : ''}`}>
                <input type="radio" name="delivery" checked={deliveryMethod === 'STORE_PICKUP'} onChange={() => setDeliveryMethod('STORE_PICKUP')} />
                <span>Store Pickup</span>
              </label>
            </div>
          </div>

          {deliveryMethod === 'DELIVERY' && (
            <div className="checkout-card glass-panel">
              <div className="checkout-card-header">
                <MapPin size={20} className="icon-accent" />
                <h2>Shipping Address</h2>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="form-group mt-4">
                <label>Address</label>
                <textarea rows={3} placeholder="123 Main St, City, Country" value={address} onChange={e => setAddress(e.target.value)}></textarea>
              </div>
            </div>
          )}

          <div className="checkout-card glass-panel">
            <div className="checkout-card-header">
              <CreditCard size={20} className="icon-accent" />
              <h2>Payment details</h2>
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="XXXX XXXX XXXX XXXX" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
            </div>
            <div className="payment-row mt-4">
              <div className="form-group flex-1">
                <label>Expiry</label>
                <input type="text" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} />
              </div>
              <div className="form-group flex-1">
                <label>CVV</label>
                <input type="password" placeholder="123" value={cvv} onChange={e => setCvv(e.target.value)} />
              </div>
            </div>
          </div>

        </div>

        <div className="checkout-summary-section">
          <div className="cart-summary glass-panel h-max">
            <h2>Order Summary</h2>
            {items.map((item: any) => (
              <div key={item.id} className="summary-row text-sm">
                <span>{item.name || 'Item'} (x{item.quantity || 1})</span>
                <span>₹{item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-divider"></div>
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
              <span>Total to Pay</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button 
              className="btn-primary w-full justify-center mt-4" 
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : 'Pay Securely'}
            </button>
            <p className="secure-payment-note text-center mt-3 text-xs text-gray-500">Your payment is encrypted and secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
