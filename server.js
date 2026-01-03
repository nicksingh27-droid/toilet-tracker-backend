const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors({
  origin: '*'  // Allows any origin (fine for public app like this)
  // OR for more security: origin: 'https://theboomboom400.netlify.app'
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const toiletRoutes = require('./routes/toilets');

app.use('/api/auth', authRoutes);
app.use('/api/toilets', toiletRoutes);

app.get('/', (req, res) => {
  res.send('🚽 Toilet Tracker backend is running! Welcome!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.log('❌ MongoDB error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🖥️  Server running on http://localhost:${PORT}`);
});