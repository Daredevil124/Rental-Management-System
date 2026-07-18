import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './features/catalog/Home';
import AdminDashboard from './features/admin-dashboard/AdminDashboard';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import VendorSignup from './features/auth/VendorSignup';
import ResetPassword from './features/auth/ResetPassword';
import Cart from './features/cart/Cart';
import Checkout from './features/checkout/Checkout';
import PickupReturnBoard from './features/pickup-return/PickupReturnBoard';
import OrderHistory from './features/orders/OrderHistory';
import Profile from './features/profile/Profile';
import Wishlist from './features/wishlist/Wishlist';
import AdminProducts from './features/admin-products/AdminProducts';
import AdminQuotations from './features/admin-quotations/AdminQuotations';
import AdminPricing from './features/admin-pricing/AdminPricing';
import AdminUsers from './features/admin-users/AdminUsers';

import { useState } from 'react';
import SplashLoader from './features/splash/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <Router>
      {showSplash && <SplashLoader onFinish={handleSplashFinish} />}
      <div className={`app-container ${showSplash ? 'hidden' : ''}`}>
        <Navbar />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/vendor-signup" element={<VendorSignup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/operations" element={<PickupReturnBoard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/quotations" element={<AdminQuotations />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
