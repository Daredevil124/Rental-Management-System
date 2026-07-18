import { useState } from 'react';
import './Login.css';
import { ArrowRight, User, Lock, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('local-storage-update'));
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid credentials received from server');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid User ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="email" 
<<<<<<< HEAD
                placeholder="admin@rentops.com or jane@example.com" 
=======
                placeholder="admin@rentops.com" 
>>>>>>> b6da2f0b5324f412a8215513c151b6b9caddd863
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

          <div className="form-actions">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/reset-password" className="forgot-password">Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full justify-center mt-4"
            disabled={loading}
          >
            {loading ? 'Signing in...' : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>

          <p className="secure-payment-note">
            Don't have an account? <Link to="/signup" className="text-gradient-accent">Sign up here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
