const mongoose = require('mongoose');

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
  isGoldenBowl: {
    type: Boolean,
    default: false
  },
});

// 2dsphere index for geo queries
toiletSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Toilet', toiletSchema);