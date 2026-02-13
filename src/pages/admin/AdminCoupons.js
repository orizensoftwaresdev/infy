// src/pages/admin/AdminCoupons.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiPercent, FiDollarSign } from 'react-icons/fi';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        code: '', discountType: 'percent', discountValue: '', minPurchase: '',
        maxDiscount: '', validUntil: '', usageLimit: '', isActive: true
    });

    const fetchCoupons = useCallback(async () => {
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data.data);
        } catch (err) {
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const openAdd = () => {
        setEditId(null);
        setForm({ code: '', discountType: 'percent', discountValue: '', minPurchase: '', maxDiscount: '', validUntil: '', usageLimit: '', isActive: true });
        setShowForm(true);
    };

    const openEdit = (c) => {
        setEditId(c._id);
        setForm({
            code: c.code, discountType: c.discountType, discountValue: c.discountValue,
            minPurchase: c.minPurchase || '', maxDiscount: c.maxDiscount || '',
            validUntil: c.validUntil ? new Date(c.validUntil).toISOString().split('T')[0] : '',
            usageLimit: c.usageLimit || '', isActive: c.isActive !== false
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discountValue) { toast.warn('Code and discount are required'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
                maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
            };
            if (editId) {
                await api.put(`/coupons/${editId}`, payload);
                toast.success('Coupon updated');
            } else {
                await api.post('/coupons', payload);
                toast.success('Coupon created');
            }
            setShowForm(false);
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`Delete coupon "${code}"?`)) return;
        try {
            await api.delete(`/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                    <p className="text-gray-500 text-sm">{coupons.length} coupons</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-md">
                    <FiPlus className="w-4 h-4" /> Add Coupon
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">{editId ? 'Edit Coupon' : 'New Coupon'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="percent">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                                <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase (₹)</label>
                                <input type="number" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                                <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                                <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                                <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" min="0" />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                            </div>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Code</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Discount</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Min Purchase</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Valid Until</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Usage</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-mono font-bold text-purple-600">{c.code}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                                            {c.discountType === 'percent' ? <><FiPercent className="w-3 h-3" />{c.discountValue}%</> : <>₹{c.discountValue}</>}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">₹{c.minPurchase || 0}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.usedCount || 0}/{c.usageLimit || '∞'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {c.isActive !== false ? 'Active' : 'Expired'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(c)} className="p-2 hover:bg-gray-100 rounded-lg"><FiEdit2 className="w-4 h-4 text-blue-500" /></button>
                                            <button onClick={() => handleDelete(c._id, c.code)} className="p-2 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4 text-red-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400">No coupons found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCoupons;
