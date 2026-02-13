// src/pages/MyOrders.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { FiPackage, FiChevronDown, FiChevronUp, FiDownload, FiXCircle, FiTruck, FiClock, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const statusColors = {
    pending: 'text-yellow-600 bg-yellow-50',
    confirmed: 'text-blue-600 bg-blue-50',
    processing: 'text-indigo-600 bg-indigo-50',
    shipped: 'text-purple-600 bg-purple-50',
    delivered: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
    returned: 'text-gray-600 bg-gray-50'
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [expandedId, setExpandedId] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders', { params: { page, limit: 10 } });
            setOrders(res.data.data);
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const cancelOrder = async (orderId) => {
        if (!window.confirm('Cancel this order? Stock will be restored.')) return;
        try {
            await api.put(`/orders/${orderId}/cancel`);
            toast.success('Order cancelled');
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot cancel this order');
        }
    };

    const downloadInvoice = async (orderId, orderNumber) => {
        try {
            const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Invoice not available');
        }
    };

    const getStatusStep = (status) => statusSteps.indexOf(status);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-purple-600" /> My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-500 mb-2">No orders yet</h2>
                    <p className="text-gray-400 mb-6">Start shopping to see your orders here!</p>
                    <Link to="/products" className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition">Browse Products</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const isExpanded = expandedId === order._id;
                        const canCancel = ['pending', 'confirmed'].includes(order.status);
                        const isPaid = order.paymentInfo?.status === 'paid';
                        const currentStep = getStatusStep(order.status);

                        return (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order._id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:block">
                                            {order.items.length > 0 && order.items[0].image ? (
                                                <img src={order.items[0].image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center"><FiPackage className="w-6 h-6 text-gray-400" /></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || statusColors.pending}`}>
                                            {order.status}
                                        </span>
                                        <p className="font-bold text-gray-900 hidden sm:block">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                        {isExpanded ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 px-4 pb-4">
                                        {/* Status Tracker */}
                                        {order.status !== 'cancelled' && order.status !== 'returned' && (
                                            <div className="py-4">
                                                <div className="flex items-center justify-between">
                                                    {statusSteps.map((step, i) => (
                                                        <div key={step} className="flex flex-col items-center flex-1">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${i <= currentStep ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                                                {i <= currentStep ? <FiCheckCircle className="w-4 h-4" /> : i + 1}
                                                            </div>
                                                            <p className={`text-[10px] mt-1 capitalize ${i <= currentStep ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>{step}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="relative mt-[-37px] mx-4 h-0.5 bg-gray-200 z-0">
                                                    <div className="h-full bg-purple-600 transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div className="space-y-2 mt-2">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 text-sm border-b border-gray-50 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />}
                                                        <div>
                                                            <p className="font-medium text-gray-800">{item.title}</p>
                                                            <p className="text-xs text-gray-400">{item.size && `Size: ${item.size} · `}Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Summary */}
                                        <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.itemsTotal?.toLocaleString('en-IN')}</span></div>
                                            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount {order.couponUsed && `(${order.couponUsed})`}</span><span>-₹{order.discount}</span></div>}
                                            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span></div>
                                            <hr className="my-1" />
                                            <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between text-xs"><span>Payment</span><span className={isPaid ? 'text-green-600 font-semibold' : 'text-yellow-600'}>{isPaid ? '✓ Paid' : order.paymentInfo?.method === 'cod' ? 'COD' : '⏳ Pending'}</span></div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={() => downloadInvoice(order._id, order.orderNumber)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
                                                <FiDownload className="w-3.5 h-3.5" /> Invoice
                                            </button>
                                            {order.trackingInfo?.trackingUrl && (
                                                <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition">
                                                    <FiTruck className="w-3.5 h-3.5" /> Track
                                                </a>
                                            )}
                                            {canCancel && (
                                                <button onClick={() => cancelOrder(order._id)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition ml-auto">
                                                    <FiXCircle className="w-3.5 h-3.5" /> Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
