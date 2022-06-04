const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    nic: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Number,
        required: true,
    },
    userRole:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRole'
    }

}, {
    timestamps: true
});

const User = mongoose.model("User", UserSchema);
module.exports = User;