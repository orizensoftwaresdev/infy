// src/pages/admin/AdminOrders.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiSearch, FiChevronDown, FiPackage } from 'react-icons/fi';

const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (filter !== 'all') params.status = filter;
            if (search) params.search = search;
            const res = await api.get('/admin/orders', { params });
            setOrders(res.data.data);
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, filter, search]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus });
            toast.success(`Order updated to ${newStatus}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update order');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500 text-sm">{pagination.total || 0} total orders</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map(s => (
                        <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${filter === s ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-400'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs ml-auto">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Search order #..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
            </div>

            {loading ? <Loader /> : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Order #</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Items</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Payment</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <React.Fragment key={order._id}>
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                                            <td className="px-4 py-3 font-medium text-gray-800">#{order.orderNumber}</td>
                                            <td className="px-4 py-3 text-gray-600">{order.user?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{order.items?.length || 0}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.paymentInfo?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {order.paymentInfo?.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select value={order.status} onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value); }}
                                                    onClick={e => e.stopPropagation()}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                        {expandedOrder === order._id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="7" className="px-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                                                            {order.items?.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-2 py-1 text-sm text-gray-600">
                                                                    <FiPackage className="w-3 h-3 text-gray-400" />
                                                                    <span>{item.title} × {item.quantity}</span>
                                                                    <span className="ml-auto font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-700 mb-2">Shipping Address</h4>
                                                            <p className="text-sm text-gray-600">{order.shippingAddress?.fullName}</p>
                                                            <p className="text-sm text-gray-500">{order.shippingAddress?.addressLine1}</p>
                                                            <p className="text-sm text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400">No orders found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
