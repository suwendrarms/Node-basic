const mongoose = require("mongoose");

const userRoleSchema = mongoose.Schema({
  name: {
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
  },
  // users:
  // [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }]
});

module.exports = userRoleSchema;
