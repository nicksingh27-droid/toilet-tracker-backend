// models/Toilet.js - Fixed version (no compound unique index)

const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  // ... existing fields
  isGoldenBowl: {
    type: Boolean,
    default: false
  },
  // ... rest
});

const toiletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  address: {
    type: String,
    trim: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
});

// Only one index: for fast nearby checks
toiletSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Toilet', toiletSchema);