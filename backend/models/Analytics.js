const mongoose = require('mongoose');

const analyticsSchema = mongoose.Schema(
  {
    reportDate: {
      type: Date,
      default: Date.now,
    },
    totalUsers: Number,
    totalOrders: Number,
    revenue: Number,
    topProduct: String,
    predictedSales: Number,
    churnRate: Number,
    anomaliesDetected: String,
    conversionRate: Number,
    retentionRate: Number,
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
