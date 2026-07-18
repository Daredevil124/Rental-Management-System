import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './features/catalog/Home';
import AdminDashboard from './features/admin-dashboard/AdminDashboard';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Cart from './features/cart/Cart';
import Checkout from './features/checkout/Checkout';
import PickupReturnBoard from './features/pickup-return/PickupReturnBoard';
import OrderHistory from './features/orders/OrderHistory';
import Profile from './features/profile/Profile';
import AdminProducts from './features/admin-products/AdminProducts';
import AdminQuotations from './features/admin-quotations/AdminQuotations';
import AdminPricing from './features/admin-pricing/AdminPricing';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/operations" element={<PickupReturnBoard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/quotations" element={<AdminQuotations />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
