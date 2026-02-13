// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        success: false,
        message: 'Too many requests, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for auth routes (login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many auth attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter };

// Payment limiter (slightly stricter)
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many payment requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter, paymentLimiter };
