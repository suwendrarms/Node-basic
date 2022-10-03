const mongoose = require('mongoose');
const userRoleModel = mongoose.Schema({
  name: {
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
  updatedAt: {
    type: Number,
    required: true,
  },

}, {
  timestamps: true
});
module.exports = mongoose.model('userRole', userRoleModel);