// src/components/admin/AdminLayout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiGrid, FiBox, FiShoppingBag, FiUsers, FiTag, FiPercent,
    FiStar, FiSettings, FiLogOut, FiMenu, FiX, FiChevronLeft,
    FiHome, FiCreditCard
} from 'react-icons/fi';

const navItems = [
    { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: FiBox, label: 'Products' },
    { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/categories', icon: FiTag, label: 'Categories' },
    { to: '/admin/coupons', icon: FiPercent, label: 'Coupons' },
    { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { to: '/admin/payments', icon: FiCreditCard, label: 'Payments' },
    { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} h-full`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
                        <span className="text-lg font-bold">AURA Maniac</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-slate-700 rounded">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-slate-700 space-y-1 shrink-0">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <FiHome className="w-5 h-5" />
                        <span>Back to Store</span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                            <FiMenu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {(user?.name || 'A')[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


export default AdminLayout;
