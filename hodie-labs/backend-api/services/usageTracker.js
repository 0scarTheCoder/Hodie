/**
 * Usage Tracker Service
 * Tracks AI usage per user for billing and analytics
 */

class UsageTracker {
  constructor(db) {
    this.db = db;
    this.usageCollection = db.collection('ai_usage');
  }

  /**
   * Track a chat message
   */
  async trackMessage(userId, tier, modelUsed, tokensUsed) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Update or create usage record for this month
      await this.usageCollection.updateOne(
        {
          userId: userId,
          month: startOfMonth
        },
        {
          $inc: {
            messagesUsed: 1,
            tokensUsed: tokensUsed
          },
          $set: {
            tier: tier,
            lastUsed: now
          },
          $push: {
            history: {
              timestamp: now,
              type: 'message',
              model: modelUsed,
              tokens: tokensUsed
            }
          }
        },
        { upsert: true }
      );

      console.log(`✅ Tracked message for user ${userId}: ${modelUsed} (${tokensUsed} tokens)`);
    } catch (error) {
      console.error('Error tracking message:', error);
      // Don't throw - tracking failures shouldn't break the API
    }
  }

  /**
   * Track a file analysis
   */
  async trackFileAnalysis(userId, tier, modelUsed, fileName) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // File analysis counts as 1 message
      await this.usageCollection.updateOne(
        {
          userId: userId,
          month: startOfMonth
        },
        {
          $inc: {
            messagesUsed: 1,
            filesAnalyzed: 1,
            tokensUsed: 1500 // Estimate for file analysis
          },
          $set: {
            tier: tier,
            lastUsed: now
          },
          $push: {
            history: {
              timestamp: now,
              type: 'file_analysis',
              model: modelUsed,
              fileName: fileName,
              tokens: 1500
            }
          }
        },
        { upsert: true }
      );

      console.log(`✅ Tracked file analysis for user ${userId}: ${fileName}`);
    } catch (error) {
      console.error('Error tracking file analysis:', error);
    }
  }

  /**
   * Get usage for a specific user and month
   */
  async getUsage(userId, month = null) {
    try {
      const targetMonth = month || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const usage = await this.usageCollection.findOne({
        userId: userId,
        month: targetMonth
      });

      return usage || {
        userId: userId,
        month: targetMonth,
        messagesUsed: 0,
        tokensUsed: 0,
        filesAnalyzed: 0,
        tier: 'free'
      };
    } catch (error) {
      console.error('Error getting usage:', error);
      return null;
    }
  }

  /**
   * Get total usage stats across all users (admin)
   */
  async getTotalStats(month = null) {
    try {
      const targetMonth = month || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const stats = await this.usageCollection.aggregate([
        { $match: { month: targetMonth } },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalMessages: { $sum: '$messagesUsed' },
            totalTokens: { $sum: '$tokensUsed' },
            totalFiles: { $sum: '$filesAnalyzed' },
            avgMessagesPerUser: { $avg: '$messagesUsed' },
            avgTokensPerUser: { $avg: '$tokensUsed' }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalUsers: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalFiles: 0
      };
    } catch (error) {
      console.error('Error getting total stats:', error);
      return null;
    }
  }

  /**
   * Get usage breakdown by tier (admin)
   */
  async getStatsByTier(month = null) {
    try {
      const targetMonth = month || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const stats = await this.usageCollection.aggregate([
        { $match: { month: targetMonth } },
        {
          $group: {
            _id: '$tier',
            users: { $sum: 1 },
            totalMessages: { $sum: '$messagesUsed' },
            totalTokens: { $sum: '$tokensUsed' },
            avgMessagesPerUser: { $avg: '$messagesUsed' }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      return stats;
    } catch (error) {
      console.error('Error getting stats by tier:', error);
      return [];
    }
  }

  /**
   * Calculate estimated costs based on usage
   */
  calculateCosts(usage, tier) {
    // Pricing per 1M tokens
    const PRICING = {
      'groq-llama-3-8b': {
        input: 0.00,
        output: 0.00
      },
      'claude-3-haiku': {
        input: 0.25,
        output: 1.25
      },
      'claude-3.5-sonnet': {
        input: 3.00,
        output: 15.00
      }
    };

    // Estimate input/output split (rough 60/40 split)
    const inputTokens = Math.floor(usage.tokensUsed * 0.6);
    const outputTokens = Math.floor(usage.tokensUsed * 0.4);

    let cost = 0;

    // Calculate cost based on tier's typical model
    switch (tier) {
      case 'free':
        cost = 0; // Groq is free
        break;
      case 'basic':
      case 'pro':
        cost = (inputTokens / 1000000 * PRICING['claude-3-haiku'].input) +
               (outputTokens / 1000000 * PRICING['claude-3-haiku'].output);
        break;
      case 'premium':
        cost = (inputTokens / 1000000 * PRICING['claude-3.5-sonnet'].input) +
               (outputTokens / 1000000 * PRICING['claude-3.5-sonnet'].output);
        break;
    }

    return {
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      totalTokens: usage.tokensUsed,
      estimatedCost: cost,
      currency: 'USD'
    };
  }

  /**
   * Reset usage for new month (called by cron job)
   */
  async resetMonthlyUsage() {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Archive last month's data
      const lastMonthData = await this.usageCollection.find({
        month: lastMonth
      }).toArray();

      if (lastMonthData.length > 0) {
        const archiveCollection = this.db.collection('ai_usage_archive');
        await archiveCollection.insertMany(lastMonthData);
        console.log(`✅ Archived ${lastMonthData.length} usage records for ${lastMonth.toISOString()}`);
      }

      // Note: We don't delete current month data, as it accumulates throughout the month
      return {
        archived: lastMonthData.length,
        month: lastMonth
      };
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      throw error;
    }
  }
}

module.exports = UsageTracker;
