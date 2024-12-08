const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model
const jwtSecret = 'your_jwt_secret';

module.exports = async (req, res, next) => {
    // Add error handling for missing Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Safely replace 'Bearer ' and trim
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret);

        // Find the user to ensure they still exist
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach the full user object to the request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        
        // Log unexpected errors
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};