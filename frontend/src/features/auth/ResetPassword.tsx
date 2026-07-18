import './Login.css'; // Reuse Login styles
import { ArrowRight, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset link and then redirecting
    alert('Reset link sent to your email address!');
    navigate('/login');
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Reset Password</h2>
          <p className="login-subtitle">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleReset} className="login-form">
          <div className="form-group">
            <label>Enter Email ID:</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="john@example.com" required />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-4" style={{ backgroundColor: '#9c36b5' }}>
            Reset Password <ArrowRight size={18} />
          </button>
          
          <p className="secure-payment-note">
            Remembered your password? <Link to="/login" className="text-gradient-accent">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
