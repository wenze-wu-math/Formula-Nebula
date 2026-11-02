/**
 * Revenue Manager
 * Handles revenue tracking and distribution
 */

export class RevenueManager {
  constructor(options = {}) {
    this.storage = options.storage || new Map();
    this.defaultPublisherShare = options.defaultPublisherShare || 70;
    this.defaultPlatformFee = options.defaultPlatformFee || 30;
  }

  /**
   * Initialize revenue tracking for API
   */
  async initializeAPI(apiId, publisherId) {
    const revenueKey = `revenue:${apiId}`;

    await this.storage.set(revenueKey, {
      apiId,
      publisherId,
      totalRevenue: 0,
      totalCalls: 0,
      periods: []
    });

    return true;
  }

  /**
   * Record usage for revenue calculation
   */
  async recordUsage(usage) {
    const { apiId, publisherId, consumerId, cost, timestamp } = usage;

    const period = this.getPeriodKey(timestamp);
    const recordKey = `usage:${period}:${apiId}`;

    let periodData = this.storage.get(recordKey) || {
      apiId,
      publisherId,
      period,
      totalRevenue: 0,
      totalCalls: 0,
      uniqueConsumers: new Set(),
      records: []
    };

    periodData.totalRevenue += cost;
    periodData.totalCalls++;
    periodData.uniqueConsumers.add(consumerId);
    periodData.records.push({
      consumerId,
      cost,
      timestamp
    });

    await this.storage.set(recordKey, periodData);

    // Update overall API revenue
    const revenueKey = `revenue:${apiId}`;
    const apiRevenue = this.storage.get(revenueKey);
    if (apiRevenue) {
      apiRevenue.totalRevenue += cost;
      apiRevenue.totalCalls++;
      await this.storage.set(revenueKey, apiRevenue);
    }

    return true;
  }

  /**
   * Calculate revenue distribution for period
   */
  async calculateDistribution(apiId, period) {
    const recordKey = `usage:${period}:${apiId}`;
    const periodData = this.storage.get(recordKey);

    if (!periodData) {
      return null;
    }

    // Get API revenue share configuration
    const api = this.storage.get(apiId);
    const publisherShare = api?.revenueShare?.publisherShare || this.defaultPublisherShare;
    const platformFee = api?.revenueShare?.platformFee || this.defaultPlatformFee;

    const totalRevenue = periodData.totalRevenue;

    // Calculate base distribution
    let publisherAmount = totalRevenue * (publisherShare / 100);
    let platformAmount = totalRevenue * (platformFee / 100);

    // Apply volume bonuses
    const bonus = this.calculateVolumeBonus(periodData.totalCalls);
    if (bonus > 0) {
      const bonusAmount = totalRevenue * (bonus / 100);
      publisherAmount += bonusAmount;
      platformAmount -= bonusAmount;
    }

    const distribution = {
      period,
      apiId,
      publisherId: periodData.publisherId,
      metrics: {
        totalRevenue,
        totalCalls: periodData.totalCalls,
        uniqueConsumers: periodData.uniqueConsumers.size
      },
      distribution: {
        publisherAmount: Math.round(publisherAmount * 100) / 100,
        platformAmount: Math.round(platformAmount * 100) / 100,
        publisherPercentage: publisherShare + bonus,
        platformPercentage: platformFee - bonus,
        volumeBonus: bonus
      },
      status: 'pending',
      calculatedAt: new Date()
    };

    // Store distribution
    const distKey = `dist:${period}:${apiId}`;
    await this.storage.set(distKey, distribution);

    return distribution;
  }

  /**
   * Mark distribution as paid
   */
  async markAsPaid(apiId, period, paymentDetails) {
    const distKey = `dist:${period}:${apiId}`;
    const distribution = this.storage.get(distKey);

    if (!distribution) {
      throw new Error('Distribution not found');
    }

    distribution.status = 'paid';
    distribution.paidAt = new Date();
    distribution.paymentDetails = paymentDetails;

    await this.storage.set(distKey, distribution);

    return distribution;
  }

  /**
   * Get revenue report for publisher
   */
  async getReport(publisherId, period) {
    const reports = [];

    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`usage:${period}:`) && value.publisherId === publisherId) {
        const apiId = value.apiId;
        const distribution = await this.calculateDistribution(apiId, period);
        if (distribution) {
          reports.push(distribution);
        }
      }
    }

    // Calculate totals
    const totalRevenue = reports.reduce((sum, r) => sum + r.metrics.totalRevenue, 0);
    const totalPublisherAmount = reports.reduce((sum, r) => sum + r.distribution.publisherAmount, 0);
    const totalCalls = reports.reduce((sum, r) => sum + r.metrics.totalCalls, 0);

    return {
      publisherId,
      period,
      apis: reports,
      summary: {
        totalRevenue,
        totalPublisherAmount,
        totalCalls,
        totalAPIs: reports.length,
        avgRevenuePerAPI: totalRevenue / reports.length || 0
      }
    };
  }

  /**
   * Get API revenue
   */
  async getAPIRevenue(apiId) {
    const revenueKey = `revenue:${apiId}`;
    const data = this.storage.get(revenueKey);

    if (!data) {
      return {
        apiId,
        totalRevenue: 0,
        totalCalls: 0
      };
    }

    return data;
  }

  /**
   * Get monthly revenue trend
   */
  async getRevenueTrend(publisherId, months = 12) {
    const trend = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = this.getPeriodKey(date);

      const report = await this.getReport(publisherId, period);

      trend.push({
        period,
        totalRevenue: report.summary.totalRevenue,
        totalCalls: report.summary.totalCalls,
        totalAPIs: report.summary.totalAPIs
      });
    }

    return trend;
  }

  // Helper methods

  getPeriodKey(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  calculateVolumeBonus(totalCalls) {
    // Volume-based bonus tiers
    if (totalCalls >= 1000000) return 15;
    if (totalCalls >= 100000) return 10;
    if (totalCalls >= 10000) return 5;
    return 0;
  }

  /**
   * Calculate projected revenue
   */
  async projectRevenue(apiId, targetCalls, pricing) {
    const costPerCall = pricing.pricePerCall || 0;
    const baseRevenue = targetCalls * costPerCall;

    const bonus = this.calculateVolumeBonus(targetCalls);
    const publisherShare = 70 + bonus;

    return {
      targetCalls,
      baseRevenue,
      publisherRevenue: baseRevenue * (publisherShare / 100),
      platformRevenue: baseRevenue * ((100 - publisherShare) / 100),
      volumeBonus: bonus
    };
  }
}

export default RevenueManager;
