// src/pages/admin/AdminProductForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { FiSave, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '+Size', 'Free Size'];
const bodyTypes = ['Pear', 'Rectangle', 'Hourglass', 'Apple', 'Inverted Triangle', 'Slim Build', 'Muscular Build', 'Broader Build'];
const occasions = ['Party', 'Casual', 'Traditional', 'Professional', 'Travel', 'Fitness', 'Date Night', 'Festivals', 'Weddings'];

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        title: '', description: '', price: '', offerPrice: '', category: '', subcategory: '',
        brand: '', sku: '', stock: '10', sizes: [], bodyType: [], occasion: [],
        isFeatured: false, isTrending: false, images: [{ url: '', alt: '' }]
    });

    useEffect(() => {
        const load = async () => {
            try {
                const catRes = await api.get('/categories');
                setCategories(catRes.data.data);
                if (isEdit) {
                    const res = await api.get(`/products/${id}`);
                    const p = res.data.data.product || res.data.data;
                    setForm({
                        title: p.title || '', description: p.description || '',
                        price: p.price || '', offerPrice: p.offerPrice || '',
                        category: p.category?._id || p.category || '', subcategory: p.subcategory || '',
                        brand: p.brand || '', sku: p.sku || '', stock: p.stock || 0,
                        sizes: p.sizes || [], bodyType: p.bodyType || [], occasion: p.occasion || [],
                        isFeatured: p.isFeatured || false, isTrending: p.isTrending || false,
                        images: p.images?.length > 0 ? p.images : [{ url: '', alt: '' }]
                    });
                }
            } catch (err) {
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const toggleArrayField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value]
        }));
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...form.images];
        newImages[index] = { ...newImages[index], [field]: value };
        setForm(prev => ({ ...prev, images: newImages }));
    };

    const addImage = () => setForm(prev => ({ ...prev, images: [...prev.images, { url: '', alt: '' }] }));
    const removeImage = (index) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.price || !form.category || !form.brand) {
            toast.warn('Please fill required fields');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
                stock: Number(form.stock),
                images: form.images.filter(img => img.url)
            };
            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                toast.success('Product updated!');
            } else {
                await api.post('/products', payload);
                toast.success('Product created!');
            }
            navigate('/admin/products');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader text="Loading product..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                            <input type="text" value={form.brand} onChange={e => handleChange('brand', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input type="text" value={form.sku} onChange={e => handleChange('sku', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                            <input type="text" value={form.subcategory} onChange={e => handleChange('subcategory', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Pricing & Stock</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                            <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (₹)</label>
                            <input type="number" value={form.offerPrice} onChange={e => handleChange('offerPrice', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                            <input type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required min="0" />
                        </div>
                    </div>
                </div>

                {/* Sizes */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Sizes</h2>
                    <div className="flex flex-wrap gap-2">
                        {sizeOptions.map(size => (
                            <button key={size} type="button" onClick={() => toggleArrayField('sizes', size)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${form.sizes.includes(size) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'}`}>
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body Type & Occasion */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Body Type & Occasion</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Body Types</label>
                        <div className="flex flex-wrap gap-2">
                            {bodyTypes.map(bt => (
                                <button key={bt} type="button" onClick={() => toggleArrayField('bodyType', bt)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${form.bodyType.includes(bt) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                                    {bt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Occasions</label>
                        <div className="flex flex-wrap gap-2">
                            {occasions.map(occ => (
                                <button key={occ} type="button" onClick={() => toggleArrayField('occasion', occ)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${form.occasion.includes(occ) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'}`}>
                                    {occ}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                        <button type="button" onClick={addImage} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium">
                            <FiPlus className="w-4 h-4" /> Add Image
                        </button>
                    </div>
                    {form.images.map((img, i) => (
                        <div key={i} className="flex items-center gap-3">
                            {img.url && <img src={img.url} alt="" className="w-12 h-14 object-cover rounded-lg border" />}
                            <input type="text" placeholder="Image URL" value={img.url} onChange={e => handleImageChange(i, 'url', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <input type="text" placeholder="Alt text" value={img.alt} onChange={e => handleImageChange(i, 'alt', e.target.value)} className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hidden sm:block" />
                            {form.images.length > 1 && (
                                <button type="button" onClick={() => removeImage(i)} className="p-2 hover:bg-red-50 rounded-lg"><FiX className="w-4 h-4 text-red-500" /></button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Toggles */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Featured Product</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.isTrending} onChange={e => handleChange('isTrending', e.target.checked)} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Trending Product</span>
                        </label>
                    </div>
                </div>

                {/* Submit - Sticky at bottom */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-xl p-4 -mx-0 shadow-lg flex justify-end gap-3 z-10">
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-md">
                        <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;
