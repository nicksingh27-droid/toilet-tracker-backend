const express = require('express');
const jwt = require('jsonwebtoken');
const Toilet = require('../models/Toilet');
const User = require('../models/User');

const router = express.Router();

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Add new toilet
router.post('/', auth, async (req, res) => {
  try {
    const { name, latitude, longitude, address } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Name, latitude, and longitude required' });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Lat/long must be numbers' });
    }

    const toilet = await Toilet.create({
      user: req.user.id,
      name,
      location: { type: 'Point', coordinates: [lon, lat] },
      address: address || '',
      isGoldenBowl: false
    });

    res.status(201).json({ message: 'Toilet logged! 🚽', toilet });
  } catch (error) {
    console.error('Error adding toilet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// My progress
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
    console.error('Progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all my toilets
router.get('/', auth, async (req, res) => {
  try {
    const toilets = await Toilet.find({ user: req.user.id }).sort({ visitedAt: -1 });
    res.json(toilets);
  } catch (error) {
    console.error('Get toilets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle Golden Bowl
router.patch('/:id/toggle-golden', auth, async (req, res) => {
  try {
    const toilet = await Toilet.findOne({ _id: req.params.id, user: req.user.id });
    if (!toilet) {
      return res.status(404).json({ message: 'Toilet not found or not yours' });
    }

    const goldenCount = await Toilet.countDocuments({ user: req.user.id, isGoldenBowl: true });

    if (!toilet.isGoldenBowl && goldenCount >= 5) {
      return res.status(400).json({ message: 'You can only have 5 Golden Bowl toilets!' });
    }

    toilet.isGoldenBowl = !toilet.isGoldenBowl;
    await toilet.save();

    res.json({
      message: `Golden Bowl ${toilet.isGoldenBowl ? 'awarded! 🏆' : 'removed'}`,
      toilet
    });
  } catch (error) {
    console.error('Golden Bowl error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'toilets',
          localField: '_id',
          foreignField: 'user',
          as: 'userToilets'
        }
      },
      {
        $addFields: {
          totalToilets: { $size: { $ifNull: ['$userToilets', []] } }
        }
      },
      {
        $project: {
          email: 1,
          totalToilets: 1
        }
      },
      {
        $sort: { totalToilets: -1 }
      },
      { $limit: 50 }
    ]);

    const formatted = leaderboard.map(entry => ({
      email: entry.email,
      total: entry.totalToilets
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

module.exports = router;