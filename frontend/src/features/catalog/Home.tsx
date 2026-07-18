import { useState } from 'react';
import './Home.css';
import { Calendar, Filter, ArrowRight, X } from 'lucide-react';

const MOCK_PRODUCTS = [
  {
    id: 'dew-hammer-drill',
    name: 'DeWalt Rotary Hammer Drill',
    category: 'Tools',
    price: 45,
    deposit: 100,
    description: 'Heavy duty rotary hammer drill for concrete and masonry drilling. Features active vibration control and variable speed.',
  },
  {
    id: 'yam-generator-2000',
    name: 'Yamaha Portable Generator',
    category: 'Power',
    price: 85,
    deposit: 250,
    description: 'Quiet, fuel-efficient portable inverter generator. Provides clean 2000W power for sensitive electronics.',
  },
  {
    id: 'ext-cord-50ft',
    name: 'Outdoor Extension Cord 50ft',
    category: 'Accessories',
    price: 10,
    deposit: 20,
    description: 'Heavy-duty 12 gauge outdoor extension cord. Weather resistant and highly visible color.',
  },
  {
    id: 'pro-camera-kit',
    name: 'Pro DSLR Camera Kit',
    category: 'Photography',
    price: 55,
    deposit: 150,
    description: 'High-end DSLR camera body with 24-70mm f/2.8 lens, 2 batteries, charger, and 64GB card included.',
  }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('Daily');

  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    const cartItem = {
      id: Math.random().toString(36).substring(7),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      deposit: selectedProduct.deposit,
      startDate,
      endDate,
      period
    };

    const currentCart = localStorage.getItem('cart');
    const items = currentCart ? JSON.parse(currentCart) : [];
    items.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(items));
    
    window.dispatchEvent(new Event('local-storage-update'));
    
    setSelectedProduct(null);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="home-container animate-fade-in">
      <header className="hero">
        <h1 className="hero-title text-gradient">Rent Premium Equipment <br/>For Your Next Project</h1>
        <p className="hero-subtitle">High-quality rentals delivered right to your door. Seamless booking, transparent pricing.</p>
        
        <div className="search-bar glass-panel">
          <div className="search-input-group">
            <Filter size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search equipment by name or category..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <section className="featured-section">
        <h2 className="section-title">Available Equipment</h2>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="product-card glass-panel"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="product-image-placeholder"></div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <div className="product-price">
                  <span className="price-amount">${product.price}</span>
                  <span className="price-period">/day</span>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="no-results-msg">No equipment matches your search query.</p>
          )}
        </div>
      </section>

      {selectedProduct && (
        <div className="product-modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>
            <span className="product-category">{selectedProduct.category}</span>
            <h2 className="text-gradient mt-2">{selectedProduct.name}</h2>
            <p className="product-description mt-4">{selectedProduct.description}</p>
            
            <div className="modal-price-box mt-4">
              <div>
                <span className="modal-price-amount">${selectedProduct.price}</span>
                <span className="modal-price-period">/day</span>
              </div>
              <div className="modal-deposit-amount">
                Security Deposit Hold: <strong>${selectedProduct.deposit}</strong>
              </div>
            </div>

            <div className="rental-options mt-6">
              <div className="form-group">
                <label>Rental Period</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full">
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div className="date-picker-group mt-4">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
            </div>

            <button className="btn-primary w-full justify-center mt-6" onClick={handleAddToCart}>
              Add to Cart <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
