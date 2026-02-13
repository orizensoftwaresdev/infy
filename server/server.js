// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// Security: NoSQL injection, XSS, HPP
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Serve static files (product images etc.)
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentLimiter, paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'VibePick API is running', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
    });
}

// Error handler (must be last middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AURA Maniac Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
