const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Imports
const encryptUploadRoutes = require('./routes/encryptUploadRoutes');


// Initialize express app
const app = express();


// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.use('/api/encrypt-upload', encryptUploadRoutes);

// Use routes
// app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;