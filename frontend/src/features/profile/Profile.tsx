import './Profile.css';
import { User as UserIcon, MapPin, CreditCard, AlertCircle, CheckCircle, Edit3, X, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth';

const Profile = () => {
  // Profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Address state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState<any>(() => {
    const saved = localStorage.getItem('user_address');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Address temporary edit values
  const [editAddress, setEditAddress] = useState(address || {
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  // Payment state
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [payment, setPayment] = useState<any>(() => {
    const saved = localStorage.getItem('user_payment');
    return saved ? JSON.parse(saved) : null;
  });

  // Payment temporary edit values
  const [editPayment, setEditPayment] = useState(payment || {
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.getMe();
        const user = (response as any).data;
        if (user) {
          setFullName(user.fullName || user.name || '');
          setPhone(user.phone || '');
          setEmail(user.email || '');
          setRole(user.role || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile info.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (fullName.trim().length < 2) {
      const msg = 'Full Name must be at least 2 characters long.';
      setError(msg);
      alert(msg);
      setSaving(false);
      return;
    }

    if (phone && !/^\d{10}$/.test(phone.replace(/\s+/g, ''))) {
      const msg = 'Phone number must be exactly 10 digits.';
      setError(msg);
      alert(msg);
      setSaving(false);
      return;
    }

    try {
      const response = await authApi.updateMe({ fullName, phone });
      const updatedUser = (response as any).data;
      
      setSuccess('Profile details saved!');
      setIsEditingProfile(false);
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.name = updatedUser.fullName || updatedUser.name || fullName;
        localStorage.setItem('user', JSON.stringify(parsed));
        window.dispatchEvent(new Event('local-storage-update'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editAddress.label.trim()) {
      const msg = 'Address Label is required.';
      alert(msg);
      return;
    }

    if (!editAddress.line1.trim()) {
      const msg = 'Street Address Line 1 is required.';
      alert(msg);
      return;
    }

    if (!editAddress.city.trim()) {
      const msg = 'City is required.';
      alert(msg);
      return;
    }

    if (!/^\d{6}$/.test(editAddress.postalCode)) {
      const msg = 'Postal code must be exactly 6 digits.';
      alert(msg);
      return;
    }

    if (!editAddress.state.trim()) {
      const msg = 'State is required.';
      alert(msg);
      return;
    }

    setAddress(editAddress);
    localStorage.setItem('user_address', JSON.stringify(editAddress));
    setSuccess('Address updated successfully!');
    setIsEditingAddress(false);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editPayment.cardholder.trim()) {
      const msg = 'Cardholder name is required.';
      alert(msg);
      return;
    }

    const cleanCard = (editPayment.cardNumber || '').replace(/[\s-]/g, '');
    if (!/^\d{16}$/.test(cleanCard)) {
      const msg = 'Card number must be exactly 16 digits.';
      alert(msg);
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(editPayment.expiry)) {
      const msg = 'Expiry date must be in MM/YY format.';
      alert(msg);
      return;
    }

    if (!/^\d{3}$/.test(editPayment.cvv)) {
      const msg = 'CVV must be exactly 3 digits.';
      alert(msg);
      return;
    }

    const last4 = cleanCard.slice(-4);
    const finalPayment = {
      cardType: cleanCard.startsWith('5') ? 'Mastercard' : 'Visa',
      last4,
      expiry: editPayment.expiry,
      cardholder: editPayment.cardholder
    };
    setPayment(finalPayment);
    localStorage.setItem('user_payment', JSON.stringify(finalPayment));
    setSuccess('Payment method updated successfully!');
    setIsEditingPayment(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return <div className="profile-container animate-fade-in"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-container animate-fade-in">
      <h1 className="text-gradient">My Profile</h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card glass-panel relative">
          <div className="profile-card-header">
            <div className="profile-header-main">
              <div className="profile-avatar">
                <UserIcon size={32} />
              </div>
              <div>
                <h2>{fullName || 'User Profile'}</h2>
                <p className="subtitle">{email}</p>
                <span className="badge" style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                  {role}
                </span>
              </div>
            </div>
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)} 
                className="edit-icon-btn" 
                title="Edit Details"
              >
                <Edit3 size={18} />
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="profile-edit-form mt-6">
              <div className="form-group-custom">
                <label className="label-custom">Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required
                  className="input-custom"
                />
              </div>

              <div className="form-group-custom mt-4">
                <label className="label-custom">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+91 99999 99999"
                  className="input-custom"
                />
              </div>

              <div className="form-actions-row mt-6">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-cancel">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details-display mt-6">
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{phone || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Address Card */}
        <div className="profile-card glass-panel relative">
          <div className="profile-card-header">
            <div className="card-title">
              <MapPin size={20} className="icon-accent" />
              <h3>Saved Addresses</h3>
            </div>
            {address && !isEditingAddress && (
              <button 
                onClick={() => {
                  setEditAddress(address);
                  setIsEditingAddress(true);
                }} 
                className="edit-icon-btn" 
                title="Edit Address"
              >
                <Edit3 size={18} />
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <form onSubmit={handleSaveAddress} className="profile-edit-form mt-4">
              <div className="form-group-custom">
                <label className="label-custom">Address Label</label>
                <input 
                  type="text" 
                  value={editAddress.label} 
                  onChange={(e) => setEditAddress({ ...editAddress, label: e.target.value })} 
                  required
                  className="input-custom"
                />
              </div>
              <div className="form-group-custom mt-3">
                <label className="label-custom">Street Line 1</label>
                <input 
                  type="text" 
                  value={editAddress.line1} 
                  onChange={(e) => setEditAddress({ ...editAddress, line1: e.target.value })} 
                  required
                  className="input-custom"
                />
              </div>
              <div className="form-group-custom mt-3">
                <label className="label-custom">Street Line 2</label>
                <input 
                  type="text" 
                  value={editAddress.line2} 
                  onChange={(e) => setEditAddress({ ...editAddress, line2: e.target.value })} 
                  className="input-custom"
                  placeholder="Apartment, Suite, Block, etc."
                />
              </div>
              <div className="date-picker-group mt-3">
                <div className="form-group-custom">
                  <label className="label-custom">City</label>
                  <input 
                  type="text" 
                    value={editAddress.city} 
                    onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })} 
                    required
                    className="input-custom"
                  />
                </div>
                <div className="form-group-custom">
                  <label className="label-custom">Postal Code</label>
                  <input 
                    type="text" 
                    value={editAddress.postalCode} 
                    onChange={(e) => setEditAddress({ ...editAddress, postalCode: e.target.value })} 
                    required
                    className="input-custom"
                  />
                </div>
              </div>
              <div className="form-group-custom mt-3">
                <label className="label-custom">State</label>
                <input 
                  type="text" 
                  value={editAddress.state} 
                  onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })} 
                  required
                  className="input-custom"
                />
              </div>

              <div className="form-actions-row mt-4">
                <button type="button" onClick={() => setIsEditingAddress(false)} className="btn-cancel">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Save size={16} /> Save
                </button>
              </div>
            </form>
          ) : address ? (
            <div className="saved-address-display mt-4">
              <p className="address-label"><strong>{address.label}</strong></p>
              <p className="subtitle mt-1">
                {address.line1}
                {address.line2 && <><br />{address.line2}</>}
                <br />
                {address.city}, {address.state} - {address.postalCode}
              </p>
            </div>
          ) : (
            <div className="empty-profile-detail mt-6 p-6 text-center border border-dashed border-gray-700/60 rounded-2xl">
              <p className="text-sm text-gray-400 mb-4">No address details on file. Please add an address to complete your profile.</p>
              <button 
                onClick={() => {
                  setEditAddress({
                    label: 'Home',
                    line1: '',
                    line2: '',
                    city: '',
                    state: '',
                    postalCode: ''
                  });
                  setIsEditingAddress(true);
                }}
                className="btn-primary py-2 px-4 text-sm justify-center mx-auto"
                style={{ width: 'fit-content' }}
              >
                Add Address
              </button>
            </div>
          )}
        </div>

        {/* Payment Card */}
        <div className="profile-card glass-panel relative">
          <div className="profile-card-header">
            <div className="card-title">
              <CreditCard size={20} className="icon-accent" />
              <h3>Payment Methods</h3>
            </div>
            {payment && !isEditingPayment && (
              <button 
                onClick={() => {
                  setEditPayment({
                    ...payment,
                    cardNumber: `•••• •••• •••• ${payment.last4}`,
                    cvv: '•••'
                  });
                  setIsEditingPayment(true);
                }} 
                className="edit-icon-btn" 
                title="Edit Payment"
              >
                <Edit3 size={18} />
              </button>
            )}
          </div>

          {isEditingPayment ? (
            <form onSubmit={handleSavePayment} className="profile-edit-form mt-4">
              <div className="form-group-custom">
                <label className="label-custom">Cardholder Name</label>
                <input 
                  type="text" 
                  value={editPayment.cardholder} 
                  onChange={(e) => setEditPayment({ ...editPayment, cardholder: e.target.value })} 
                  required
                  className="input-custom"
                />
              </div>
              <div className="form-group-custom mt-3">
                <label className="label-custom">Card Number</label>
                <input 
                  type="text" 
                  value={editPayment.cardNumber} 
                  onChange={(e) => setEditPayment({ ...editPayment, cardNumber: e.target.value })} 
                  required
                  className="input-custom"
                  maxLength={19}
                  placeholder="4111 1111 1111 4242"
                />
              </div>
              <div className="date-picker-group mt-3">
                <div className="form-group-custom">
                  <label className="label-custom">Expiry Date</label>
                  <input 
                    type="text" 
                    value={editPayment.expiry} 
                    onChange={(e) => setEditPayment({ ...editPayment, expiry: e.target.value })} 
                    required
                    className="input-custom"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="form-group-custom">
                  <label className="label-custom">CVV</label>
                  <input 
                    type="password" 
                    value={editPayment.cvv} 
                    onChange={(e) => setEditPayment({ ...editPayment, cvv: e.target.value })} 
                    required
                    className="input-custom"
                    maxLength={4}
                    placeholder="•••"
                  />
                </div>
              </div>

              <div className="form-actions-row mt-4">
                <button type="button" onClick={() => setIsEditingPayment(false)} className="btn-cancel">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Save size={16} /> Save
                </button>
              </div>
            </form>
          ) : payment ? (
            <div className="saved-payment-display mt-4">
              <p className="cardholder-name"><strong>{payment.cardholder}</strong></p>
              <div className="payment-details mt-2">
                <p className="subtitle">{payment.cardType} ending in {payment.last4}</p>
                <p className="subtitle text-xs">Expires {payment.expiry}</p>
              </div>
            </div>
          ) : (
            <div className="empty-profile-detail mt-6 p-6 text-center border border-dashed border-gray-700/60 rounded-2xl">
              <p className="text-sm text-gray-400 mb-4">No payment details on file. Please add a payment method for seamless checkouts.</p>
              <button 
                onClick={() => {
                  setEditPayment({
                    cardholder: '',
                    cardNumber: '',
                    expiry: '',
                    cvv: ''
                  });
                  setIsEditingPayment(true);
                }}
                className="btn-primary py-2 px-4 text-sm justify-center mx-auto"
                style={{ width: 'fit-content' }}
              >
                Add Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
