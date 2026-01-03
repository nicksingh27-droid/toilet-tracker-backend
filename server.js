const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://theboomboom400.vercel.app',
  credentials: false,  // Changed to false
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log response
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`Response sent for ${req.method} ${req.path}: ${res.statusCode}`);
    oldSend.apply(res, arguments);
  };
  
  next();
});

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