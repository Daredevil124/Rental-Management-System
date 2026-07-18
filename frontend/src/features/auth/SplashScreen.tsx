import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield } from 'lucide-react';
import './Login.css'; // Reuse Login and Portal styles

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel text-center p-8 max-w-lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Glow Top Branding */}
        <div style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(156, 54, 181, 0.4)',
          marginBottom: '2rem'
        }}>
          <Shield size={36} color="white" />
        </div>

        <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.05em' }}>
          RentOps Portal
        </h1>
        <p className="login-subtitle" style={{ fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Enterprise Rental Operations & Inventory Dispatch
        </p>

        {/* Coupon Code Section from Wireframe */}
        <div style={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed rgba(156, 54, 181, 0.4)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '2.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'hsl(var(--accent))',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            <Sparkles size={12} /> Coupon Code for New Signups <Sparkles size={12} />
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '0.05em',
            textShadow: '0 0 10px rgba(255,255,255,0.15)'
          }}>
            xxxx10
          </div>
        </div>

        {/* Enter Portal Action */}
        <button 
          className="btn-primary w-full justify-center" 
          onClick={() => navigate('/login')}
          style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', borderRadius: '14px' }}
        >
          Enter Portal <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
        </button>

        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '2rem' }}>
          Authorized personnel only. Sessions are audited and logged.
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
