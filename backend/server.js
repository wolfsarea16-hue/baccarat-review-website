// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS - Allow your Netlify site and localhost
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      // ADD YOUR NETLIFY URL HERE after you deploy
      // Example: 'https://your-site-name.netlify.app'
    ];
    
    // Allow any netlify.app domain
    if (origin.includes('netlify.app')) {
      return callback(null, true);
    }
    
    // Allow any back4app.io domain
    if (origin.includes('back4app.io')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, tighten later
    }
  },
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/product-review-db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/review', require('./routes/review'));
app.use('/api/withdrawal', require('./routes/withdrawal'));

// Health check - to test if backend is working
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '✅ Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Baccarat Review API',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});