import { useState } from 'react';
import './Login.css'; // Reuse Login styles
import { ArrowRight, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // 1. Verify whether the entered email exists
      const response = await authApi.verifyEmail(email);
      
      if (response?.data?.exists) {
        // 2. Display success feedback directly on screen
        setSuccessMsg('The password reset link has been sent to your email.');
      } else {
        setError('Entered email does not exist.');
      }
    } catch (err: any) {
      setError(err.message || 'Error checking email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Reset Password</h2>
          <p className="login-subtitle">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {successMsg ? (
          <div className="text-center p-4">
            <div className="flex justify-center mb-3 text-green-500">
              <CheckCircle size={48} />
            </div>
            <p className="text-green-400 font-medium mb-6">{successMsg}</p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="login-form">
            <div className="form-group">
              <label>Enter Email ID:</label>
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

            <button 
              type="submit" 
              className="btn-primary w-full justify-center mt-4" 
              style={{ backgroundColor: '#9c36b5' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : (
                <>Reset Password <ArrowRight size={18} /></>
              )}
            </button>
            
            <p className="secure-payment-note text-center">
              Remembered your password? <Link to="/login" className="text-gradient-accent">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
