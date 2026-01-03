const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// CORS for Netlify frontend
app.use(cors({
  origin: '*'
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const toiletRoutes = require('./routes/toilets');

app.use('/api/auth', authRoutes);
app.use('/api/toilets', toiletRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🚽 Toilet Tracker backend is running! Welcome!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🖥️ Server running on port ${PORT}`);
});