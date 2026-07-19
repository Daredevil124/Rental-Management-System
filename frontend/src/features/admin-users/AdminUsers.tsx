import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Shield, Search, X, Check } from 'lucide-react';
import './AdminUsers.css';
import { adminApi } from '../../api/admin';

const AdminUsers = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Customer' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (userId: string) => {
    try {
      await adminApi.approveVendor(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to approve vendor:', err);
      alert('Failed to approve vendor');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="admin-page animate-fade-in relative">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">User Records</h1>
          <p className="subtitle">Manage customer, vendor, and admin accounts</p>
        </div>
      </div>

      <div className="search-bar my-6">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search users by name, email or ID..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container glass-panel mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading user records...</div>
        ) : (
          <table className="admin-table w-full text-left">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company / Category / GST</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const status = user.isActive ? 'Active' : (user.role === 'VENDOR' ? 'Pending Approval' : 'Inactive');
                  return (
                    <tr key={user.id}>
                      <td><span className="sku-badge">{user.id.slice(0, 8)}...</span></td>
                      <td className="font-medium">{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-sm text-gray-400">
                        {user.role === 'VENDOR' ? (
                          <div>
                            <strong>{user.companyName || 'No Company'}</strong>
                            <div className="text-xs">{user.productCategory} • GST: {user.gstNo || 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${status === 'Active' ? 'status-active' : 'status-warning'}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons flex items-center gap-2">
                          {user.role === 'VENDOR' && !user.isActive && (
                            <button 
                              className="btn-success text-xs px-2 py-1.5 rounded flex items-center gap-1" 
                              onClick={() => handleApproveVendor(user.id)}
                              style={{ border: 'none', cursor: 'pointer', backgroundColor: 'hsl(var(--success))', color: '#fff' }}
                            >
                              <Check size={14} /> Approve Vendor
                            </button>
                          )}
                          {user.role !== 'VENDOR' && (
                            <span className="text-gray-600 text-xs">No Actions Required</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No users match search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
