// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        const result = await register(formData.name, formData.email, formData.password, formData.phone);
        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    const fields = [
        { name: 'name', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'John Doe', required: true },
        { name: 'email', label: 'Email', type: 'email', icon: FiMail, placeholder: 'you@example.com', required: true },
        { name: 'phone', label: 'Phone (optional)', type: 'tel', icon: FiPhone, placeholder: '+91 9876543210' },
        { name: 'password', label: 'Password', type: 'password', icon: FiLock, placeholder: '••••••••', required: true },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: FiLock, placeholder: '••••••••', required: true }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">Create Account</h1>
                    <p className="text-gray-300">Join AURA Maniac and start shopping</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-200 mb-1">{field.label}</label>
                                <div className="relative">
                                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                    {field.type === 'password' && field.name === 'password' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-300 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
