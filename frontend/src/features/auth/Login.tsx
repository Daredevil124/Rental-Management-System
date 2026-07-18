import './Login.css';
import { ArrowRight, User, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate admin login
    navigate('/admin');
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input type="email" placeholder="admin@rentops.com" required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="••••••••" required />
            </div>
          </div>

          <div className="form-actions">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/reset-password" className="forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-4">
            Sign In <ArrowRight size={18} />
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
