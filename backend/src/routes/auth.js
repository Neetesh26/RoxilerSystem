const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const passwordValidation = body('password')
  .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character');

router.post('/register', [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').isLength({ max: 400 }).withMessage('Address max 400 characters'),
  passwordValidation,
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], login);

router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
], updatePassword);

module.exports = router;
