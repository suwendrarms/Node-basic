const mongoose = require('mongoose');
const userRoleModel = mongoose.Schema({

  //   ATTRIBUTES
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  contactNumber2: {
    type: String,
    // required: true,
  },
  nic: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedAt:  {
    type: Number,
    required: true,
  },


  //   ASSOCIATIONS
  user:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }

}, {
  timestamps: true
});
module.exports = mongoose.model('client', userRoleModel);