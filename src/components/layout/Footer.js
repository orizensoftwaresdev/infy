// src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/images/logo.svg" className="w-8 h-8 rounded-full object-cover" alt="AURA Maniac" />
                            <span className="text-xl font-extrabold text-white">AURA Maniac</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Unleash Your Style. Premium fashion curated for your body type, occasion, and personal vibe.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-purple-600 transition" aria-label="Instagram"><FiInstagram className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-purple-600 transition" aria-label="Facebook"><FiFacebook className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-purple-600 transition" aria-label="Twitter"><FiTwitter className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-purple-600 transition" aria-label="YouTube"><FiYoutube className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/products" className="hover:text-purple-400 transition">Shop All</Link></li>
                            <li><Link to="/vibecheck" className="hover:text-purple-400 transition">VibeCheck</Link></li>
                            <li><Link to="/products?category=women" className="hover:text-purple-400 transition">Women</Link></li>
                            <li><Link to="/products?category=men" className="hover:text-purple-400 transition">Men</Link></li>
                            <li><Link to="/products?featured=true" className="hover:text-purple-400 transition">Featured</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">My Account</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/login" className="hover:text-purple-400 transition">Login / Register</Link></li>
                            <li><Link to="/cart" className="hover:text-purple-400 transition">Cart</Link></li>
                            <li><Link to="/orders" className="hover:text-purple-400 transition">Order History</Link></li>
                            <li><Link to="/wishlist" className="hover:text-purple-400 transition">Wishlist</Link></li>
                            <li><Link to="/dashboard" className="hover:text-purple-400 transition">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <FiMail className="w-4 h-4 text-purple-400" />
                                <span>contact@auramaniac.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FiPhone className="w-4 h-4 text-purple-400" />
                                <span>+91 95427 84604</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <FiMapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                                <span>Mumbai, Maharashtra, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} AURA Maniac. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
