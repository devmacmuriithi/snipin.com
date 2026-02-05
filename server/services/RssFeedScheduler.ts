import { storage } from '../storage';
import { db } from '../db';
import { agent_memories } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * RSS Feed Scheduler Service
 * 
 * This service manages RSS feed fetching schedules and publishes RSS_FEED_CHECK events
 * at appropriate intervals for agents that have RSS feeds configured.
 */

export class RssFeedScheduler {
  private static instance: RssFeedScheduler;
  private interval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30 * 60 * 1000; // Check every 30 minutes

  private constructor() {}

  static getInstance(): RssFeedScheduler {
    if (!RssFeedScheduler.instance) {
      RssFeedScheduler.instance = new RssFeedScheduler();
    }
    return RssFeedScheduler.instance;
  }

  start() {
    if (this.interval) {
      console.log('RSS Feed Scheduler already running');
      return;
    }

    console.log('📡 Starting RSS Feed Scheduler...');
    
    // Check immediately on start
    this.checkAndScheduleFeeds();
    
    // Then check every 30 minutes
    this.interval = setInterval(() => {
      this.checkAndScheduleFeeds();
    }, this.CHECK_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('📡 RSS Feed Scheduler stopped');
    }
  }

  private async checkAndScheduleFeeds() {
    try {
      console.log('🔍 Checking RSS feed schedules...');
      
      // Get all agents with RSS feed configurations
      const agents = await storage.getAgents();
      const agentsWithFeeds = [];

      for (const agent of agents) {
        const hasFeeds = await this.agentHasRssFeeds(agent.id);
        if (hasFeeds) {
          agentsWithFeeds.push(agent);
        }
      }

      console.log(`Found ${agentsWithFeeds.length} agents with RSS feeds`);

      // Check each agent's schedule
      for (const agent of agentsWithFeeds) {
        const shouldRun = await this.shouldRunRssCheck(agent.id);
        
        if (shouldRun) {
          await this.scheduleRssCheck(agent);
        }
      }

    } catch (error) {
      console.error('❌ Error in RSS feed scheduler:', error);
    }
  }

  private async agentHasRssFeeds(agentId: number): Promise<boolean> {
    try {
      const memories = await storage.getAgentMemories(agentId, 'rss_feeds');
      return memories.length > 0 && memories[0].content?.length > 0;
    } catch (error) {
      console.error(`Error checking RSS feeds for agent ${agentId}:`, error);
      return false;
    }
  }

  private async shouldRunRssCheck(agentId: number): Promise<boolean> {
    try {
      // Check when RSS was last run for this agent
      const memories = await storage.getAgentMemories(agentId, 'rss_last_run');
      
      if (memories.length === 0) {
        // Never run before - run now
        return true;
      }

      const lastRun = new Date(memories[0].content.last_run);
      const now = new Date();
      const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

      // Only run if at least 4 hours have passed
      return hoursSinceLastRun >= 4;

    } catch (error) {
      console.error(`Error checking RSS schedule for agent ${agentId}:`, error);
      return false;
    }
  }

  private async scheduleRssCheck(agent: any) {
    try {
      console.log(`📰 Scheduling RSS check for agent: ${agent.name}`);

      // Publish RSS_FEED_CHECK event
      await storage.createEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId: agent.id,
        eventType: 'RSS_FEED_CHECK',
        payload: {
          agent_id: agent.id,
          agent_name: agent.name,
          expertise: agent.expertise,
          scheduled_at: new Date()
        },
        source: 'rss_scheduler',
        priority: 3  // Medium priority
      });

      // Update last run timestamp
      await storage.createAgentMemory({
        agentId: agent.id,
        memoryType: 'rss_last_run',
        content: {
          last_run: new Date(),
          agent_name: agent.name
        },
        relevanceScore: 1.0
      });

      console.log(`✅ RSS check scheduled for agent: ${agent.name}`);

    } catch (error) {
      console.error(`❌ Error scheduling RSS check for agent ${agent.name}:`, error);
    }
  }

  /**
   * Configure RSS feeds for an agent
   */
  async configureAgentFeeds(agentId: number, feeds: any[]): Promise<void> {
    try {
      await storage.createAgentMemory({
        agentId,
        memoryType: 'rss_feeds',
        content: feeds,
        relevanceScore: 1.0
      });

      console.log(`✅ Configured ${feeds.length} RSS feeds for agent ${agentId}`);
    } catch (error) {
      console.error(`❌ Error configuring RSS feeds for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get RSS feeds configuration for an agent
   */
  async getAgentFeeds(agentId: number): Promise<any[]> {
    try {
      const memories = await storage.getAgentMemories(agentId, 'rss_feeds');
      return memories.length > 0 ? memories[0].content : [];
    } catch (error) {
      console.error(`❌ Error getting RSS feeds for agent ${agentId}:`, error);
      return [];
    }
  }

  /**
   * Add RSS feed to agent configuration
   */
  async addFeedToAgent(agentId: number, feed: any): Promise<void> {
    try {
      const existingFeeds = await this.getAgentFeeds(agentId);
      const updatedFeeds = [...existingFeeds, { ...feed, id: `feed_${Date.now()}` }];
      await this.configureAgentFeeds(agentId, updatedFeeds);
    } catch (error) {
      console.error(`❌ Error adding RSS feed to agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove RSS feed from agent configuration
   */
  async removeFeedFromAgent(agentId: number, feedId: string): Promise<void> {
    try {
      const existingFeeds = await this.getAgentFeeds(agentId);
      const updatedFeeds = existingFeeds.filter((feed: any) => feed.id !== feedId);
      await this.configureAgentFeeds(agentId, updatedFeeds);
    } catch (error) {
      console.error(`❌ Error removing RSS feed from agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get RSS feed statistics
   */
  async getFeedStats(agentId: number): Promise<any> {
    try {
      const feeds = await this.getAgentFeeds(agentId);
      const lastRun = await storage.getAgentMemories(agentId, 'rss_last_run');
      const attributions = await storage.getAgentMemories(agentId, 'rss_attribution');

      return {
        total_feeds: feeds.length,
        active_feeds: feeds.filter((f: any) => f.isActive).length,
        last_run: lastRun.length > 0 ? lastRun[0].content.last_run : null,
        posts_created_from_feeds: attributions.length,
        feeds: feeds.map((feed: any) => ({
          id: feed.id,
          name: feed.name,
          category: feed.category,
          isActive: feed.isActive,
          lastFetched: feed.lastFetched
        }))
      };
    } catch (error) {
      console.error(`❌ Error getting RSS feed stats for agent ${agentId}:`, error);
      return null;
    }
  }
}
