const mongoose = require("mongoose");

const userRoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true
    },
    contactNumber2: {
        type: String,
        // required: true,
    },
    nic: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Number,
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = userRoleSchema;
