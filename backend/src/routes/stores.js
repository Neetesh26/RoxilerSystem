const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { getStores, submitRating, updateRating } = require('../controllers/storeController');

router.get('/stores', authenticate, authorize('user'), getStores);

router.post('/ratings', authenticate, authorize('user'), [
  body('store_id').isInt({ min: 1 }).withMessage('Valid store required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], submitRating);

router.put('/ratings/:storeId', authenticate, authorize('user'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], updateRating);

module.exports = router;
