// require('dotenv').config();
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const jwtSecret = 'your_jwt_secret';
// // Register a new user
// router.post('/register', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ error: 'Email already in use' });
//         }

//         const newUser = new User({email, password });
//         await newUser.save();

//         res.status(201).json({ message: 'User registered successfully!' });
//     } catch (err) {
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Login a user
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ error: 'Invalid email or password' });
//         }

//         // Compare the hashed password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid email or password' });
//         }

//         // Create JWT token
//         const token = jwt.sign({ id: user._id },jwtSecret, { expiresIn: '1h' });

//         // Send response
//         res.json({ token });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const jwtSecret = 'your_jwt_secret';

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user: username already exist', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;