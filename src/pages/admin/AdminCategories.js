// src/pages/admin/AdminCategories.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', subcategories: '' });
    const [saving, setSaving] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const openAdd = () => {
        setEditId(null);
        setForm({ name: '', description: '', subcategories: '' });
        setShowForm(true);
    };

    const openEdit = (cat) => {
        setEditId(cat._id);
        setForm({
            name: cat.name,
            description: cat.description || '',
            subcategories: cat.subcategories?.map(s => s.name).join(', ') || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.warn('Name is required'); return; }
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                subcategories: form.subcategories.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }))
            };
            if (editId) {
                await api.put(`/categories/${editId}`, payload);
                toast.success('Category updated');
            } else {
                await api.post('/categories', payload);
                toast.success('Category created');
            }
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"?`)) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 text-sm">{categories.length} categories</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-md">
                    <FiPlus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">{editId ? 'Edit Category' : 'New Category'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategories (comma-separated)</label>
                                <input type="text" value={form.subcategories} onChange={e => setForm(f => ({ ...f, subcategories: e.target.value }))} placeholder="e.g., Dresses, Shirts, Jeans" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50">
                                <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                    <div key={cat._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                                {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
                                <p className="text-sm text-purple-600 font-medium mt-2">{cat.productCount || 0} products</p>
                                {cat.subcategories?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {cat.subcategories.map((sub, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{sub.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg"><FiEdit2 className="w-4 h-4 text-blue-500" /></button>
                                <button onClick={() => handleDelete(cat._id, cat.name)} className="p-2 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCategories;
