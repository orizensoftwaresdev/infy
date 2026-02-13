// src/pages/OrderConfirmation.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import { FiCheckCircle, FiClock, FiPackage, FiDownload, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const OrderConfirmation = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.data.order);
            } catch (err) {
                navigate('/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const downloadInvoice = async () => {
        try {
            const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            // Invoice might not be available yet
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (!order) return null;

    const isPaid = order.paymentInfo?.status === 'paid';
    const isCod = order.paymentInfo?.method === 'cod';

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${isPaid || isCod ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {isPaid || isCod ? <FiCheckCircle className="w-10 h-10 text-green-600" /> : <FiClock className="w-10 h-10 text-yellow-600" />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isPaid ? 'Payment Successful!' : isCod ? 'Order Placed!' : 'Order Created'}
                </h1>
                <p className="text-gray-500">
                    {isPaid ? 'Your payment has been confirmed.' : isCod ? 'Pay when your order arrives.' : 'Complete payment to confirm your order.'}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Order Info */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Order Number</p>
                            <p className="text-xl font-bold">#{order.orderNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-purple-100 text-sm">Total Amount</p>
                            <p className="text-xl font-bold">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Payment</p>
                            <p className={`text-sm font-semibold capitalize ${isPaid ? 'text-green-600' : isCod ? 'text-blue-600' : 'text-yellow-600'}`}>
                                {isPaid ? '✓ Paid' : isCod ? '📦 COD' : '⏳ Pending'}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">Status</p>
                            <p className="text-sm font-semibold capitalize text-gray-800">{order.status}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><FiPackage className="w-4 h-4" /> Items</h3>
                        {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 text-sm border-b border-gray-50 last:border-0">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.size && `Size: ${item.size} · `}Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-800 ml-4">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.itemsTotal?.toLocaleString('en-IN')}</span></div>
                        {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount?.toLocaleString('en-IN')}</span></div>}
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span></div>
                        <hr className="my-1" />
                        <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span></div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Shipping To</h3>
                        <p className="text-sm text-gray-600">
                            {order.shippingAddress?.fullName} · {order.shippingAddress?.phone}<br />
                            {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 p-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={downloadInvoice} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition text-sm">
                        <FiDownload className="w-4 h-4" /> Download Invoice
                    </button>
                    <Link to="/orders" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 font-semibold rounded-xl hover:bg-purple-100 transition text-sm">
                        <FiShoppingBag className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/products" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition text-sm shadow-md">
                        Continue Shopping <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
