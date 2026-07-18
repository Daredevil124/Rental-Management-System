import { useState } from 'react';
import { UserPlus, Edit2, Shield, Search, X } from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([
    { id: 'USR-01', name: 'Alice Smith', email: 'alice@example.com', role: 'Customer', status: 'Active' },
    { id: 'USR-02', name: 'Bob Johnson', email: 'bob@example.com', role: 'Vendor', status: 'Pending' },
    { id: 'USR-03', name: 'Admin Manager', email: 'admin@rentops.com', role: 'Admin', status: 'Active' },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Customer' });

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: `USR-0${users.length + 1}`, ...newUser, status: 'Active' }]);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'Customer' });
    }
  };

  return (
    <div className="admin-users-container animate-fade-in relative">
      <div className="admin-page-header">
        <div>
          <h1 className="text-gradient">User Records</h1>
          <p className="subtitle">Manage customer and admin accounts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="search-bar my-6">
        <Search size={20} className="search-icon" />
        <input type="text" placeholder="Search users by name, email or ID..." />
      </div>

      <div className="table-container glass-panel mt-4">
        <table className="admin-table w-full text-left">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.id}</strong></td>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-warning'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons flex gap-2">
                    <button className="icon-btn edit-btn" title="Edit User"><Edit2 size={16} /></button>
                    {user.role !== 'Admin' && (
                      <button className="icon-btn" title="Make Admin"><Shield size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-6 w-full max-w-md animate-fade-in border border-indigo-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                <input type="email" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Role</label>
                <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="Customer">Customer</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <button className="btn-primary w-full mt-4 justify-center" onClick={handleAddUser}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
