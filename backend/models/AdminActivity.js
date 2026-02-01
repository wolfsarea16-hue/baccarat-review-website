// backend/models/AdminActivity.js
const mongoose = require('mongoose');

const AdminActivitySchema = new mongoose.Schema({
    subAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubAdmin',
        required: true
    },
    subAdminUsername: {
        type: String,
        required: true
    },
    actionType: {
        type: String,
        enum: ['balance_adjust', 'target_balance', 'special_review', 'group_link', 'user_update', 'testing_account', 'change_password', 'process_withdrawal'],
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUsername: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

// Index for faster queries
AdminActivitySchema.index({ subAdminId: 1, timestamp: -1 });
AdminActivitySchema.index({ targetUserId: 1, timestamp: -1 });

module.exports = mongoose.model('AdminActivity', AdminActivitySchema);
