// server/controllers/authController.js
const crypto = require('crypto');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { sendWelcomeEmail, sendPasswordReset } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return ApiResponse.error(res, 'Email already registered', 400);
        }

        const user = await User.create({ name, email, password, phone });
        const token = user.getSignedJwtToken();

        // Send welcome email (async, don't block response)
        sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message));

        return ApiResponse.created(res, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, 'Registration successful');
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return ApiResponse.error(res, 'Invalid email or password', 401);
        }

        if (!user.isActive) {
            return ApiResponse.error(res, 'Account has been deactivated. Contact support.', 401);
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return ApiResponse.error(res, 'Invalid email or password', 401);
        }

        const token = user.getSignedJwtToken();

        return ApiResponse.success(res, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist', 'title price images');
        return ApiResponse.success(res, { user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user.id, updateData, {
            new: true,
            runValidators: true
        });

        return ApiResponse.success(res, { user }, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/v1/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return ApiResponse.error(res, 'Current password is incorrect', 400);
        }

        user.password = newPassword;
        await user.save();

        const token = user.getSignedJwtToken();
        return ApiResponse.success(res, { token }, 'Password updated successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return ApiResponse.error(res, 'No user found with that email', 404);
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendPasswordReset(user, resetUrl);

        return ApiResponse.success(res, null, 'Password reset email sent');
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return ApiResponse.error(res, 'Invalid or expired reset token', 400);
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = user.getSignedJwtToken();
        return ApiResponse.success(res, { token }, 'Password reset successful');
    } catch (error) {
        next(error);
    }
};

// @desc    Add address
// @route   POST /api/v1/auth/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // If this is set as default, unset other defaults
        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // If first address, make it default
        if (user.addresses.length === 0) {
            req.body.isDefault = true;
        }

        user.addresses.push(req.body);
        await user.save();

        return ApiResponse.success(res, { addresses: user.addresses }, 'Address added successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Update address
// @route   PUT /api/v1/auth/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const address = user.addresses.id(req.params.addressId);

        if (!address) {
            return ApiResponse.error(res, 'Address not found', 404);
        }

        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        Object.assign(address, req.body);
        await user.save();

        return ApiResponse.success(res, { addresses: user.addresses }, 'Address updated');
    } catch (error) {
        next(error);
    }
};

// @desc    Delete address
// @route   DELETE /api/v1/auth/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );
        await user.save();

        return ApiResponse.success(res, { addresses: user.addresses }, 'Address deleted');
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle wishlist item
// @route   POST /api/v1/auth/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;

        const index = user.wishlist.indexOf(productId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        const populatedUser = await User.findById(req.user.id).populate('wishlist', 'title price images stock');

        return ApiResponse.success(res, { wishlist: populatedUser.wishlist },
            index > -1 ? 'Removed from wishlist' : 'Added to wishlist'
        );
    } catch (error) {
        next(error);
    }
};
