import { useState } from 'react';
import './Login.css'; // Reuse Login styles
import { ArrowRight, User, Lock, Mail, Building, Tag, FileText, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

const VendorSignup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [productCategory, setProductCategory] = useState('Electronics');
  const [gstNo, setGstNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 6 || pass.length > 12) {
      return 'Password length must be between 6 and 12 characters.';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[@$&_]/.test(pass)) {
      return 'Password must contain at least one special character (@, $, &, _).';
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (firstName.trim().length < 2) {
      const msg = 'First Name must be at least 2 characters long.';
      setError(msg);
      alert(msg);
      return;
    }

    if (companyName.trim().length < 2) {
      const msg = 'Company Name must be at least 2 characters long.';
      setError(msg);
      alert(msg);
      return;
    }

    const gstRegex = /^[a-zA-Z0-9]{15}$/;
    if (!gstRegex.test(gstNo)) {
      const msg = 'GST Number must be exactly 15 alphanumeric characters.';
      setError(msg);
      alert(msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      alert(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Password and Confirm Password fields must match.';
      setError(msg);
      alert(msg);
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      alert(passError);
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        fullName: firstName, // Since schema expects fullName, map First Name
        email,
        password,
        role: 'VENDOR',
        companyName,
        productCategory,
        gstNo
      });

      if (response?.data?.user) {
        setSuccess(true);
        const pendingMessage = (response.data as any).message || 'Vendor registration successful! Pending administrator approval.';
        setError('');
        alert(pendingMessage);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setError('Failed to register vendor account.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating vendor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <h2 className="text-gradient">Become a Vendor</h2>
          <p className="login-subtitle">Register to manage inventory and sales orders</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-4 text-sm">
            Vendor registration successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSignup} className="login-form">
          <div className="form-group">
            <label>First Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter First Name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <div className="input-with-icon">
              <Building size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter Company Name" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Category</label>
            <div className="input-with-icon">
              <Tag size={18} className="input-icon" />
              <select 
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="Electronics" style={{ backgroundColor: '#211029' }}>Electronics</option>
                <option value="Furniture" style={{ backgroundColor: '#211029' }}>Furniture</option>
                <option value="Tools" style={{ backgroundColor: '#211029' }}>Tools</option>
                <option value="Appliances" style={{ backgroundColor: '#211029' }}>Appliances</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>GST No</label>
            <div className="input-with-icon">
              <FileText size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter GST no" 
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email ID</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="Enter Email ID" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Enter Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full justify-center mt-4"
            disabled={loading}
          >
            {loading ? 'Registering...' : (
              <>Register <ArrowRight size={18} /></>
            )}
          </button>
          
          <p className="secure-payment-note">
            Already have an account? <Link to="/login" className="text-gradient-accent">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VendorSignup;
