const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['https://theboomboom400.netlify.app', 'http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
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