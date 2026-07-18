import { useState, useEffect } from 'react';
import './Wishlist.css';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import type { Product } from '../../types/api';

const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    const stored = localStorage.getItem('wishlist');
    setWishlistIds(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    fetchWishlist();
    window.addEventListener('local-storage-update', fetchWishlist);
    return () => {
      window.removeEventListener('local-storage-update', fetchWishlist);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productsApi.getProducts();
        const allProducts = res.data || [];
        // Filter products that are in the wishlist
        const wishlisted = allProducts.filter((p: Product) => wishlistIds.includes(p.id));
        setProducts(wishlisted);
      } catch (err) {
        console.error('Failed to fetch products for wishlist', err);
      } finally {
        setLoading(false);
      }
    };

    if (wishlistIds.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlistIds]);

  const removeFromWishlist = (id: string) => {
    const updated = wishlistIds.filter(item => item !== id);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlistIds(updated);
    window.dispatchEvent(new Event('local-storage-update'));
  };

  const getBase = (product: any) => {
    if (product?.pricingRules && product.pricingRules.length > 0) {
      return parseFloat(product.pricingRules[0].price);
    }
    return product?.basePrice || 500;
  };

  const getDailyPrice = (product: any) => {
    const dailyRule = product?.pricingRules?.find((r: any) => r.rentalPeriod?.unit === 'DAY');
    return dailyRule ? parseFloat(dailyRule.price) : getBase(product);
  };

  return (
    <div className="wishlist-container animate-fade-in">
      <div className="wishlist-header">
        <Link to="/catalog" className="back-link">
          <ArrowLeft size={18} /> Back to Catalog
        </Link>
        <h1 className="text-gradient">My Wishlist</h1>
        <p className="subtitle">Items you are interested in renting</p>
      </div>

      {loading ? (
        <p className="text-center p-8 text-gray-400">Loading wishlist...</p>
      ) : products.length > 0 ? (
        <div className="wishlist-grid">
          {products.map(product => (
            <div key={product.id} className="wishlist-card glass-panel">
              <div className="wishlist-card-image text-xs flex items-center justify-center text-gray-400">
                Image
              </div>
              <div className="wishlist-card-info">
                <div className="wishlist-card-meta">
                  <h3>{product.name}</h3>
                  <p className="description text-xs text-gray-400 mt-1">{product.description}</p>
                </div>
                <div className="wishlist-card-actions">
                  <div className="price">
                    <span className="price-amount">₹{getDailyPrice(product)}</span>
                    <span className="price-period">/day</span>
                  </div>
                  <div className="buttons-group">
                    <Link to="/catalog" className="btn-primary py-2 px-3 text-xs flex items-center gap-1">
                      Rent Now
                    </Link>
                    <button 
                      onClick={() => removeFromWishlist(product.id)}
                      className="btn-danger p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-wishlist text-center p-12 glass-panel">
          <Heart size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 mb-6 text-sm">Explore our catalog and save items you want to rent later!</p>
          <Link to="/catalog" className="btn-primary inline-flex justify-center">
            Explore Catalog
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
