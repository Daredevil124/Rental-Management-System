import './Login.css';
import { ArrowRight, User, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailAdmin = email.toLowerCase().includes('admin');
    const userRole = isEmailAdmin ? 'ADMIN' : 'CUSTOMER';
    const userName = isEmailAdmin ? 'Admin User' : 'Jane Doe';
    
    localStorage.setItem('user', JSON.stringify({ email, role: userRole, name: userName }));
    window.dispatchEvent(new Event('local-storage-update'));
    
    if (userRole === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/');
    }
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
              <input 
                type="email" 
                placeholder="admin@rentops.com or jane@example.com" 
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
            <a href="#" className="forgot-password">Forgot Password?</a>
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
