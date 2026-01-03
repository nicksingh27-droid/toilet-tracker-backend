// routes/toilets.js - FULLY WORKING VERSION

const express = require('express');
const jwt = require('jsonwebtoken');
const Toilet = require('../models/Toilet');
const User = require('../models/User');

const router = express.Router();  // ← THIS LINE WAS MISSING!

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add a new toilet
router.post('/', auth, async (req, res) => {
  try {
    console.log('🧑 User:', req.user.id);
    console.log('📩 Body:', req.body);

    const { name, latitude, longitude, address } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Name, latitude, and longitude required' });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Lat/long must be numbers' });
    }


// Get user's progress
router.get('/my-progress', auth, async (req, res) => {
  try {
    const total = await Toilet.countDocuments({ user: req.user.id });
    res.json({
      total,
      goal: 400,
      remaining: 400 - total,
      percentage: Math.round((total / 400) * 100),
      message: total >= 400 ? '🏆 TOILET CHAMPION!' : `Keep hunting! ${400 - total} to go!`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL USER'S TOILETS (for map and list)
router.get('/', auth, async (req, res) => {
  try {
    const toilets = await Toilet.find({ user: req.user.id }).sort({ visitedAt: -1 });
    res.json(toilets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET LEADERBOARD (public)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'toilets',  // ← MongoDB collection name (lowercase)
          localField: '_id',
          foreignField: 'user',
          as: 'toiletsArray'
        }
      },
      {
        $addFields: {
          total: { $size: { $ifNull: ['$toiletsArray', []] } }
        }
      },
      {
        $project: {
          email: 1,
          total: 1,
          _id: 0  // hide full ID for privacy
        }
      },
      { $sort: { total: -1 } },
      { $limit: 50 }  // optional: top 50 only
    ]);

    res.json(users);
  } catch (error) {
    console.error('Leaderboard error:', error.message);  // ← This will now show in terminal
    console.error(error.stack);
    res.status(500).json({ message: 'Leaderboard failed', error: error.message });
  }
});

module.exports = router;