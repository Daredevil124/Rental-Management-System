import './Home.css';
import { Calendar, Filter, ArrowRight } from 'lucide-react';

const Home = () => {
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
        <div className="product-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="product-card glass-panel">
              <div className="product-image-placeholder"></div>
              <div className="product-info">
                <h3>Pro Camera Kit {item}</h3>
                <p className="product-category">Photography</p>
                <div className="product-price">
                  <span className="price-amount">$45</span>
                  <span className="price-period">/day</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
