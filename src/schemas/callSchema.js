const mongoose = require("mongoose");

const userRoleSchema = mongoose.Schema({
    calledDate: {
        type: String,
        // required: true,
    },
    calledNumber: {
        type: String,
        // required: true,
        // unique: true
    },
    calledDuration: {
        type: String,
        // required: true,
    },
    calledType: {
        type: String,
        // required: true,
    },

    status: {
        type: Number,
        // required: true,
    },

    createdAt: {
        type: Number,
        // required: true,
    },
    updatedAt: {
        type: Number,
    },
    calledAgent:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    callUserID:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }
});

module.exports = userRoleSchema;
