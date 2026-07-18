import { useState, useEffect } from 'react';
import './Home.css';
import { Filter, ArrowRight, X, Heart, Package } from 'lucide-react';
import { productsApi } from '../../api/products';
import type { Product } from '../../types/api';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [durationHours, setDurationHours] = useState(0);
  const [durationDays, setDurationDays] = useState(1);
  const [durationWeeks, setDurationWeeks] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const loadWishlist = () => {
    const stored = localStorage.getItem('wishlist');
    setWishlist(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('local-storage-update', loadWishlist);
    return () => {
      window.removeEventListener('local-storage-update', loadWishlist);
    };
  }, []);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated = [...wishlist];
    if (updated.includes(productId)) {
      updated = updated.filter(id => id !== productId);
    } else {
      updated.push(productId);
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('local-storage-update'));
  };


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

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  const filteredProducts = products.filter(product => {
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (!startDate || !startTime) {
      alert('Please select both a start date and time');
      return;
    }
    
    const combinedDateTime = `${startDate}T${startTime}`;
    if (new Date(combinedDateTime) < new Date()) {
      alert('Start date cannot be in the past. Please select a valid future date and time.');
      return;
    }

    if (durationHours === 0 && durationDays === 0 && durationWeeks === 0) {
      alert('Please select a valid duration');
      return;
    }
    
    const prices = getPrices(selectedProduct);
    const totalPrice = (prices.hourly * durationHours) + (prices.daily * durationDays) + (prices.weekly * durationWeeks);
    const deposit = Math.round(totalPrice * 1.5);
    
    const cartItem = {
      id: Math.random().toString(36).substring(7),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: totalPrice,
      deposit: deposit,
      startDate: combinedDateTime,
      duration: `${durationWeeks}w ${durationDays}d ${durationHours}h`,
      durationWeeks,
      durationDays,
      durationHours,
      prices,
      quantity: 1,
    };

    const currentCart = localStorage.getItem('cart');
    const items = currentCart ? JSON.parse(currentCart) : [];
    items.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(items));

    window.dispatchEvent(new Event('local-storage-update'));

    setSelectedProduct(null);
    setStartDate('');
    setStartTime('10:00');
    setDurationHours(0);
    setDurationDays(1);
    setDurationWeeks(0);
  };

  const getBase = (product: any) => {
    if (product?.pricingRules && product.pricingRules.length > 0) {
      return parseFloat(product.pricingRules[0].price);
    }
    return product?.basePrice || 500;
  };

  const getPrices = (product: any) => {
    const hourlyRule = product?.pricingRules?.find((r: any) => r.rentalPeriod?.unit === 'HOUR');
    const dailyRule = product?.pricingRules?.find((r: any) => r.rentalPeriod?.unit === 'DAY');
    const weeklyRule = product?.pricingRules?.find((r: any) => r.rentalPeriod?.unit === 'WEEK');
    
    const base = getBase(product);
    
    return {
      hourly: hourlyRule ? parseFloat(hourlyRule.price) : Math.round(base / 8),
      daily: dailyRule ? parseFloat(dailyRule.price) : base,
      weekly: weeklyRule ? parseFloat(weeklyRule.price) : base * 5
    };
  };


  const getLocalMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
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
                style={{ position: 'relative' }}
              >
                <button 
                  className="wishlist-toggle-btn"
                  onClick={(e) => toggleWishlist(product.id, e)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    color: wishlist.includes(product.id) ? 'hsl(var(--accent))' : '#fff',
                    transition: 'all 0.2s ease',
                  }}
                  title={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="product-image-placeholder">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5" />
                  <Package size={48} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category text-xs mb-1">{product.description}</p>
                  <div className="product-price">
                    <span className="price-amount">₹{getPrices(product).daily}</span>
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
        <div className="product-modal-backdrop">
          <div className="product-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => {
              setSelectedProduct(null);
              setStartDate('');
              setStartTime('10:00');
              setDurationHours(0);
              setDurationDays(1);
              setDurationWeeks(0);
            }}>
              <X size={20} />
            </button>
            <span className="product-category">{selectedProduct.categoryId}</span>
            <h2 className="text-gradient mt-2">{selectedProduct.name}</h2>
            <p className="product-description mt-4">{selectedProduct.description}</p>

            <div className="modal-price-box mt-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Hourly Rate:</span>
                  <span className="font-semibold text-white">₹{getPrices(selectedProduct).hourly}/hr</span>
                </div>
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Daily Rate:</span>
                  <span className="font-semibold text-white">₹{getPrices(selectedProduct).daily}/day</span>
                </div>
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                  <span className="text-gray-400">Weekly Rate:</span>
                  <span className="font-semibold text-white">₹{getPrices(selectedProduct).weekly}/week</span>
                </div>
              </div>
              <div className="modal-deposit-amount mt-3 text-center border-t border-gray-700 pt-3">
                Security Deposit Hold (1.5x): <strong>₹{Math.round(((getPrices(selectedProduct).hourly * durationHours) + (getPrices(selectedProduct).daily * durationDays) + (getPrices(selectedProduct).weekly * durationWeeks)) * 1.5)}</strong>
              </div>
            </div>

            <div className="rental-options mt-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="form-group">
                  <label className="text-sm text-gray-300 font-medium block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={getLocalMinDate()}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => {
                      if ('showPicker' in e.target) {
                        try { (e.target as HTMLInputElement).showPicker(); } catch (err) {}
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 cursor-pointer"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-sm text-gray-300 font-medium block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onClick={(e) => {
                      if ('showPicker' in e.target) {
                        try { (e.target as HTMLInputElement).showPicker(); } catch (err) {}
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-indigo-500 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <label className="block text-sm mb-2 text-gray-300 font-medium">Duration</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="text-xs text-gray-400">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs text-gray-400">Days</label>
                  <input
                    type="number"
                    min="0"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs text-gray-400">Weeks</label>
                  <input
                    type="number"
                    min="0"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded flex justify-between items-center">
                 <span className="text-sm text-indigo-300">Total Rental Price:</span>
                 <span className="font-bold text-white text-lg">
                   ₹{(getPrices(selectedProduct).hourly * durationHours) + (getPrices(selectedProduct).daily * durationDays) + (getPrices(selectedProduct).weekly * durationWeeks)}
                 </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-primary flex-1 justify-center" onClick={handleAddToCart}>
                Add to Cart <ArrowRight size={18} />
              </button>
              <button 
                className="btn-secondary p-3 rounded-lg border flex items-center justify-center"
                style={{
                  borderColor: wishlist.includes(selectedProduct.id) ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.1)',
                  color: wishlist.includes(selectedProduct.id) ? 'hsl(var(--accent))' : 'white',
                  background: 'rgba(255, 255, 255, 0.02)',
                  minWidth: '48px'
                }}
                onClick={(e) => toggleWishlist(selectedProduct.id, e)}
                title={wishlist.includes(selectedProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} fill={wishlist.includes(selectedProduct.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
