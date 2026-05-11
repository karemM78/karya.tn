const Analytics = require('../models/Analytics');

class AnalyticsRepository {
  async getLatestReport() {
    const report = await Analytics.findOne().sort({ reportDate: -1 });
    return report ? this._mapReport(report) : null;
  }

  async getDailyReports(days = 7) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const reports = await Analytics.find({
      reportDate: { $gte: dateLimit },
    }).sort({ reportDate: 1 });

    return reports.map(r => this._mapReport(r));
  }

  _mapReport(report) {
    const rObj = report.toObject();
    return {
      ID: rObj._id.toString(),
      REPORT_DATE: rObj.reportDate,
      TOTAL_USERS: rObj.totalUsers,
      TOTAL_ORDERS: rObj.totalOrders,
      REVENUE: rObj.revenue,
      TOP_PRODUCT: rObj.topProduct,
      PREDICTED_SALES: rObj.predictedSales,
      CHURN_RATE: rObj.churnRate,
      ANOMALIES_DETECTED: rObj.anomaliesDetected,
      CONVERSION_RATE: rObj.conversionRate,
      RETENTION_RATE: rObj.retentionRate,
    };
  }
}

module.exports = new AnalyticsRepository();
