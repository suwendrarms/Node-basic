const mongoose = require('mongoose');
const userRoleModel = mongoose.Schema({

    //   ATTRIBUTES
    calledNumber: {
        type: String,
        required: true,
    },
    calledDate: {
        type: String,
        required: true,
    },
    calledDuration: {
        type: String,
        required: true,
    },
    calledType: { //0 - pending |1 - in-comming | 2 - out-going | 3 - missed | 4 - rejected | 5 - not picked by client
        type: Number,
        required: true,
    },
    status: { //0 - in-complete | 1 - complete
        type: Number,
        required: true,
    },
    calledAt: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true,
    },

    //   ASSOCIATIONS
    callUserID:
    {
        type: mongoose.Types.ObjectId,
        ref: 'client'
    },
    calledAgent:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }

}, {
    timestamps: true
});
module.exports = mongoose.model('Call', userRoleModel);