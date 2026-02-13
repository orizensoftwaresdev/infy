// src/pages/admin/AdminPayments.js
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FiCreditCard, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/payments', { params: { page, limit: 15 } });
                setPayments(res.data.data);
                setPagination(res.data.pagination || {});
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [page]);

    const statusIcon = (status) => {
        switch (status) {
            case 'captured': case 'paid': return <FiCheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <FiXCircle className="w-4 h-4 text-red-500" />;
            default: return <FiClock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case 'captured': case 'paid': return 'bg-green-100 text-green-700';
            case 'failed': return 'bg-red-100 text-red-700';
            case 'refunded': return 'bg-gray-100 text-gray-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    if (loading) return <Loader text="Loading payments..." />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FiCreditCard className="text-purple-600" /> Payment Logs</h1>
                <p className="text-gray-500 text-sm mt-1">Track all payment transactions</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-gray-500 font-medium">Payment ID</th>
                                <th className="text-left px-5 py-3 text-gray-500 font-medium">Order</th>
                                <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                                <th className="text-right px-5 py-3 text-gray-500 font-medium">Amount</th>
                                <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                                <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length > 0 ? payments.map(p => (
                                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{p.razorpayPaymentId || 'N/A'}</td>
                                    <td className="px-5 py-3 font-medium text-gray-800">#{p.order?.orderNumber || 'N/A'}</td>
                                    <td className="px-5 py-3 text-gray-600">{p.user?.name || 'N/A'}</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">₹{(p.amount / 100)?.toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(p.status)}`}>
                                            {statusIcon(p.status)} {p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-400">No payment records yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Prev</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPayments;
