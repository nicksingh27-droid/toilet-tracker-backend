const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Allow requests from your Netlify frontend (and any origin)
app.use(cors({
  origin: '*'
}));

app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const toiletRoutes = require('./routes/toilets');

app.use('/api/auth', authRoutes);
app.use('/api/toilets', toiletRoutes);

// Root route - test the backend is alive
app.get('/', (req, res) => {
  res.send('🚽 Toilet Tracker backend is running! Welcome!');
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Use Render's port or 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🖥️ Server running on port ${PORT}`);
});