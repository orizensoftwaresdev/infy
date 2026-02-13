// src/pages/admin/AdminUsers.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiSearch, FiShield, FiUser, FiUserX, FiUserCheck, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye, FiMail, FiPhone, FiCalendar, FiMapPin, FiShoppingBag } from 'react-icons/fi';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [viewUser, setViewUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', isActive: true });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (search) params.search = search;
            const res = await api.get('/admin/users', { params });
            setUsers(res.data.data);
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // View user details
    const handleView = async (userId) => {
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setViewUser(res.data.data);
        } catch (err) {
            // Fallback: use list data
            const u = users.find(u => u._id === userId);
            setViewUser(u);
        }
    };

    // Open add form
    const openAdd = () => {
        setEditId(null);
        setForm({ name: '', email: '', phone: '', password: '', role: 'customer', isActive: true });
        setShowForm(true);
        setViewUser(null);
    };

    // Open edit form
    const openEdit = (user) => {
        setEditId(user._id);
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            role: user.role || 'customer',
            isActive: user.isActive !== false
        });
        setShowForm(true);
        setViewUser(null);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) { toast.warn('Name and email are required'); return; }
        if (!editId && !form.password) { toast.warn('Password is required for new user'); return; }
        setSaving(true);
        try {
            const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, isActive: form.isActive };
            if (form.password) payload.password = form.password;
            if (editId) {
                await api.put(`/admin/users/${editId}`, payload);
                toast.success('User updated');
            } else {
                await api.post('/auth/register', { ...payload, password: form.password });
                toast.success('User created');
            }
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    // Delete user
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    // Toggle role
    const toggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'customer' : 'admin';
        if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
        try {
            await api.put(`/admin/users/${user._id}`, { role: newRole });
            toast.success(`Role changed to ${newRole}`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    // Toggle active
    const toggleActive = async (user) => {
        try {
            await api.put(`/admin/users/${user._id}`, { isActive: user.isActive === false });
            toast.success(user.isActive === false ? 'User activated' : 'User blocked');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500 text-sm">{pagination.total || users.length} registered users</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-md">
                    <FiPlus className="w-4 h-4" /> Add User
                </button>
            </div>

            <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            {/* View User Modal */}
            {viewUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                                        {viewUser.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{viewUser.name}</h2>
                                        <p className="text-purple-100 text-sm">{viewUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewUser(null)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem icon={FiShield} label="Role" value={viewUser.role} badge={viewUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'} />
                                <InfoItem icon={FiUser} label="Status" value={viewUser.isActive !== false ? 'Active' : 'Blocked'} badge={viewUser.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} />
                                <InfoItem icon={FiMail} label="Email" value={viewUser.email} />
                                <InfoItem icon={FiPhone} label="Phone" value={viewUser.phone || 'N/A'} />
                                <InfoItem icon={FiCalendar} label="Joined" value={new Date(viewUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
                                <InfoItem icon={FiShoppingBag} label="Orders" value={viewUser.orderCount ?? '—'} />
                            </div>
                            {viewUser.addresses?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" /> Addresses</h4>
                                    {viewUser.addresses.map((addr, i) => (
                                        <p key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-2">
                                            {addr.fullName && <span className="font-medium">{addr.fullName} — </span>}
                                            {addr.addressLine1}{addr.city ? `, ${addr.city}` : ''}{addr.state ? `, ${addr.state}` : ''}{addr.pincode ? ` - ${addr.pincode}` : ''}
                                        </p>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setViewUser(null); openEdit(viewUser); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                                    <FiEdit2 className="w-4 h-4" /> Edit User
                                </button>
                                <button onClick={() => { setViewUser(null); handleDelete(viewUser._id, viewUser.name); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                    <FiTrash2 className="w-4 h-4" /> Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit User' : 'Add New User'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{editId ? 'New Password (leave empty to keep)' : 'Password *'}</label>
                                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" {...(!editId ? { required: true } : {})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                                    <span className="text-sm font-medium text-gray-700">Active Account</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold">
                                <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : editId ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <Loader /> : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Email</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Status</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Joined</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                    {user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-400 sm:hidden">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.role === 'admin' ? <FiShield className="w-3 h-3" /> : <FiUser className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.isActive !== false ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleView(user._id)} className="p-2 hover:bg-blue-50 rounded-lg transition" title="View details">
                                                    <FiEye className="w-4 h-4 text-blue-500" />
                                                </button>
                                                <button onClick={() => openEdit(user)} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Edit user">
                                                    <FiEdit2 className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button onClick={() => toggleRole(user)} className="p-2 hover:bg-purple-50 rounded-lg transition" title="Toggle role">
                                                    <FiShield className={`w-4 h-4 ${user.role === 'admin' ? 'text-purple-500' : 'text-gray-400'}`} />
                                                </button>
                                                <button onClick={() => toggleActive(user)} className="p-2 hover:bg-gray-100 rounded-lg transition" title={user.isActive !== false ? 'Block user' : 'Unblock user'}>
                                                    {user.isActive !== false ? <FiUserX className="w-4 h-4 text-orange-400" /> : <FiUserCheck className="w-4 h-4 text-green-500" />}
                                                </button>
                                                <button onClick={() => handleDelete(user._id, user.name)} className="p-2 hover:bg-red-50 rounded-lg transition" title="Delete user">
                                                    <FiTrash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400">No users found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper component for view modal
const InfoItem = ({ icon: Icon, label, value, badge }) => (
    <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Icon className="w-3 h-3" />{label}</div>
        {badge ? (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${badge}`}>{value}</span>
        ) : (
            <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
        )}
    </div>
);

export default AdminUsers;
