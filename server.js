const express = require('express');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const db = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
