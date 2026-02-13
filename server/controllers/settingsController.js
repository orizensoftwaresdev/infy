// server/controllers/settingsController.js
const Settings = require('../models/Settings');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get site settings
// @route   GET /api/v1/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        return ApiResponse.success(res, { settings });
    } catch (error) {
        next(error);
    }
};

// @desc    Update site settings (Admin)
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        return ApiResponse.success(res, { settings }, 'Settings updated successfully');
    } catch (error) {
        next(error);
    }
};
