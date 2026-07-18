import { useState, useEffect } from 'react';
import './Login.css'; // Reuse Login styles
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth';

const ResetPassword = () => {
  const location = useLocation();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [linkSentMsg, setLinkSentMsg] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);

  // Check URL query parameters on load to see if user clicked a reset link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const tokenParam = params.get('token');
    
    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setStep(2); // Go directly to new password entry if link is "clicked"
    } else {
      setStep(1);
    }
  }, [location]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLinkSentMsg('');
    setGeneratedLink('');
    setLoading(true);

    try {
      const response = await authApi.verifyEmail(email);
      // Backend returns { exists: boolean, previewUrl?: string | null, resetLink?: string | null, emailError?: string | null }
      if (response?.data?.exists) {
        const previewUrl = (response.data as any).previewUrl;
        const emailError = (response.data as any).emailError;

        if (emailError) {
          throw new Error(`Failed to send email: ${emailError}`);
        }

        if (previewUrl) {
          setGeneratedLink(previewUrl);
          setLinkSentMsg('An Ethereal test email has been sent! You can preview the sent email in the mock inbox below:');
        } else {
          setLinkSentMsg('A password reset link has been successfully sent to your email address! Please check your Gmail inbox (and spam folder) for the link.');
        }
      } else {
        setError('Entered email does not exist.');
      }
    } catch (err: any) {
      setError(err.message || 'Error checking email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ email, newPassword });
      setSuccessMsg('Your password has been successfully reset!');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2 className="text-gradient">Reset Password</h2>
          <p className="login-subtitle">
            {step === 1 && !successMsg ? 'Enter your email to reset your password' : ''}
            {step === 2 && !successMsg ? 'Create a new strong password' : ''}
          </p>
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
        ) : linkSentMsg ? (
          <div className="text-center p-4">
            <div className="flex justify-center mb-3 text-green-500">
              <CheckCircle size={48} />
            </div>
            <p className="text-green-400 font-medium mb-6">
              A password reset link has been successfully sent to your email address! Please check your Gmail inbox (and spam folder) for the link.
            </p>
            {generatedLink && (
              <a 
                href={generatedLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-4"
              >
                Open Test Inbox <ExternalLink size={16} />
              </a>
            )}
            <Link to="/login" className="btn-primary w-full justify-center">
              Back to Login
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleVerifyEmail} className="login-form">
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
                <>Next Step <ArrowRight size={18} /></>
              )}
            </button>
            
            <p className="secure-payment-note text-center">
              Remembered your password? <Link to="/login" className="text-gradient-accent">Back to Login</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
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
              style={{ backgroundColor: '#9c36b5' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : (
                <>Update Password <CheckCircle size={18} className="ml-1" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
