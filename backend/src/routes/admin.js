const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboard, getUsers, getUserById,
  createUser, getStores, createStore
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').isLength({ max: 400 }).withMessage('Address max 400 characters'),
  body('password')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
  body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'),
], createUser);

router.get('/stores', getStores);
router.post('/stores', [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').isLength({ max: 400 }).withMessage('Address max 400 characters'),
], createStore);

module.exports = router;
