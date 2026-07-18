import './Login.css'; // Reuse Login styles
import { ArrowRight, User, Lock, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/profile');
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Create Account</h2>
          <p className="login-subtitle">Join us to start renting premium gear</p>
        </div>

        <form onSubmit={handleSignup} className="login-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input type="text" placeholder="John Doe" required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="john@example.com" required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-4">
            Sign Up <ArrowRight size={18} />
          </button>
          
          <p className="secure-payment-note">
            Already have an account? <Link to="/login" className="text-gradient-accent">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
