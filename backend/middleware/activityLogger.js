// backend/middleware/activityLogger.js
const AdminActivity = require('../models/AdminActivity');

// Middleware to log sub-admin activities
const logActivity = (actionType) => {
    return async (req, res, next) => {
        // Only log if the request is from a sub-admin
        if (req.admin && req.admin.role === 'subadmin') {
            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to log after successful response
            res.json = function (data) {
                // Only log if response was successful (2xx status code)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Log activity asynchronously (don't wait for it)
                    logActivityAsync(req, actionType).catch(err => {
                        console.error('Error logging activity:', err);
                    });
                }

                // Call original json method
                return originalJson(data);
            };
        }

        next();
    };
};

// Async function to log activity
async function logActivityAsync(req, actionType) {
    try {
        const activity = new AdminActivity({
            subAdminId: req.admin.id,
            subAdminUsername: req.admin.username,
            actionType: actionType,
            targetUserId: req.params.userId,
            targetUsername: req.body.targetUsername || 'Unknown',
            details: extractDetails(req, actionType)
        });

        await activity.save();
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
}

// Extract relevant details based on action type
function extractDetails(req, actionType) {
    switch (actionType) {
        case 'balance_adjust':
            return {
                amount: req.body.amount,
                operation: req.body.operation
            };

        case 'target_balance':
            return {
                targetBalance: req.body.targetBalance
            };

        case 'special_review':
            return {
                position: req.body.position,
                productId: req.body.productId,
                negativeAmount: req.body.negativeAmount
            };

        case 'group_link':
            return {
                groupLink: req.body.groupLink
            };

        case 'user_update':
            return {
                updates: req.body
            };

        default:
            return req.body;
    }
}

module.exports = { logActivity };
