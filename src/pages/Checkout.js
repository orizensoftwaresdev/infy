// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Loader from '../components/common/Loader';
import { FiMapPin, FiCreditCard, FiTag, FiTruck, FiShoppingBag, FiX, FiCheck } from 'react-icons/fi';

const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [cart, setCart] = useState(null);
    const [settings, setSettings] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cartRes, settingsRes] = await Promise.all([
                    api.get('/cart'),
                    api.get('/settings')
                ]);

                const cartData = cartRes.data.data.cart || cartRes.data.data;

                if (!cartData || !cartData.items || cartData.items.length === 0) {
                    toast.warn('Your cart is empty');
                    navigate('/cart');
                    return;
                }
                setCart(cartData);

                const settingsData = settingsRes.data.data.settings || settingsRes.data.data;
                setSettings(settingsData);
            } catch (err) {
                toast.error('Failed to load checkout data');
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const itemsTotal = cart?.items?.reduce((sum, item) => {
        const price = item.product?.offerPrice || item.product?.price || 0;
        return sum + price * item.quantity;
    }, 0) || 0;

    const shippingCharge = settings?.freeShippingAbove && itemsTotal >= settings.freeShippingAbove ? 0 : (settings?.shippingCharge || 0);
    const totalAmount = itemsTotal - discount + shippingCharge;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await api.post('/coupons/validate', { code: couponCode, cartTotal: itemsTotal });
            const d = res.data.data;
            setDiscount(d.discount);
            setCouponApplied(d.coupon);
            toast.success(`Coupon applied! ₹${d.discount} off`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
            setDiscount(0);
            setCouponApplied(null);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setDiscount(0);
        setCouponApplied(null);
    };

    const validateAddress = () => {
        const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
        for (const field of required) {
            if (!address[field]?.trim()) {
                toast.warn(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
        if (!/^\d{10}$/.test(address.phone)) {
            toast.warn('Enter a valid 10-digit phone number');
            return false;
        }
        if (!/^\d{6}$/.test(address.pincode)) {
            toast.warn('Enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const placeOrder = async () => {
        if (!validateAddress()) return;
        setPlacing(true);
        try {
            // Step 1: Create order in backend
            const orderRes = await api.post('/orders', {
                shippingAddress: address,
                couponCode: couponApplied?.code || '',
                paymentMethod
            });
            const order = orderRes.data.data.order;

            if (paymentMethod === 'cod') {
                toast.success('Order placed! Pay on delivery.');
                navigate(`/order-confirmation/${order._id}`);
                return;
            }

            // Step 2: Create Razorpay order
            const payRes = await api.post('/payments/create-order', { orderId: order._id });
            const payData = payRes.data.data;

            // Step 3: Open Razorpay checkout
            const options = {
                key: payData.keyId,
                amount: payData.amount,
                currency: payData.currency,
                name: 'AURA Maniac',
                description: `Order #${order.orderNumber}`,
                order_id: payData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // Step 4: Verify payment
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        toast.success('Payment successful!');
                        navigate(`/order-confirmation/${order._id}`);
                    } catch (err) {
                        toast.error('Payment verification failed. Contact support.');
                        navigate(`/order-confirmation/${order._id}`);
                    }
                },
                prefill: {
                    name: user?.name || address.fullName,
                    email: user?.email || '',
                    contact: address.phone
                },
                theme: { color: '#7c3aed' },
                modal: {
                    ondismiss: function () {
                        toast.info('Payment cancelled. Your order is saved — pay from My Orders.');
                        navigate(`/order-confirmation/${order._id}`);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-purple-600" /> Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Address + Payment */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FiMapPin className="text-purple-500" /> Shipping Address
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input type="text" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input type="tel" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="10-digit mobile"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" maxLength={10} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                                <input type="text" value={address.addressLine1} onChange={e => setAddress(a => ({ ...a, addressLine1: e.target.value }))} placeholder="House/Flat No., Street"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                <input type="text" value={address.addressLine2} onChange={e => setAddress(a => ({ ...a, addressLine2: e.target.value }))} placeholder="Landmark, Area"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input type="text" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <select value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">Select state</option>
                                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                                <input type="text" value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} maxLength={6}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FiCreditCard className="text-purple-500" /> Payment Method
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'razorpay' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="text-purple-600" />
                                <div>
                                    <p className="font-semibold text-gray-900">Pay Online</p>
                                    <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets</p>
                                </div>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-purple-600" />
                                <div>
                                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                                    <p className="text-xs text-gray-500">Pay when you receive</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                        {/* Items */}
                        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                            {cart?.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <img src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'} alt={item.product?.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{item.product?.title}</p>
                                        <p className="text-xs text-gray-500">{item.size && `Size: ${item.size} · `}Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 flex-shrink-0">₹{((item.product?.offerPrice || item.product?.price) * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>

                        <hr className="my-4" />

                        {/* Coupon */}
                        {!couponApplied ? (
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <button onClick={applyCoupon} className="px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition flex-shrink-0">Apply</button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                                <span className="flex items-center gap-1"><FiCheck className="w-4 h-4" /> <strong>{couponApplied.code}</strong> applied</span>
                                <button onClick={removeCoupon}><FiX className="w-4 h-4 hover:text-red-500" /></button>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600"><span>Subtotal ({cart?.items?.length} items)</span><span>₹{itemsTotal.toLocaleString('en-IN')}</span></div>
                            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
                            <div className="flex justify-between text-gray-600">
                                <span className="flex items-center gap-1"><FiTruck className="w-3.5 h-3.5" /> Shipping</span>
                                <span>{shippingCharge === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shippingCharge}`}</span>
                            </div>
                            {shippingCharge === 0 && settings?.freeShippingAbove && (
                                <p className="text-xs text-green-600">🎉 Free shipping on orders above ₹{settings.freeShippingAbove}</p>
                            )}
                            <hr className="my-2" />
                            <div className="flex justify-between text-lg font-bold text-gray-900"><span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>
                        </div>

                        <button onClick={placeOrder} disabled={placing}
                            className="w-full mt-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-60 text-base">
                            {placing ? 'Processing...' : paymentMethod === 'razorpay' ? `Pay ₹${totalAmount.toLocaleString('en-IN')}` : `Place COD Order — ₹${totalAmount.toLocaleString('en-IN')}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
