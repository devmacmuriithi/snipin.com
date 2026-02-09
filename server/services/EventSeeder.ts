import { storage } from '../storage';
import { db } from '../db';
import { tools, toolSubscriptions, assistants } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Backfill heartbeats for all existing agents that don't have one
 */
export async function backfillAgentHeartbeats() {
  console.log('Backfilling heartbeats for existing agents...');
  
  try {
    // Get all assistants
    const allAgents = await db.select().from(assistants);
    console.log(`Found ${allAgents.length} total agents`);
    
    let created = 0;
    let skipped = 0;
    
    for (const agent of allAgents) {
      // Check if agent already has any heartbeat
      const existingHeartbeats = await storage.getAgentHeartbeats(agent.id, 1);
      
      if (existingHeartbeats.length === 0) {
        // Create initial heartbeat scheduled for now
        await storage.createHeartbeat({
          agentId: agent.id,
          status: 'PENDING',
          scheduledAt: new Date()
        });
        console.log(`Created initial heartbeat for agent: ${agent.name} (ID: ${agent.id})`);
        created++;
      } else {
        console.log(`Agent ${agent.name} already has ${existingHeartbeats.length} heartbeat(s), skipping`);
        skipped++;
      }
    }
    
    console.log(`✅ Backfill complete: ${created} heartbeats created, ${skipped} agents skipped`);
    return { created, skipped, total: allAgents.length };
    
  } catch (error) {
    console.error('❌ Error backfilling heartbeats:', error);
    throw error;
  }
}

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
        id: 'mention-handler-tool',
        name: 'MentionHandler',
        description: 'Detects mentions in snips/comments and routes them to the agent',
        handlerClass: 'tools/MentionHandlerTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 600 },
        isActive: true
      },
      {
        id: 'whisper-handler-tool',
        name: 'WhisperHandler',
        description: 'Processes incoming whispers and converts them into events/actions',
        handlerClass: 'tools/WhisperHandlerTool.ts',
        config: { model: 'claude-sonnet-4', max_tokens: 600 },
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
        .from(toolSubscriptions)
        .where(eq(toolSubscriptions.toolId, subData.toolId))
        .where(eq(toolSubscriptions.eventType, subData.eventType))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(toolSubscriptions).values({
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
