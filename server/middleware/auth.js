// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return ApiResponse.error(res, 'Not authorized to access this route', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return ApiResponse.error(res, 'User not found', 401);
        }
        if (!req.user.isActive) {
            return ApiResponse.error(res, 'Account has been deactivated', 401);
        }
        next();
    } catch (error) {
        return ApiResponse.error(res, 'Not authorized, token is invalid', 401);
    }
};

// Authorize by role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return ApiResponse.error(res, `Role '${req.user.role}' is not authorized to access this route`, 403);
        }
        next();
    };
};

// Optional auth - don't fail if no token, just attach user if present
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (error) {
            // Token invalid, continue without user
        }
    }
    next();
};

module.exports = { protect, authorize, optionalAuth };
