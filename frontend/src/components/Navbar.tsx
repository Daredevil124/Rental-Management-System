import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, PackageSearch, LayoutDashboard, Truck, FileText, Tag, LogOut, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const checkSessionAndCart = () => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const items = JSON.parse(storedCart);
      setCartCount(items.length);
    } else {
      setCartCount(0);
    }

    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      const items = JSON.parse(storedWishlist);
      setWishlistCount(items.length);
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    checkSessionAndCart();
    
    window.addEventListener('local-storage-update', checkSessionAndCart);
    window.addEventListener('storage', checkSessionAndCart);

    return () => {
      window.removeEventListener('local-storage-update', checkSessionAndCart);
      window.removeEventListener('storage', checkSessionAndCart);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    window.dispatchEvent(new Event('local-storage-update'));
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to={isAdmin ? "/admin" : "/catalog"} className="navbar-logo">
          <PackageSearch size={28} className="logo-icon" />
          <span className="text-gradient-accent font-outfit font-bold text-xl">RentOps</span>
        </Link>

        <div className="navbar-links">
          {user ? (
            isAdmin ? (
              <>
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/operations" className={`nav-link ${location.pathname === '/admin/operations' ? 'active' : ''}`}>
                  <Truck size={20} />
                  <span>Operations</span>
                </Link>
                <Link to="/admin/products" className={`nav-link ${location.pathname === '/admin/products' ? 'active' : ''}`}>
                  <PackageSearch size={20} />
                  <span>Products</span>
                </Link>
                <Link to="/admin/quotations" className={`nav-link ${location.pathname === '/admin/quotations' ? 'active' : ''}`}>
                  <FileText size={20} />
                  <span>Quotes</span>
                </Link>
                <Link to="/admin/pricing" className={`nav-link ${location.pathname === '/admin/pricing' ? 'active' : ''}`}>
                  <Tag size={20} />
                  <span>Pricing</span>
                </Link>
                <Link to="/admin/users" className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}>
                  <User size={20} />
                  <span>Users</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/catalog" className={`nav-link ${location.pathname === '/catalog' || location.pathname === '/' ? 'active' : ''}`}>Catalog</Link>
                <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>My Rentals</Link>
                <Link to="/wishlist" className="wishlist-btn mr-1" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Heart size={20} />
                  {wishlistCount > 0 && <span className="cart-badge" style={{ backgroundColor: 'hsl(var(--accent))' }}>{wishlistCount}</span>}
                </Link>
                <Link to="/cart" className="cart-btn">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              </>
            )
          ) : (
            <>
              <Link to="/catalog" className="nav-link">Catalog</Link>
              <Link to="/wishlist" className="wishlist-btn mr-1" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Heart size={20} />
                {wishlistCount > 0 && <span className="cart-badge" style={{ backgroundColor: 'hsl(var(--accent))' }}>{wishlistCount}</span>}
              </Link>
              <Link to="/login" className="nav-link">Login</Link>
            </>
          )}

          {user && (
            <>
              <Link to="/profile" className="user-profile">
                <User size={24} />
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
