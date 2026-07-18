import { useState, useEffect } from 'react';
import './Home.css';
import { Filter, ArrowRight, X } from 'lucide-react';
import { productsApi } from '../../api/products';
import type { Product } from '../../types/api';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('Daily');


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsApi.getProducts();
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    console.log(product);
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  }
  );
   console.log("hi");

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    const cartItem = {
      id: Math.random().toString(36).substring(7),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.basePrice,
      deposit: Math.round(selectedProduct.basePrice * 1.5),
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

        {loading ? (
          <p>Loading catalog...</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card glass-panel"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="product-image-placeholder text-xs flex items-center justify-center text-gray-400">
                  Image
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category text-xs mb-1">{product.description}</p>
                  <div className="product-price">
                    <span className="price-amount">₹{product.basePrice}</span>
                    <span className="price-period">/day</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="no-results-msg">No equipment matches your search query.</p>
            )}
          </div>
        )}
      </section>

      {selectedProduct && (
        <div className="product-modal-backdrop" onClick={() => {
          setSelectedProduct(null);
          setEndDate('');
          setStartDate('');
          setPeriod('Daily');
        }
        }>
          <div className="product-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => {
              setSelectedProduct(null);
              setEndDate('');
              setStartDate('');
              setPeriod('Daily');
            }
            }>
              <X size={20} />
            </button>
            <span className="product-category">{selectedProduct.categoryId}</span>
            <h2 className="text-gradient mt-2">{selectedProduct.name}</h2>
            <p className="product-description mt-4">{selectedProduct.description}</p>

            <div className="modal-price-box mt-4">
              <div>
                <span className="modal-price-amount">₹{selectedProduct.basePrice}</span>
                <span className="modal-price-period">/day</span>
              </div>
              <div className="modal-deposit-amount">
                Security Deposit Hold: <strong>₹{Math.round(selectedProduct.basePrice * 1.5)}</strong>
              </div>
            </div>

            <div className="rental-options mt-6">
              <div className="form-group">
                <label>Rental Period</label>
                <select
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div className="date-picker-group mt-4">
                {period === 'Hourly' && (
                  <>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {period === 'Daily' && (
                  <>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {period === 'Weekly' && (
                  <>
                    <div className="form-group">
                      <label>Start Week</label>
                      <input
                        type="week"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Week</label>
                      <input
                        type="week"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
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
