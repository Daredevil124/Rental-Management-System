import './AdminProducts.css';
import { Plus, Edit2, Archive } from 'lucide-react';

const AdminProducts = () => {
  return (
    <div className="admin-products-container animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">Product Catalog</h1>
          <p className="subtitle">Manage products, variants, and inventory</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="table-container glass-panel mt-4">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>Available Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { sku: 'CAM-PRO-01', name: 'Pro Camera Kit 1', cat: 'Photography', price: '₹4,500/day', stock: 5 },
              { sku: 'DRN-MAX-02', name: 'Drone Pro Max', cat: 'Videography', price: '₹6,000/day', stock: 2 },
              { sku: 'LGT-STD-01', name: 'Lighting Stand Basic', cat: 'Lighting', price: '₹1,200/day', stock: 12 },
            ].map((prod) => (
              <tr key={prod.sku}>
                <td><span className="sku-badge">{prod.sku}</span></td>
                <td className="font-medium">{prod.name}</td>
                <td>{prod.cat}</td>
                <td>{prod.price}</td>
                <td>
                  <span className={`status-badge ${prod.stock < 3 ? 'status-warning' : 'status-active'}`}>
                    {prod.stock} units
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn edit-btn" title="Edit Product"><Edit2 size={16} /></button>
                    <button className="icon-btn archive-btn" title="Archive"><Archive size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
