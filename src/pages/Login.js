// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-300">Sign in to your AURA Maniac account</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-1">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center text-gray-300">
                                <input type="checkbox" className="mr-2 rounded" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 transition">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-300 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-400 font-semibold hover:text-purple-300 transition">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
