// backend/routes/subadmin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { superAdminMiddleware, adminMiddleware } = require('../middleware/auth');
const SubAdmin = require('../models/SubAdmin');
const AdminActivity = require('../models/AdminActivity');

// Sub-admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find sub-admin
        const subAdmin = await SubAdmin.findOne({ username });
        if (!subAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (!subAdmin.isActive) {
            return res.status(403).json({ message: 'Account is disabled. Contact administrator.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, subAdmin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: subAdmin._id,
                username: subAdmin.username,
                role: 'subadmin',
                permissions: subAdmin.permissions
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            role: 'subadmin',
            username: subAdmin.username,
            permissions: subAdmin.permissions
        });
    } catch (err) {
        console.error('Sub-admin login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new sub-admin (super admin only)
router.post('/create', superAdminMiddleware, async (req, res) => {
    try {
        console.log('DEBUG: Creating sub-admin. req.admin:', req.admin);
        const { username, password, permissions } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if username already exists
        const existingSubAdmin = await SubAdmin.findOne({ username });
        if (existingSubAdmin) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Get admin ID robustly
        const adminId = req.admin?.adminId || req.admin?.id || req.admin?._id;

        console.log('DEBUG: Extracted adminId:', adminId);

        if (!adminId) {
            console.error('CRITICAL ERROR: Could not determine admin ID from token payload:', req.admin);
            return res.status(500).json({ message: 'Server error: Could not identify creating admin' });
        }

        // Create sub-admin
        const subAdmin = new SubAdmin({
            username,
            password: hashedPassword,
            createdBy: adminId,
            permissions: {
                canEditGroupLinks: permissions?.canEditGroupLinks || false,
                canAdjustBalance: permissions?.canAdjustBalance || false,
                canSetTargetBalance: permissions?.canSetTargetBalance || false,
                canAssignSpecialReviews: permissions?.canAssignSpecialReviews || false,
                canViewWithdrawalHistory: permissions?.canViewWithdrawalHistory || false
            }
        });

        await subAdmin.save();

        res.status(201).json({
            message: 'Sub-admin created successfully',
            subAdmin: {
                _id: subAdmin._id,
                username: subAdmin.username,
                permissions: subAdmin.permissions,
                isActive: subAdmin.isActive,
                createdAt: subAdmin.createdAt
            }
        });
    } catch (err) {
        console.error('Error creating sub-admin:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all sub-admins (super admin only)
router.get('/list', superAdminMiddleware, async (req, res) => {
    try {
        const subAdmins = await SubAdmin.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(subAdmins);
    } catch (err) {
        console.error('Error fetching sub-admins:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get sub-admin details (super admin only)
router.get('/:id', superAdminMiddleware, async (req, res) => {
    try {
        const subAdmin = await SubAdmin.findById(req.params.id).select('-password');

        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        res.json(subAdmin);
    } catch (err) {
        console.error('Error fetching sub-admin details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change sub-admin password (super admin only)
router.post('/:id/change-password', superAdminMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const subAdmin = await SubAdmin.findById(req.params.id);
        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        subAdmin.password = await bcrypt.hash(newPassword, salt);
        await subAdmin.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle sub-admin status (super admin only)
router.post('/:id/toggle-status', superAdminMiddleware, async (req, res) => {
    try {
        const subAdmin = await SubAdmin.findById(req.params.id);

        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        subAdmin.isActive = !subAdmin.isActive;
        await subAdmin.save();

        res.json({
            message: `Sub-admin ${subAdmin.isActive ? 'enabled' : 'disabled'} successfully`,
            isActive: subAdmin.isActive
        });
    } catch (err) {
        console.error('Error toggling sub-admin status:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get activity history for a sub-admin (super admin only)
router.get('/:id/activities', superAdminMiddleware, async (req, res) => {
    try {
        const activities = await AdminActivity.find({ subAdminId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(100); // Limit to last 100 activities

        res.json(activities);
    } catch (err) {
        console.error('Error fetching activities:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update sub-admin permissions (super admin only)
router.put('/:id/permissions', superAdminMiddleware, async (req, res) => {
    try {
        const { permissions } = req.body;

        const subAdmin = await SubAdmin.findById(req.params.id);
        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        subAdmin.permissions = {
            canEditGroupLinks: permissions?.canEditGroupLinks || false,
            canAdjustBalance: permissions?.canAdjustBalance || false,
            canSetTargetBalance: permissions?.canSetTargetBalance || false,
            canAssignSpecialReviews: permissions?.canAssignSpecialReviews || false,
            canViewWithdrawalHistory: permissions?.canViewWithdrawalHistory || false
        };

        await subAdmin.save();

        res.json({
            message: 'Permissions updated successfully',
            permissions: subAdmin.permissions
        });
    } catch (err) {
        console.error('Error updating permissions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
