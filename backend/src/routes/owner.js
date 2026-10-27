const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getOwnerDashboard } = require('../controllers/ownerController');

router.get('/dashboard', authenticate, authorize('store_owner'), getOwnerDashboard);

module.exports = router;
