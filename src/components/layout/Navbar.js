// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCartContext } from '../../contexts/CartContext';
import {
    FiShoppingCart, FiUser, FiSearch, FiMenu, FiX,
    FiHeart, FiPackage, FiLogOut, FiGrid, FiHome
} from 'react-icons/fi';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { getTotalItems } = useCartContext();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const totalItems = getTotalItems();

    return (
        <header className="w-full fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/images/logo.svg" className="w-8 h-8 rounded-full object-cover" alt="AURA Maniac" />
                        <span className="text-xl font-extrabold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                            AURA Maniac
                        </span>
                    </Link>

                    {/* Desktop search */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent focus:border-purple-300 transition"
                            />
                        </div>
                    </form>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition">
                            Home
                        </Link>
                        <Link to="/products" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition">
                            Shop
                        </Link>
                        <Link to="/vibecheck" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition">
                            VibeCheck
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 transition">
                            <FiShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>

                        {/* User menu */}
                        {isAuthenticated ? (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition text-sm font-medium"
                                >
                                    <FiUser className="w-4 h-4" />
                                    <span className="max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                            <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
                                                <FiHome className="w-4 h-4" /> Dashboard
                                            </Link>
                                            <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
                                                <FiPackage className="w-4 h-4" /> My Orders
                                            </Link>
                                            <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
                                                <FiHeart className="w-4 h-4" /> Wishlist
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition">
                                                    <FiGrid className="w-4 h-4" /> Admin Panel
                                                </Link>
                                            )}
                                            <hr className="my-1 border-gray-100" />
                                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                                                <FiLogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition shadow-md">
                                Sign In
                            </Link>
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <div className="flex items-center gap-3 md:hidden">
                        <Link to="/cart" className="relative p-2 text-gray-700">
                            <FiShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-700 hover:text-purple-600 transition"
                        >
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
                    <div className="px-4 py-3">
                        <form onSubmit={handleSearch} className="mb-3">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                        </form>

                        <div className="space-y-1">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition">Home</Link>
                            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition">Shop</Link>
                            <Link to="/vibecheck" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition">VibeCheck</Link>

                            {isAuthenticated ? (
                                <>
                                    <hr className="my-2 border-gray-100" />
                                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 rounded-lg transition">Dashboard</Link>
                                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 rounded-lg transition">My Orders</Link>
                                    <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 rounded-lg transition">Wishlist</Link>
                                    {isAdmin && (
                                        <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-orange-600 hover:bg-orange-50 rounded-lg transition">Admin Panel</Link>
                                    )}
                                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition">Logout</button>
                                </>
                            ) : (
                                <div className="pt-3">
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold">
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
