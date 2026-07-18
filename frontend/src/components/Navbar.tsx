import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, PackageSearch, LayoutDashboard, Truck, FileText, Tag } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <PackageSearch size={28} className="logo-icon" />
          <span className="text-gradient-accent font-outfit font-bold text-xl">RentOps</span>
        </Link>

        <div className="navbar-links">
          {isAdmin ? (
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
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Catalog</Link>
              <Link to="/orders" className="nav-link">My Rentals</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/cart" className="cart-btn">
                <ShoppingCart size={20} />
                <span className="cart-badge">1</span>
              </Link>
            </>
          )}
          <Link to="/profile" className="user-profile">
            <User size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
