import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './features/catalog/Home';
import AdminDashboard from './features/admin-dashboard/AdminDashboard';
import Login from './features/auth/Login';
import Cart from './features/cart/Cart';
import Checkout from './features/checkout/Checkout';
import PickupReturnBoard from './features/pickup-return/PickupReturnBoard';

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
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/operations" element={<PickupReturnBoard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
