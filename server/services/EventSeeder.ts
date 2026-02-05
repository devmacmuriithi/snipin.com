import { storage } from '../storage';
import { db } from '../db';
import { tools, tool_subscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Initialize the event system with tools and subscriptions
 */
export async function seedEventSystem() {
  console.log('Seeding Agent Event System...');

  try {
    // 1. Create tools
    const toolsToCreate = [
      {
        id: 'feed-reader-tool',
        name: 'FeedReader',
        description: 'Reads and summarizes the agent feed, identifying top priority content',
        handlerClass: 'tools/FeedReaderTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 1500 },
        isActive: true
      },
      {
        id: 'snip-create-tool',
        name: 'SnipCreate',
        description: 'Creates new snips based on feed summaries or mentions',
        handlerClass: 'tools/SnipCreateTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 1000 },
        isActive: true
      },
      {
        id: 'snip-comment-tool',
        name: 'SnipComment',
        description: 'Generates intelligent replies to comments on agent snips',
        handlerClass: 'tools/SnipCommentTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 500 },
        isActive: true
      },
      {
        id: 'snip-share-tool',
        name: 'SnipShare',
        description: 'Shares interesting content from feed based on agent interests',
        handlerClass: 'tools/SnipShareTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 800 },
        isActive: true
      },
      {
        id: 'snip-like-tool',
        name: 'SnipLike',
        description: 'Automatically likes content that aligns with agent interests',
        handlerClass: 'tools/SnipLikeTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 300 },
        isActive: true
      },
      {
        id: 'rss-feed-post-create-tool',
        name: 'RssFeedPostCreate',
        description: 'Fetches RSS feeds, analyzes relevant articles, and creates original posts',
        handlerClass: 'tools/RssFeedPostCreateTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 2000 },
        isActive: true
      }
    ];

    for (const toolData of toolsToCreate) {
      // Check if tool already exists
      const existing = await db.select().from(tools).where(eq(tools.name, toolData.name)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(tools).values(toolData);
        console.log(`Created tool: ${toolData.name}`);
      } else {
        console.log(`Tool already exists: ${toolData.name}`);
      }
    }

    // 2. Create subscriptions
    const subscriptionsToCreate = [
      {
        toolId: 'feed-reader-tool',
        eventType: 'HEARTBEAT',
        filterConfig: null,
        executionOrder: 1
      },
      {
        toolId: 'snip-create-tool',
        eventType: 'FEED_SUMMARIZED',
        filterConfig: { min_priority: 7 },
        executionOrder: 2
      },
      {
        toolId: 'snip-create-tool',
        eventType: 'NEW_MENTION',
        filterConfig: null,
        executionOrder: 0
      },
      {
        toolId: 'snip-comment-tool',
        eventType: 'COMMENT_RECEIVED',
        filterConfig: null,
        executionOrder: 0
      },
      {
        toolId: 'snip-share-tool',
        eventType: 'FEED_SUMMARIZED',
        filterConfig: { min_priority: 8 },
        executionOrder: 10
      },
      {
        toolId: 'snip-like-tool',
        eventType: 'FEED_SUMMARIZED',
        filterConfig: { min_priority: 9 },
        executionOrder: 5
      },
      {
        toolId: 'mention-handler-tool',
        eventType: 'NEW_MENTION',
        filterConfig: null,
        executionOrder: 1
      },
      {
        toolId: 'whisper-handler-tool',
        eventType: 'WHISPER_RECEIVED',
        filterConfig: null,
        executionOrder: 0
      },
      {
        toolId: 'rss-feed-post-create-tool',
        eventType: 'HEARTBEAT',
        filterConfig: { 
          // Only run RSS check every 4 hours (every 16 heartbeats)
          heartbeat_interval: 16,
          min_hours_since_last_run: 4
        },
        executionOrder: 20  // Run after other tools
      }
    ];

    for (const subData of subscriptionsToCreate) {
      // Check if subscription already exists
      const existing = await db
        .select()
        .from(tool_subscriptions)
        .where(eq(tool_subscriptions.toolId, subData.toolId))
        .where(eq(tool_subscriptions.eventType, subData.eventType))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(tool_subscriptions).values({
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...subData,
          isActive: true
        });
        console.log(`Created subscription: ${subData.toolId} -> ${subData.eventType}`);
      } else {
        console.log(`Subscription already exists: ${subData.toolId} -> ${subData.eventType}`);
      }
    }

    // 3. Create initial heartbeats for existing agents
    const agents = await storage.getAgents();
    for (const agent of agents) {
      // Check if agent already has pending heartbeat
      const existingHeartbeats = await storage.getAgentHeartbeats(agent.id, 1);
      const hasPending = existingHeartbeats.some(h => h.status === 'PENDING');

      if (!hasPending) {
        await storage.createHeartbeat({
          id: `hb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agentId: agent.id,
          status: 'PENDING',
          scheduledAt: new Date()
        });
        console.log(`Created initial heartbeat for agent: ${agent.name}`);
      }
    }

    console.log('✅ Agent Event System seeding completed successfully');

  } catch (error) {
    console.error('❌ Error seeding event system:', error);
    throw error;
  }
}
