import { useState, useEffect } from 'react';
import './Profile.css';
import { User as UserIcon, MapPin, CreditCard } from 'lucide-react';
import { authApi } from '../../api/auth';
import type { User } from '../../types/api';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        setUser(res.data as User);
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="profile-container animate-fade-in">
      <h1 className="text-gradient">My Profile</h1>
      
      <div className="profile-grid">
        <div className="profile-card glass-panel">
          <div className="profile-header">
            <div className="profile-avatar">
              <UserIcon size={32} />
            </div>
            <div>
              <h2>{user?.name || 'User Name'}</h2>
              <p className="subtitle">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          <div className="form-group mt-4">
            <label>Phone Number</label>
            <input type="text" defaultValue="+91 98765 43210" />
          </div>
          <button className="btn-secondary mt-4">Save Changes</button>
        </div>

        <div className="profile-card glass-panel">
          <div className="card-title">
            <MapPin size={20} className="icon-accent" />
            <h3>Saved Addresses</h3>
          </div>
          <div className="saved-address mt-4">
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr: any, index: number) => (
                <div key={index} className="mb-4">
                  <p><strong>{addr.label || 'Home'}</strong></p>
                  <p className="subtitle">{addr.line1}, {addr.city}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No addresses saved.</p>
            )}
          </div>
          <button className="btn-secondary mt-4" onClick={() => alert('Address modal would open here')}>Add New Address</button>
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
