// src/pages/admin/AdminProducts.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            const res = await api.get('/products', { params });
            setProducts(res.data.data);
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete product');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await api.put(`/products/${id}`, { isActive: !currentStatus });
            toast.success(currentStatus ? 'Product hidden' : 'Product visible');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to update product');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm">{pagination.total || 0} total products</p>
                </div>
                <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-md">
                    <FiPlus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Table */}
            {loading ? <Loader /> : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Brand</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Stock</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Status</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={p.images?.[0]?.url || '/images/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate max-w-[200px]">{p.title}</p>
                                                    <p className="text-xs text-gray-400">{p.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.brand}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span className="font-semibold text-gray-800">₹{(p.offerPrice || p.price).toLocaleString('en-IN')}</span>
                                                {p.offerPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price.toLocaleString('en-IN')}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock <= 5 ? 'bg-red-100 text-red-700' : p.stock <= 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {p.isActive !== false ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => toggleActive(p._id, p.isActive !== false)} className="p-2 hover:bg-gray-100 rounded-lg transition" title={p.isActive !== false ? 'Hide' : 'Show'}>
                                                    {p.isActive !== false ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-green-500" />}
                                                </button>
                                                <Link to={`/admin/products/edit/${p._id}`} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Edit">
                                                    <FiEdit2 className="w-4 h-4 text-blue-500" />
                                                </Link>
                                                <button onClick={() => handleDelete(p._id, p.title)} className="p-2 hover:bg-red-50 rounded-lg transition" title="Delete">
                                                    <FiTrash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400">No products found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">Previous</button>
                                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
