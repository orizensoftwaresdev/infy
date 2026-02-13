// src/pages/admin/AdminReviews.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reviews', { params: { page, limit: 20 } });
            setReviews(res.data.data);
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const moderate = async (id, isApproved) => {
        try {
            await api.put(`/admin/reviews/${id}`, { isApproved });
            toast.success(isApproved ? 'Review approved' : 'Review rejected');
            fetchReviews();
        } catch (err) {
            toast.error('Failed to update review');
        }
    };

    const renderStars = (rating) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <FiStar key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
                <p className="text-gray-500 text-sm">{pagination.total || 0} total reviews</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Customer</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Rating</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Comment</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[180px]">{review.product?.title || 'Deleted Product'}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{review.user?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3">{renderStars(review.rating)}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                        <p className="truncate max-w-[250px]">{review.comment || '—'}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {review.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {!review.isApproved && (
                                                <button onClick={() => moderate(review._id, true)} className="p-2 hover:bg-green-50 rounded-lg transition" title="Approve">
                                                    <FiCheck className="w-4 h-4 text-green-600" />
                                                </button>
                                            )}
                                            {review.isApproved && (
                                                <button onClick={() => moderate(review._id, false)} className="p-2 hover:bg-red-50 rounded-lg transition" title="Reject">
                                                    <FiX className="w-4 h-4 text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400">No reviews yet</td></tr>}
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
        </div>
    );
};

export default AdminReviews;
