const express = require('express');
const router = express.Router();
const { 
  getRealtimeAnalytics, 
  getDailyAnalytics, 
  getPredictions 
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protect these routes to only be accessible by Admins
router.get('/realtime', protect, admin, getRealtimeAnalytics);
router.get('/daily', protect, admin, getDailyAnalytics);
router.get('/predictions', protect, admin, getPredictions);

module.exports = router;
