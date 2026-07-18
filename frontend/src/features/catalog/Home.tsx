import { useState, useEffect } from 'react';
import './Home.css';
import { Calendar, Filter, ArrowRight } from 'lucide-react';
import { productsApi } from '../../api/products';
import { Product } from '../../types/api';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="home-container animate-fade-in">
      <header className="hero">
        <h1 className="hero-title text-gradient">Rent Premium Equipment <br/>For Your Next Project</h1>
        <p className="hero-subtitle">High-quality rentals delivered right to your door. Seamless booking, transparent pricing.</p>
        
        <div className="search-bar glass-panel">
          <div className="search-input-group">
            <Filter size={20} className="search-icon" />
            <input type="text" placeholder="Search equipment..." className="search-input" />
          </div>
          <div className="search-divider"></div>
          <div className="search-input-group">
            <Calendar size={20} className="search-icon" />
            <input type="text" placeholder="Rental Dates" className="search-input" />
          </div>
          <button className="btn-primary">
            Browse Catalog
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <section className="featured-section">
        <h2 className="section-title">Featured Equipment</h2>
        {loading ? (
          <p>Loading catalog...</p>
        ) : (
          <div className="product-grid">
            {products.length > 0 ? products.map((item) => (
              <div key={item.id} className="product-card glass-panel">
                <div className="product-image-placeholder text-xs flex items-center justify-center text-gray-400">
                  Image
                </div>
                <div className="product-info">
                  <h3>{item.name}</h3>
                  <p className="product-category text-xs mb-1">{item.description}</p>
                  <div className="product-price">
                    <span className="price-amount">₹{item.basePrice}</span>
                    <span className="price-period">/day</span>
                  </div>
                </div>
              </div>
            )) : (
              <p>No products available.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
