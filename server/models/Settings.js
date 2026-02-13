// server/models/Settings.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    image: String,
    link: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'AURA Maniac'
    },
    tagline: {
        type: String,
        default: 'Unleash Your Style.'
    },
    logo: {
        type: String,
        default: '/images/logo.svg'
    },
    favicon: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: 'contact@auramaniac.com'
    },
    contactPhone: {
        type: String,
        default: '+91 95427 84604'
    },
    address: {
        type: String,
        default: ''
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        youtube: { type: String, default: '' }
    },
    banners: [bannerSchema],
    homepageSections: {
        heroTitle: { type: String, default: 'Fresh Fashion Finds' },
        heroSubtitle: { type: String, default: 'New Collection' },
        heroCta: { type: String, default: 'Unleash Your Style.' },
        showFeatured: { type: Boolean, default: true },
        showTrending: { type: Boolean, default: true },
        showCategories: { type: Boolean, default: true },
        showTestimonials: { type: Boolean, default: true },
        showNewsletter: { type: Boolean, default: true }
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    freeShippingAbove: {
        type: Number,
        default: 999
    },
    currency: {
        type: String,
        default: 'INR'
    },
    currencySymbol: {
        type: String,
        default: '₹'
    },
    // Tax & Company
    companyName: { type: String, default: 'AURA Maniac Fashions Pvt. Ltd.' },
    companyAddress: { type: String, default: 'Hyderabad, Telangana — 500081' },
    gstNumber: { type: String, default: '36AAECV0000A1Z0' },
    taxRate: { type: Number, default: 18 },
    taxInclusive: { type: Boolean, default: true },
    taxLabel: { type: String, default: 'GST' },
    // Multi-currency
    supportedCurrencies: [{ code: String, symbol: String, rate: Number }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
