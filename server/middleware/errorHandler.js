// server/middleware/errorHandler.js
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    let message = err.message || 'Server Error';
    let statusCode = err.statusCode || 500;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for '${field}'. This ${field} already exists.`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        message = messages.join('. ');
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
