import { useState, useRef } from 'react';
import './Profile.css';
import { User, MapPin, CreditCard, Camera, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Address State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<any[]>(user?.addresses || []);
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', city: '' });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAddress = () => {
    if (newAddress.label && newAddress.line1) {
      setAddresses([...addresses, newAddress]);
      setNewAddress({ label: '', line1: '', city: '' });
      setShowAddressForm(false);
    }
  };

  return (
    <div className="profile-container animate-fade-in">
      <h1 className="text-gradient mb-8">My Profile</h1>
      
      <div className="profile-grid">
        <div className="profile-card glass-panel">
          <div className="profile-header">
            <div className="profile-avatar-container relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500" />
              ) : (
                <div className="profile-avatar w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-2 border-indigo-500">
                  <User size={48} className="text-indigo-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div className="profile-info mt-4 text-center">
              <h2>{user?.fullName || 'John Doe'}</h2>
              <p className="text-gray-400">{user?.email || 'john@example.com'}</p>
              <span className="badge badge-primary mt-2">Premium Member</span>
            </div>
          </div>
        </div>

        <div className="profile-card glass-panel relative">
          <div className="card-title flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="icon-accent" />
              <h3>Saved Addresses</h3>
            </div>
            {!showAddressForm && (
              <button className="btn-icon" onClick={() => setShowAddressForm(true)}>
                <Plus size={20} />
              </button>
            )}
          </div>
          
          <div className="saved-address mt-4">
            {addresses.length > 0 ? (
              addresses.map((addr: any, index: number) => (
                <div key={index} className="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <p className="text-indigo-400 font-semibold mb-1">{addr.label || 'Home'}</p>
                  <p className="text-gray-300 text-sm">{addr.line1}</p>
                  <p className="text-gray-400 text-sm">{addr.city}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No addresses saved.</p>
            )}
          </div>

          {showAddressForm && (
            <div className="mt-4 p-4 rounded-lg bg-gray-800 border border-indigo-500/30">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-white">Add New Address</h4>
                <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
              </div>
              <input type="text" placeholder="Label (e.g. Work, Home)" className="w-full mb-3 p-2 bg-gray-900 rounded border border-gray-700 text-sm" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
              <input type="text" placeholder="Street Address" className="w-full mb-3 p-2 bg-gray-900 rounded border border-gray-700 text-sm" value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} />
              <input type="text" placeholder="City" className="w-full mb-4 p-2 bg-gray-900 rounded border border-gray-700 text-sm" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
              <button className="btn-primary w-full text-sm py-2" onClick={handleAddAddress}>Save Address</button>
            </div>
          )}
        </div>

        <div className="profile-card glass-panel">
          <div className="card-title">
            <CreditCard size={20} className="icon-accent" />
            <h3>Payment Methods</h3>
          </div>
          <div className="saved-payment mt-4">
            <p><strong>Visa ending in 4242</strong></p>
            <p className="subtitle">Expires 12/25</p>
          </div>
          <button className="btn-secondary mt-4">Add Payment Method</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
