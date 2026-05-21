const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const user = await User.create({ name, email, password, role });
      const token = signToken(user);
      res.status(201).json({ token, user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    body('role').isIn(['admin', 'member']),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const user = await User.findOne({ email, role });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email, password, or role' });
      }
      const token = signToken(user);
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
