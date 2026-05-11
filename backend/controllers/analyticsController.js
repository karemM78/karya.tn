const asyncHandler = require('express-async-handler');
const analyticsRepository = require('../repositories/analyticsRepository');

// @desc    Get latest analytics report (Real-time/Latest hourly)
// @route   GET /api/analytics/realtime
// @access  Private/Admin
const getRealtimeAnalytics = asyncHandler(async (req, res) => {
  const report = await analyticsRepository.getLatestReport();
  
  if (report) {
    res.json({
      totalUsers: report.TOTAL_USERS,
      totalOrders: report.TOTAL_ORDERS,
      revenue: report.REVENUE,
      conversionRate: report.CONVERSION_RATE,
      lastUpdated: report.REPORT_DATE
    });
  } else {
    res.status(404);
    throw new Error('No analytics data available yet.');
  }
});

// @desc    Get daily analytics (last 7 days)
// @route   GET /api/analytics/daily
// @access  Private/Admin
const getDailyAnalytics = asyncHandler(async (req, res) => {
  const reports = await analyticsRepository.getDailyReports(7);
  
  const formatted = reports.map(r => ({
    date: r.REPORT_DATE,
    revenue: r.REVENUE,
    orders: r.TOTAL_ORDERS
  }));

  res.json(formatted);
});

// @desc    Get AI predictions
// @route   GET /api/analytics/predictions
// @access  Private/Admin
const getPredictions = asyncHandler(async (req, res) => {
  const report = await analyticsRepository.getLatestReport();

  if (report) {
    res.json({
      predictedSales: report.PREDICTED_SALES,
      churnRate: report.CHURN_RATE,
      anomalies: JSON.parse(report.ANOMALIES_DETECTED || '[]')
    });
  } else {
    res.status(404);
    throw new Error('No prediction data available.');
  }
});

module.exports = {
  getRealtimeAnalytics,
  getDailyAnalytics,
  getPredictions
};
