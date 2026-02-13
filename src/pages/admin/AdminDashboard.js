// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiClock, FiAlertTriangle, FiTrendingUp, FiCreditCard, FiPieChart } from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7'];

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dashRes, analyticsRes] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/admin/analytics').catch(() => ({ data: { data: null } }))
                ]);
                setData(dashRes.data.data);
                setAnalytics(analyticsRes.data.data);
            } catch (err) {
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <Loader text="Loading dashboard..." />;
    if (!data) return <div className="text-center py-12 text-gray-500">Failed to load dashboard data</div>;

    const { stats, monthlySales, recentOrders, lowStockProducts } = data;

    const chartData = monthlySales.map(m => ({
        name: `${months[m._id.month - 1]} ${m._id.year}`,
        sales: m.sales,
        orders: m.orders
    }));

    const statCards = [
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'from-green-500 to-emerald-600' },
        { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingBag, color: 'from-blue-500 to-indigo-600' },
        { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'from-purple-500 to-violet-600' },
        { label: 'Total Products', value: stats.totalProducts, icon: FiBox, color: 'from-orange-500 to-amber-600' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: FiClock, color: 'from-yellow-500 to-yellow-600' },
        { label: 'Low Stock', value: lowStockProducts?.length || 0, icon: FiAlertTriangle, color: 'from-red-500 to-rose-600' },
    ];

    // Analytics data
    const orderStatusData = analytics?.orderStatusStats?.map(s => ({ name: s._id || 'unknown', value: s.count })) || [];
    const paymentMethodData = analytics?.paymentMethodStats?.map(s => ({
        name: s._id === 'cod' ? 'Cash on Delivery' : s._id === 'razorpay' ? 'Razorpay' : (s._id || 'Other'),
        orders: s.count,
        revenue: s.total
    })) || [];
    const topProducts = analytics?.topProducts || [];
    const revenueByCategory = analytics?.revenueByCategory || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your store overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><FiTrendingUp className="text-purple-600" /> Monthly Sales</h2>
                </div>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value, name) => [name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value, name === 'sales' ? 'Revenue' : 'Orders']}
                            />
                            <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        <p>No sales data yet. Sales will appear here once orders are placed.</p>
                    </div>
                )}
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiPieChart className="text-indigo-600" /> Order Status</h2>
                    {orderStatusData.length > 0 ? (
                        <div className="flex items-center">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {orderStatusData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-gray-600 capitalize flex-1">{item.name}</span>
                                        <span className="font-semibold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <p className="text-gray-400 text-center py-8">No order data yet</p>}
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiCreditCard className="text-green-600" /> Payment Methods</h2>
                    {paymentMethodData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={paymentMethodData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    formatter={(val, name) => [name === 'revenue' ? `₹${val.toLocaleString('en-IN')}` : val, name === 'revenue' ? 'Revenue' : 'Orders']} />
                                <Legend />
                                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-center py-8">No payment data yet</p>}
                </div>
            </div>

            {/* Top Products & Revenue by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-5 pb-3">
                        <h2 className="text-lg font-semibold text-gray-900">🏆 Top Products</h2>
                        <Link to="/admin/products" className="text-sm text-purple-600 hover:text-purple-800 font-medium">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-t border-gray-100">
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                                    <th className="text-center px-3 py-3 text-gray-500 font-medium">Sold</th>
                                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.length > 0 ? topProducts.slice(0, 5).map((p, i) => (
                                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {p.image ? <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100" /> :
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">{i + 1}</div>}
                                                <span className="font-medium text-gray-800 truncate max-w-[150px]">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">{p.totalSold}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-800">₹{p.revenue?.toLocaleString('en-IN')}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-5 py-8 text-center text-gray-400">No sales data yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Revenue by Category */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-5 pb-3">
                        <h2 className="text-lg font-semibold text-gray-900">📊 Revenue by Category</h2>
                        <Link to="/admin/categories" className="text-sm text-purple-600 hover:text-purple-800 font-medium">View All</Link>
                    </div>
                    <div className="px-5 pb-4">
                        {revenueByCategory.length > 0 ? revenueByCategory.slice(0, 6).map((cat, i) => {
                            const maxRevenue = Math.max(...revenueByCategory.map(c => c.revenue));
                            const pct = maxRevenue > 0 ? (cat.revenue / maxRevenue) * 100 : 0;
                            return (
                                <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-gray-900">₹{cat.revenue?.toLocaleString('en-IN')}</span>
                                            <span className="text-xs text-gray-400 ml-2">({cat.count} sold)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    </div>
                                </div>
                            );
                        }) : <p className="text-gray-400 text-center py-8">No category data yet</p>}
                    </div>
                </div>
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-5 pb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-sm text-purple-600 hover:text-purple-800 font-medium">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-t border-gray-100">
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Order</th>
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Amount</th>
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders?.length > 0 ? recentOrders.map(order => (
                                    <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-5 py-3 font-medium text-gray-800">#{order.orderNumber}</td>
                                        <td className="px-5 py-3 text-gray-600">{order.user?.name || 'N/A'}</td>
                                        <td className="px-5 py-3 text-gray-800">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                        <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-5 pb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                        <Link to="/admin/products" className="text-sm text-purple-600 hover:text-purple-800 font-medium">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-t border-gray-100">
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">SKU</th>
                                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts?.length > 0 ? lowStockProducts.map(p => (
                                    <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-5 py-3 font-medium text-gray-800 truncate max-w-[200px]">{p.title}</td>
                                        <td className="px-5 py-3 text-gray-500">{p.sku}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {p.stock} left
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-5 py-8 text-center text-gray-400">All products well stocked ✅</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        returned: 'bg-gray-100 text-gray-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

export default AdminDashboard;
