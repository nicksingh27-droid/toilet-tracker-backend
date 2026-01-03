// models/User.js - SIMPLE SAFE VERSION (no middleware = no errors)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// We'll hash password manually in the route for now
// (safer than fighting middleware right now)

const User = mongoose.model('User', userSchema);

module.exports = User;