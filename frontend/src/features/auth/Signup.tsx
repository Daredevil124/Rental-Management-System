import { useState } from 'react';
import './Login.css'; // Reuse Login styles
import { ArrowRight, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
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

    if (lastName.trim().length < 2) {
      const msg = 'Last Name must be at least 2 characters long.';
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
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
        role: 'CUSTOMER'
      });
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('local-storage-update'));
        console.log("hi");
        navigate('/');
      } else {
        setError('Failed to register account');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating account.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Create Account</h2>
          <p className="login-subtitle">Join us to start renting premium gear</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="login-form">
          <div className="form-group">
            <label>First Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
                placeholder="john@example.com"
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
                placeholder="••••••••"
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
                placeholder="••••••••"
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
            {loading ? 'Creating Account...' : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </button>

          <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
            <Link to="/vendor-signup" className="text-gradient-accent" style={{ fontWeight: 600 }}>
              Become a vendor
            </Link>
          </div>

          <p className="secure-payment-note text-center">
            Already have an account? <Link to="/login" className="text-gradient-accent">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
