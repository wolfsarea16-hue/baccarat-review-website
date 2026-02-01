// backend/models/SubAdmin.js
const mongoose = require('mongoose');

const SubAdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    permissions: {
        canEditGroupLinks: {
            type: Boolean,
            default: false
        },
        canAdjustBalance: {
            type: Boolean,
            default: false
        },
        canSetTargetBalance: {
            type: Boolean,
            default: false
        },
        canAssignSpecialReviews: {
            type: Boolean,
            default: false
        },
        canViewWithdrawalHistory: {
            type: Boolean,
            default: false
        },
        canSetTestingAccount: {
            type: Boolean,
            default: false
        },
        canChangePassword: {
            type: Boolean,
            default: false
        },
        canProcessWithdrawals: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubAdmin', SubAdminSchema);
