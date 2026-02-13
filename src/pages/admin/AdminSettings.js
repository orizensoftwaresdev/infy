// src/pages/admin/AdminSettings.js
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiSettings, FiSave, FiDollarSign, FiTruck, FiFileText } from 'react-icons/fi';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/settings');
                setSettings(res.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', settings);
            toast.success('Settings saved!');
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader text="Loading settings..." />;
    if (!settings) return <div className="text-center py-12 text-gray-500">Failed to load settings</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FiSettings className="text-purple-600" /> Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your store configuration</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50">
                    <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Store Info */}
            <Section title="Store Information" icon={<FiSettings className="text-purple-600" />}>
                <Field label="Site Name" name="siteName" value={settings.siteName} onChange={handleChange} />
                <Field label="Contact Email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
                <Field label="Contact Phone" name="contactPhone" value={settings.contactPhone} onChange={handleChange} />
            </Section>

            {/* Shipping */}
            <Section title="Shipping" icon={<FiTruck className="text-blue-600" />}>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Shipping Charge (₹)" name="shippingCharge" type="number" value={settings.shippingCharge} onChange={handleChange} />
                    <Field label="Free Shipping Above (₹)" name="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleChange} />
                </div>
            </Section>

            {/* Tax & Company */}
            <Section title="Tax & Company" icon={<FiFileText className="text-green-600" />}>
                <Field label="Company Name" name="companyName" value={settings.companyName} onChange={handleChange} />
                <Field label="Company Address" name="companyAddress" value={settings.companyAddress} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                    <Field label="GST Number" name="gstNumber" value={settings.gstNumber} onChange={handleChange} />
                    <Field label="Tax Rate (%)" name="taxRate" type="number" value={settings.taxRate} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Tax Label" name="taxLabel" value={settings.taxLabel} onChange={handleChange} />
                    <div className="flex items-center gap-2 pt-6">
                        <input type="checkbox" name="taxInclusive" checked={settings.taxInclusive || false} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded" />
                        <label className="text-sm text-gray-700">Tax inclusive in prices</label>
                    </div>
                </div>
            </Section>

            {/* Currency */}
            <Section title="Currency" icon={<FiDollarSign className="text-amber-600" />}>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Currency Code" name="currency" value={settings.currency} onChange={handleChange} />
                    <Field label="Currency Symbol" name="currencySymbol" value={settings.currencySymbol} onChange={handleChange} />
                </div>
            </Section>
        </div>
    );
};

const Section = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">{icon} {title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);

const Field = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type={type} name={name} value={value || ''} onChange={onChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
    </div>
);

export default AdminSettings;
