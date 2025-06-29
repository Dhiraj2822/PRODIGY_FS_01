const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireAdminOrModerator } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Get all users - Allow both admin and moderator access
router.get('/users', requireAdminOrModerator, async (req, res) => {
  try {
    console.log(`User ${req.user.email} (${req.user.role}) requesting user list`);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Increased limit for better UX
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find()
      .select('-password -loginAttempts -lockUntil')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments();

    console.log(`Found ${users.length} users for ${req.user.role}`);

    res.json({
      success: true,
      users: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers: totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user by ID - Allow both admin and moderator access
router.get('/users/:id', requireAdminOrModerator, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -loginAttempts -lockUntil');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user role - Different permissions for admin vs moderator
router.put('/users/:id/role', requireAdminOrModerator, [
  body('role')
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be one of: user, admin, moderator')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const userId = req.params.id;

    console.log(`${req.user.email} (${req.user.role}) attempting to change user ${userId} role to ${role}`);

    // Prevent users from changing their own role
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Get the target user first
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions based on user role
    if (req.user.role === 'moderator') {
      // Moderators can only assign 'user' or 'moderator' roles
      if (role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Moderators cannot assign admin roles'
        });
      }
      
      // Moderators cannot modify admin users
      if (targetUser.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Moderators cannot modify admin users'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil');

    console.log(`Successfully updated user ${user.email} role to ${role}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: user
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Activate/Deactivate user - Admin only
router.put('/users/:id/status', requireAdmin, [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isActive } = req.body;
    const userId = req.params.id;

    // Prevent admin from deactivating their own account
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete user - Admin only
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting their own account
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get system statistics - Allow both admin and moderator access
router.get('/stats', requireAdminOrModerator, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        moderatorUsers,
        regularUsers,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;