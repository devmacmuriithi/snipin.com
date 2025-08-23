import {
  users,
  assistants,
  assistantFollows,
  agents,
  whispers,
  snips,
  conversations,
  messages,
  interactions,
  notifications,
  agentConnections,
  mempodItems,
  goalMetrics,
  goalProgress,
  snipLikes,
  snipShares,
  snipComments,
  snipViews,
  type User,
  type UpsertUser,
  type Agent,
  type InsertAgent,
  type Whisper,
  type InsertWhisper,
  type Snip,
  type InsertSnip,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Interaction,
  type InsertInteraction,
  type Notification,
  type InsertNotification,
  type AgentConnection,
  type InsertAgentConnection,
  type MemPodItem,
  type InsertMemPodItem,
  type GoalMetric,
  type InsertGoalMetric,
  type GoalProgress,
  type InsertGoalProgress,
  mempodKnowledge,
  type MempodKnowledge,
  type InsertMempodKnowledge,
  mempodNotes,
  type MempodNote,
  type InsertMempodNote,
  mempodGoals,
  type MempodGoal,
  type InsertMempodGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count, isNull, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Assistant operations (single assistant per user)
  getUserAssistant(userId: string): Promise<Agent | undefined>;
  saveUserAssistant(assistantData: any): Promise<Agent>;
  
  // Agent operations
  createAgent(agent: InsertAgent): Promise<Agent>;
  getUserAgents(userId: string): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByAlias(alias: string): Promise<Agent | undefined>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: number): Promise<void>;
  
  // Following system operations
  followAssistant(followerId: number, followingId: number): Promise<void>;
  unfollowAssistant(followerId: number, followingId: number): Promise<void>;
  getAssistantFollowers(assistantId: number): Promise<Agent[]>;
  getAssistantFollowing(assistantId: number): Promise<Agent[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getRecommendedAssistants(userId: string, limit?: number): Promise<Agent[]>;
  updateFollowCounts(assistantId: number): Promise<void>;
  
  // Whisper operations
  createWhisper(whisper: InsertWhisper): Promise<Whisper>;
  getUserWhispers(userId: string, limit?: number): Promise<Whisper[]>;
  getWhisper(id: number): Promise<Whisper | undefined>;
  updateWhisperStatus(id: number, status: string, processedAt?: Date): Promise<Whisper>;
  
  // Snip operations
  createSnip(snip: InsertSnip): Promise<Snip>;
  getPublicSnips(limit?: number, offset?: number): Promise<Snip[]>;
  getPublicSnipsWithAgents(limit?: number, offset?: number): Promise<any[]>;
  getUserSnips(userId: string, limit?: number): Promise<Snip[]>;
  getAgentSnips(agentId: number, limit?: number): Promise<Snip[]>;
  getSnip(id: number): Promise<Snip | undefined>;
  getSnipWithAgent(id: number): Promise<any>;
  updateSnipEngagement(id: number, type: 'likes' | 'comments' | 'shares' | 'views', increment: number): Promise<void>;
  getUserSnipInteraction(userId: string, snipId: number, type: string): Promise<any>;
  getSnipComments(snipId: number): Promise<any[]>;
  addSnipLike(userId: string, snipId: number): Promise<void>;
  removeSnipLike(userId: string, snipId: number): Promise<void>;
  addSnipShare(userId: string, snipId: number): Promise<void>;
  addSnipComment(userId: string, snipId: number, content: string): Promise<void>;
  addSnipView(userId: string, snipId: number): Promise<void>;
  
  // Conversation operations
  getOrCreateConversation(userId: string, agentId: number): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number, limit?: number): Promise<Message[]>;
  
  // Interaction operations
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getUserInteractions(userId: string, type?: string): Promise<Interaction[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  
  // Agent connection operations
  createAgentConnection(connection: InsertAgentConnection): Promise<AgentConnection>;
  getAgentConnections(agentId: number): Promise<AgentConnection[]>;
  
  // Analytics operations
  getAgentPerformance(userId: string): Promise<any[]>;
  getTrendingTopics(limit?: number): Promise<any[]>;
  getUserAnalytics(userId: string): Promise<any>;
  
  // MemPod operations
  createMemPodItem(item: InsertMemPodItem): Promise<MemPodItem>;
  getUserMemPodItems(userId: string, type?: string): Promise<MemPodItem[]>;
  getMemPodItem(id: number): Promise<MemPodItem | undefined>;
  updateMemPodItem(id: number, updates: Partial<InsertMemPodItem>): Promise<MemPodItem>;
  deleteMemPodItem(id: number): Promise<void>;
  
  // Goal metrics operations
  createGoalMetric(metric: InsertGoalMetric): Promise<GoalMetric>;
  getGoalMetrics(goalId: number): Promise<GoalMetric[]>;
  updateGoalMetric(id: number, updates: Partial<InsertGoalMetric>): Promise<GoalMetric>;
  deleteGoalMetric(id: number): Promise<void>;
  
  // Goal progress operations
  addGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress>;
  getMetricProgress(metricId: number): Promise<GoalProgress[]>;
  updateGoalOverallProgress(goalId: number): Promise<void>;
  
  // Search operations
  searchSnips(query: string): Promise<any[]>;
  searchWhispers(query: string): Promise<any[]>;

  // Mempod Knowledge operations
  getMempodKnowledge(userId: string): Promise<MempodKnowledge[]>;
  createMempodKnowledge(knowledge: InsertMempodKnowledge): Promise<MempodKnowledge>;
  updateMempodKnowledge(id: number, updates: Partial<InsertMempodKnowledge>): Promise<MempodKnowledge>;
  deleteMempodKnowledge(id: number): Promise<void>;

  // Mempod Notes operations
  getMempodNotes(userId: string): Promise<MempodNote[]>;
  createMempodNote(note: InsertMempodNote): Promise<MempodNote>;
  updateMempodNote(id: number, updates: Partial<InsertMempodNote>): Promise<MempodNote>;
  deleteMempodNote(id: number): Promise<void>;

  // Mempod Goals operations
  getMempodGoals(userId: string): Promise<MempodGoal[]>;
  createMempodGoal(goal: InsertMempodGoal): Promise<MempodGoal>;
  updateMempodGoal(id: number, updates: Partial<InsertMempodGoal>): Promise<MempodGoal>;
  deleteMempodGoal(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Agent operations
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(assistants).values(agent).returning();
    return newAgent;
  }

  async getUserAgents(userId: string): Promise<Agent[]> {
    return await db
      .select()
      .from(assistants)
      .where(eq(assistants.userId, userId))
      .orderBy(desc(assistants.createdAt));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(assistants).where(eq(assistants.id, id));
    return agent;
  }

  async getAgentByAlias(alias: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(assistants).where(eq(assistants.alias, alias));
    return agent;
  }

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent> {
    const [agent] = await db
      .update(assistants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assistants.id, id))
      .returning();
    return agent;
  }

  async deleteAgent(id: number): Promise<void> {
    await db.delete(assistants).where(eq(assistants.id, id));
  }

  // Following system implementation
  async followAssistant(followerId: number, followingId: number): Promise<void> {
    // Insert follow relationship
    await db.insert(assistantFollows).values({
      followerId,
      followingId,
    }).onConflictDoNothing();

    // Update follow counts
    await Promise.all([
      this.updateFollowCounts(followerId),
      this.updateFollowCounts(followingId),
    ]);
  }

  async unfollowAssistant(followerId: number, followingId: number): Promise<void> {
    await db.delete(assistantFollows)
      .where(and(
        eq(assistantFollows.followerId, followerId),
        eq(assistantFollows.followingId, followingId)
      ));

    // Update follow counts
    await Promise.all([
      this.updateFollowCounts(followerId),
      this.updateFollowCounts(followingId),
    ]);
  }

  async getAssistantFollowers(assistantId: number): Promise<Agent[]> {
    const followers = await db
      .select()
      .from(assistantFollows)
      .innerJoin(assistants, eq(assistantFollows.followerId, assistants.id))
      .where(eq(assistantFollows.followingId, assistantId))
      .orderBy(desc(assistantFollows.createdAt));

    return followers.map(f => f.assistants);
  }

  async getAssistantFollowing(assistantId: number): Promise<Agent[]> {
    const following = await db
      .select()
      .from(assistantFollows)
      .innerJoin(assistants, eq(assistantFollows.followingId, assistants.id))
      .where(eq(assistantFollows.followerId, assistantId))
      .orderBy(desc(assistantFollows.createdAt));

    return following.map(f => f.assistants);
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(assistantFollows)
      .where(and(
        eq(assistantFollows.followerId, followerId),
        eq(assistantFollows.followingId, followingId)
      ));

    return result[0].count > 0;
  }

  async getRecommendedAssistants(userId: string, limit = 10): Promise<Agent[]> {
    // Get user's own assistant to exclude from recommendations
    const userAssistant = await this.getUserAssistant(userId);
    const excludeIds = userAssistant ? [userAssistant.id] : [];

    // Get assistants the user is already following
    if (userAssistant) {
      const following = await this.getAssistantFollowing(userAssistant.id);
      excludeIds.push(...following.map(a => a.id));
    }

    // Get recommended assistants (most active, excluding already followed)
    const recommended = await db
      .select()
      .from(assistants)
      .where(and(
        eq(assistants.isActive, true),
        excludeIds.length > 0 ? sql`${assistants.id} NOT IN (${excludeIds.join(',')})` : sql`1=1`
      ))
      .orderBy(desc(assistants.followersCount), desc(assistants.totalEngagement))
      .limit(limit);

    return recommended;
  }

  async updateFollowCounts(assistantId: number): Promise<void> {
    // Count followers
    const [followersResult] = await db
      .select({ count: count() })
      .from(assistantFollows)
      .where(eq(assistantFollows.followingId, assistantId));

    // Count following
    const [followingResult] = await db
      .select({ count: count() })
      .from(assistantFollows)
      .where(eq(assistantFollows.followerId, assistantId));

    // Update the assistant record
    await db
      .update(assistants)
      .set({
        followersCount: followersResult.count,
        followingCount: followingResult.count,
        updatedAt: new Date(),
      })
      .where(eq(assistants.id, assistantId));
  }

  // Assistant operations (single assistant per user)
  async getUserAssistant(userId: string): Promise<Agent | undefined> {
    const [assistant] = await db
      .select()
      .from(assistants)
      .where(eq(assistants.userId, userId))
      .limit(1);
    return assistant;
  }

  async saveUserAssistant(assistantData: any): Promise<Agent> {
    // Check if user already has an assistant
    const existing = await this.getUserAssistant(assistantData.userId);
    
    if (existing) {
      // Update existing assistant
      const [updated] = await db
        .update(assistants)
        .set({
          name: assistantData.name,
          communicationStyle: assistantData.communicationStyle,
          tone: assistantData.tone,
          expertiseLevel: assistantData.expertiseLevel,
          contentPreferences: assistantData.contentPreferences,
          interests: assistantData.interests,
          socialMediaProfiles: assistantData.socialMediaProfiles,
          rssFeeds: assistantData.rssFeeds,
          keyPeopleToMonitor: assistantData.keyPeopleToMonitor,
          briefingSchedule: assistantData.briefingSchedule,
          qualityThreshold: assistantData.qualityThreshold,
          recencyWeight: assistantData.recencyWeight,
          activeTasks: assistantData.activeTasks,
          autonomyLevel: assistantData.autonomyLevel,
          postsPerDay: assistantData.postsPerDay,
          postVisibility: assistantData.postVisibility,
          approvalPromptTemplate: assistantData.approvalPromptTemplate,
          engagementStrategy: assistantData.engagementStrategy,
          contentGuidelines: assistantData.contentGuidelines,
          safetySettings: assistantData.safetySettings,
          updatedAt: new Date(),
        })
        .where(eq(assistants.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new assistant
      const [newAssistant] = await db
        .insert(assistants)
        .values({
          userId: assistantData.userId,
          name: assistantData.name || 'Watch Tower',
          alias: `${assistantData.userId}_assistant`.toLowerCase(),
          description: 'Your personal AI intelligence companion',
          expertise: 'Personal Assistant',
          communicationStyle: assistantData.communicationStyle,
          tone: assistantData.tone,
          expertiseLevel: assistantData.expertiseLevel,
          contentPreferences: assistantData.contentPreferences,
          interests: assistantData.interests,
          socialMediaProfiles: assistantData.socialMediaProfiles,
          rssFeeds: assistantData.rssFeeds,
          keyPeopleToMonitor: assistantData.keyPeopleToMonitor,
          briefingSchedule: assistantData.briefingSchedule,
          qualityThreshold: assistantData.qualityThreshold,
          recencyWeight: assistantData.recencyWeight,
          activeTasks: assistantData.activeTasks,
          autonomyLevel: assistantData.autonomyLevel,
          postsPerDay: assistantData.postsPerDay,
          postVisibility: assistantData.postVisibility,
          approvalPromptTemplate: assistantData.approvalPromptTemplate,
          engagementStrategy: assistantData.engagementStrategy,
          contentGuidelines: assistantData.contentGuidelines,
          safetySettings: assistantData.safetySettings,
          isActive: true,
        })
        .returning();
      return newAssistant;
    }
  }

  // Whisper operations
  async createWhisper(whisper: InsertWhisper): Promise<Whisper> {
    const [newWhisper] = await db.insert(whispers).values(whisper).returning();
    return newWhisper;
  }

  async getUserWhispers(userId: string, limit = 50): Promise<Whisper[]> {
    return await db
      .select()
      .from(whispers)
      .where(eq(whispers.userId, userId))
      .orderBy(desc(whispers.createdAt))
      .limit(limit);
  }

  async getWhisper(id: number): Promise<Whisper | undefined> {
    const [whisper] = await db.select().from(whispers).where(eq(whispers.id, id));
    return whisper;
  }

  async updateWhisperStatus(id: number, status: string, processedAt?: Date): Promise<Whisper> {
    const [whisper] = await db
      .update(whispers)
      .set({ status, processedAt })
      .where(eq(whispers.id, id))
      .returning();
    return whisper;
  }

  // Snip operations
  async createSnip(snip: InsertSnip): Promise<Snip> {
    const [newSnip] = await db.insert(snips).values(snip).returning();
    return newSnip;
  }

  async getPublicSnips(limit = 20, offset = 0): Promise<Snip[]> {
    return await db
      .select()
      .from(snips)
      .where(eq(snips.isPublic, true))
      .orderBy(desc(snips.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserSnips(userId: string, limit = 20): Promise<Snip[]> {
    return await db
      .select()
      .from(snips)
      .where(eq(snips.userId, userId))
      .orderBy(desc(snips.createdAt))
      .limit(limit);
  }

  async getAgentSnips(agentId: number, limit = 20): Promise<Snip[]> {
    return await db
      .select()
      .from(snips)
      .where(eq(snips.assistantId, agentId))
      .orderBy(desc(snips.createdAt))
      .limit(limit);
  }

  async getSnip(id: number): Promise<Snip | undefined> {
    const [snip] = await db.select().from(snips).where(eq(snips.id, id));
    return snip;
  }

  async updateSnipEngagement(id: number, type: 'likes' | 'comments' | 'shares' | 'views', increment: number): Promise<void> {
    await db
      .update(snips)
      .set({ [type]: sql`${snips[type]} + ${increment}` })
      .where(eq(snips.id, id));
  }

  async getSnipWithAssistant(id: number): Promise<any> {
    const [result] = await db
      .select({
        id: snips.id,
        whisperId: snips.whisperId,
        assistantId: snips.assistantId,
        userId: snips.userId,
        title: snips.title,
        content: snips.content,
        excerpt: snips.excerpt,
        type: snips.type,
        createdAt: snips.createdAt,
        resonanceScore: snips.resonanceScore,
        agent: {
          id: assistants.id,
          name: assistants.name,
          alias: assistants.alias,
          avatar: assistants.avatar,
          personality: assistants.personality,
          expertise: assistants.expertise
        }
      })
      .from(snips)
      .leftJoin(assistants, eq(snips.assistantId, assistants.id))
      .where(eq(snips.id, id));
    
    if (!result) {
      return undefined;
    }

    // Calculate real-time engagement counts
    const [likesCount] = await db.select({ count: count() }).from(snipLikes).where(eq(snipLikes.snipId, id));
    const [sharesCount] = await db.select({ count: count() }).from(snipShares).where(eq(snipShares.snipId, id));
    const [commentsCount] = await db.select({ count: count() }).from(snips).where(and(eq(snips.parentId, id), eq(snips.type, "comment")));
    const [viewsCount] = await db.select({ count: count() }).from(snipViews).where(eq(snipViews.snipId, id));

    return {
      ...result,
      likes: likesCount.count,
      shares: sharesCount.count,
      comments: commentsCount.count,
      views: viewsCount.count,
    };
  }

  async getUserSnipInteraction(userId: string, snipId: number, type: string): Promise<any> {
    if (type === 'like') {
      const [like] = await db
        .select()
        .from(snipLikes)
        .where(and(eq(snipLikes.userId, userId), eq(snipLikes.snipId, snipId)));
      return like;
    }
    
    const [interaction] = await db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.userId, userId),
          eq(interactions.snipId, snipId),
          eq(interactions.type, type)
        )
      );
    
    return interaction;
  }

  async getSnipComments(snipId: number): Promise<any[]> {
    const comments = await db
      .select({
        id: interactions.id,
        userId: interactions.userId,
        snipId: interactions.snipId,
        content: interactions.metadata,
        createdAt: interactions.createdAt,
        user: {
          name: users.firstName,
          avatar: users.profileImageUrl,
        }
      })
      .from(interactions)
      .innerJoin(users, eq(interactions.userId, users.id))
      .where(and(eq(interactions.snipId, snipId), eq(interactions.type, "comment")))
      .orderBy(desc(interactions.createdAt));
    
    // Transform the results to match the expected format
    return comments.map(comment => ({
      id: comment.id,
      userId: comment.userId,
      snipId: comment.snipId,
      content: (comment.content as any)?.content || '',
      createdAt: comment.createdAt,
      user: {
        name: comment.user.name || 'Anonymous',
        avatar: comment.user.avatar || 'from-blue-500 to-purple-600',
      }
    }));
  }

  async addSnipLike(userId: string, snipId: number): Promise<void> {
    await db.insert(snipLikes).values({ userId, snipId });
  }

  async removeSnipLike(userId: string, snipId: number): Promise<void> {
    await db.delete(snipLikes).where(and(eq(snipLikes.userId, userId), eq(snipLikes.snipId, snipId)));
  }

  async addSnipShare(userId: string, snipId: number): Promise<void> {
    await db.insert(snipShares).values({ userId, snipId });
  }

  async addSnipComment(userId: string, snipId: number, content: string): Promise<void> {
    // Add comment as an interaction
    await db.insert(interactions).values({
      userId,
      snipId,
      type: "comment",
      metadata: { content },
      createdAt: new Date(),
    });

    // Update the snip's comment count
    await db.update(snips)
      .set({ comments: sql`${snips.comments} + 1` })
      .where(eq(snips.id, snipId));
  }

  async addSnipView(userId: string, snipId: number): Promise<void> {
    await db.insert(snipViews).values({ userId, snipId }).onConflictDoNothing();
  }

  async getPublicSnipsWithAgents(limit = 20, offset = 0): Promise<any[]> {
    // Get snips with engagement counts directly from the snips table
    const snipsData = await db
      .select({
        id: snips.id,
        whisperId: snips.whisperId,
        assistantId: snips.assistantId,
        userId: snips.userId,
        title: snips.title,
        content: snips.content,
        excerpt: snips.excerpt,
        type: snips.type,
        likes: snips.likes,
        comments: snips.comments,
        shares: snips.shares,
        views: snips.views,
        resonanceScore: snips.resonanceScore,
        createdAt: snips.createdAt,
        agent: {
          id: assistants.id,
          name: assistants.name,
          alias: assistants.alias,
          avatar: assistants.avatar,
          personality: assistants.personality,
          expertise: assistants.expertise
        }
      })
      .from(snips)
      .leftJoin(assistants, eq(snips.assistantId, assistants.id))
      .where(and(isNull(snips.parentId), eq(snips.isPublic, true))) // Only root snips that are public
      .orderBy(desc(snips.createdAt))
      .limit(limit)
      .offset(offset);

    return snipsData;
  }

  // Conversation operations
  async getOrCreateConversation(userId: string, agentId: number): Promise<Conversation> {
    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.agentId, agentId)));

    if (existing) {
      return existing;
    }

    const [newConversation] = await db
      .insert(conversations)
      .values({ userId, agentId })
      .returning();
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const results = await db
      .select({
        id: conversations.id,
        userId: conversations.userId,
        agentId: conversations.agentId,
        lastMessageAt: conversations.lastMessageAt,
        unreadCount: conversations.unreadCount,
        agent: {
          id: assistants.id,
          name: assistants.name,
          alias: assistants.alias,
          avatar: assistants.avatar,
          isActive: assistants.isActive,
        },
        lastMessage: {
          id: messages.id,
          content: messages.content,
          sender: messages.sender,
          createdAt: messages.createdAt,
        }
      })
      .from(conversations)
      .leftJoin(assistants, eq(conversations.agentId, assistants.id))
      .leftJoin(messages, eq(conversations.id, messages.conversationId))
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastMessageAt));

    // Group by conversation and get the latest message for each
    const conversationMap = new Map();
    
    for (const row of results) {
      const convId = row.id;
      if (!conversationMap.has(convId)) {
        const lastMessage = row.lastMessage ? {
          ...row.lastMessage,
          isFromUser: row.lastMessage.sender === "user"
        } : null;
        
        conversationMap.set(convId, {
          id: row.id,
          userId: row.userId,
          agentId: row.agentId,
          lastMessageAt: row.lastMessageAt,
          unreadCount: row.unreadCount,
          agent: row.agent,
          lastMessage: lastMessage?.content || "No messages yet"
        });
      } else {
        // Update with more recent message if found
        const existing = conversationMap.get(convId);
        if (row.lastMessage && row.lastMessage.createdAt && existing.lastMessage && 
            row.lastMessage.createdAt > existing.lastMessage.createdAt) {
          existing.lastMessage = row.lastMessage.content;
        }
      }
    }

    return Array.from(conversationMap.values());
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update conversation
    await db
      .update(conversations)
      .set({
        lastMessage: message.content,
        lastMessageAt: new Date(),
        messageCount: sql`${conversations.messageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async getConversationMessages(conversationId: number, limit = 50): Promise<Message[]> {
    const rawMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    // Convert sender field to isFromUser for frontend compatibility
    return rawMessages.map(msg => ({
      ...msg,
      isFromUser: msg.sender === "user"
    }));
  }

  // Interaction operations
  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const [newInteraction] = await db.insert(interactions).values(interaction).returning();
    
    // Update snip engagement
    if (interaction.type === 'like') {
      await this.updateSnipEngagement(interaction.snipId, 'likes', 1);
    } else if (interaction.type === 'share') {
      await this.updateSnipEngagement(interaction.snipId, 'shares', 1);
    } else if (interaction.type === 'view') {
      await this.updateSnipEngagement(interaction.snipId, 'views', 1);
    }

    return newInteraction;
  }

  async getUserInteractions(userId: string, type?: string): Promise<Interaction[]> {
    const conditions = [eq(interactions.userId, userId)];
    if (type) {
      conditions.push(eq(interactions.type, type));
    }

    return await db
      .select()
      .from(interactions)
      .where(and(...conditions))
      .orderBy(desc(interactions.createdAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    return await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Agent connection operations
  async createAgentConnection(connection: InsertAgentConnection): Promise<AgentConnection> {
    const [newConnection] = await db.insert(agentConnections).values(connection).returning();
    return newConnection;
  }

  async getAgentConnections(agentId: number): Promise<AgentConnection[]> {
    return await db
      .select()
      .from(agentConnections)
      .where(or(eq(agentConnections.fromAgentId, agentId), eq(agentConnections.toAgentId, agentId)))
      .orderBy(desc(agentConnections.createdAt));
  }

  // Analytics operations
  async getAgentPerformance(userId: string): Promise<any[]> {
    return await db
      .select({
        id: agents.id,
        name: agents.name,
        expertise: agents.expertise,
        avatar: agents.avatar,
        performanceScore: agents.performanceScore,
        totalSnips: agents.totalSnips,
        totalEngagement: agents.totalEngagement,
      })
      .from(agents)
      .where(eq(agents.userId, userId))
      .orderBy(desc(agents.performanceScore));
  }

  async getTrendingTopics(limit = 10): Promise<any[]> {
    // This would be more complex in a real implementation
    // For now, return some mock trending data structure
    return [];
  }

  // Get all resonances for a user (for clustering analysis)
  async getAllUserResonances(userId: string): Promise<any[]> {
    try {
      // Get all resonances where user owns either the origin or resonating snip
      const userResonances = await db.execute(sql`
        SELECT 
          r.*,
          os.title as origin_title,
          rs.title as resonating_title
        FROM resonances r
        LEFT JOIN snips os ON r.snip_id = os.id
        LEFT JOIN snips rs ON r.resonating_snip_id = rs.id
        WHERE os.user_id = ${userId} OR rs.user_id = ${userId}
        ORDER BY r.score DESC
      `);
      
      return userResonances.rows.map((row: any) => ({
        id: row.id,
        originSnipId: row.snip_id,
        resonatingSnipId: row.resonating_snip_id,
        score: parseFloat(row.score) || 0,
        explanation: row.explanation,
        originTitle: row.origin_title,
        resonatingTitle: row.resonating_title,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching all user resonances:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId: string): Promise<any> {
    const [userStats] = await db
      .select({
        totalSnips: count(snips.id),
        totalEngagement: sql<number>`sum(${snips.likes} + ${snips.comments} + ${snips.shares})`,
      })
      .from(snips)
      .where(eq(snips.userId, userId));

    return userStats;
  }

  // MemPod operations
  async createMemPodItem(item: InsertMemPodItem): Promise<MemPodItem> {
    const [newItem] = await db.insert(mempodItems).values(item).returning();
    return newItem;
  }

  async getUserMemPodItems(userId: string, type?: string): Promise<MemPodItem[]> {
    if (type) {
      return await db
        .select()
        .from(mempodItems)
        .where(and(eq(mempodItems.userId, userId), eq(mempodItems.type, type)))
        .orderBy(desc(mempodItems.createdAt));
    }
    
    return await db
      .select()
      .from(mempodItems)
      .where(eq(mempodItems.userId, userId))
      .orderBy(desc(mempodItems.createdAt));
  }

  async getMemPodItem(id: number): Promise<MemPodItem | undefined> {
    const [item] = await db.select().from(mempodItems).where(eq(mempodItems.id, id));
    return item;
  }

  async updateMemPodItem(id: number, updates: Partial<InsertMemPodItem>): Promise<MemPodItem> {
    const [updatedItem] = await db
      .update(mempodItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mempodItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMemPodItem(id: number): Promise<void> {
    await db.delete(mempodItems).where(eq(mempodItems.id, id));
  }

  // Goal metrics operations
  async createGoalMetric(metric: InsertGoalMetric): Promise<GoalMetric> {
    const [newMetric] = await db.insert(goalMetrics).values(metric).returning();
    return newMetric;
  }

  async getGoalMetrics(goalId: number): Promise<GoalMetric[]> {
    return await db
      .select()
      .from(goalMetrics)
      .where(eq(goalMetrics.goalId, goalId))
      .orderBy(goalMetrics.createdAt);
  }

  async updateGoalMetric(id: number, updates: Partial<InsertGoalMetric>): Promise<GoalMetric> {
    const [updatedMetric] = await db
      .update(goalMetrics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goalMetrics.id, id))
      .returning();
    return updatedMetric;
  }

  async deleteGoalMetric(id: number): Promise<void> {
    await db.delete(goalMetrics).where(eq(goalMetrics.id, id));
  }

  // Goal progress operations
  async addGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress> {
    const [newProgress] = await db.insert(goalProgress).values(progress).returning();
    
    // Update the metric's current value
    await db
      .update(goalMetrics)
      .set({ currentValue: progress.value, updatedAt: new Date() })
      .where(eq(goalMetrics.id, progress.metricId));
    
    // Update overall goal progress
    const metric = await db.select().from(goalMetrics).where(eq(goalMetrics.id, progress.metricId)).limit(1);
    if (metric[0]) {
      await this.updateGoalOverallProgress(metric[0].goalId);
    }
    
    return newProgress;
  }

  async getMetricProgress(metricId: number): Promise<GoalProgress[]> {
    return await db
      .select()
      .from(goalProgress)
      .where(eq(goalProgress.metricId, metricId))
      .orderBy(desc(goalProgress.recordedAt));
  }

  async updateGoalOverallProgress(goalId: number): Promise<void> {
    // Get all metrics for this goal
    const metrics = await db
      .select()
      .from(goalMetrics)
      .where(eq(goalMetrics.goalId, goalId));
    
    if (metrics.length === 0) return;
    
    // Calculate overall progress as average of all metric progress percentages
    let totalProgress = 0;
    for (const metric of metrics) {
      const progressPercentage = Math.min(100, ((metric.currentValue || 0) / metric.targetValue) * 100);
      totalProgress += progressPercentage;
    }
    
    const overallProgress = Math.round(totalProgress / metrics.length);
    
    // Update the goal's progress
    await db
      .update(mempodItems)
      .set({ progress: overallProgress, updatedAt: new Date() })
      .where(eq(mempodItems.id, goalId));
  }

  // Search operations
  async searchSnips(query: string): Promise<any[]> {
    const results = await db
      .select({
        id: snips.id,
        title: snips.title,
        content: snips.content,
        createdAt: snips.createdAt,
        author: agents.name,
        type: sql<string>`'snip'`,
      })
      .from(snips)
      .leftJoin(agents, eq(snips.assistantId, agents.id))
      .where(
        and(
          eq(snips.isPublic, true),
          or(
            ilike(snips.title, `%${query}%`),
            ilike(snips.content, `%${query}%`)
          )
        )
      )
      .orderBy(desc(snips.createdAt))
      .limit(10);

    return results;
  }

  async searchWhispers(query: string): Promise<any[]> {
    const results = await db
      .select({
        id: whispers.id,
        title: whispers.content,
        content: whispers.content,
        createdAt: whispers.createdAt,
        type: sql<string>`'whisper'`,
      })
      .from(whispers)
      .where(
        ilike(whispers.content, `%${query}%`)
      )
      .orderBy(desc(whispers.createdAt))
      .limit(10);

    return results;
  }

  // Mempod Knowledge operations
  async getMempodKnowledge(userId: string): Promise<MempodKnowledge[]> {
    return await db
      .select()
      .from(mempodKnowledge)
      .where(eq(mempodKnowledge.userId, userId))
      .orderBy(desc(mempodKnowledge.createdAt));
  }

  async createMempodKnowledge(knowledge: InsertMempodKnowledge): Promise<MempodKnowledge> {
    const [newKnowledge] = await db
      .insert(mempodKnowledge)
      .values({ ...knowledge, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return newKnowledge;
  }

  async updateMempodKnowledge(id: number, updates: Partial<InsertMempodKnowledge>): Promise<MempodKnowledge> {
    const [updated] = await db
      .update(mempodKnowledge)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mempodKnowledge.id, id))
      .returning();
    return updated;
  }

  async deleteMempodKnowledge(id: number): Promise<void> {
    await db.delete(mempodKnowledge).where(eq(mempodKnowledge.id, id));
  }

  // Mempod Notes operations
  async getMempodNotes(userId: string): Promise<MempodNote[]> {
    return await db
      .select()
      .from(mempodNotes)
      .where(eq(mempodNotes.userId, userId))
      .orderBy(desc(mempodNotes.isPinned), desc(mempodNotes.createdAt));
  }

  async createMempodNote(note: InsertMempodNote): Promise<MempodNote> {
    const [newNote] = await db
      .insert(mempodNotes)
      .values({ ...note, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return newNote;
  }

  async updateMempodNote(id: number, updates: Partial<InsertMempodNote>): Promise<MempodNote> {
    const [updated] = await db
      .update(mempodNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mempodNotes.id, id))
      .returning();
    return updated;
  }

  async deleteMempodNote(id: number): Promise<void> {
    await db.delete(mempodNotes).where(eq(mempodNotes.id, id));
  }

  // Mempod Goals operations
  async getMempodGoals(userId: string): Promise<MempodGoal[]> {
    return await db
      .select()
      .from(mempodGoals)
      .where(eq(mempodGoals.userId, userId))
      .orderBy(desc(mempodGoals.createdAt));
  }

  async createMempodGoal(goal: InsertMempodGoal): Promise<MempodGoal> {
    const [newGoal] = await db
      .insert(mempodGoals)
      .values({ ...goal, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return newGoal;
  }

  async updateMempodGoal(id: number, updates: Partial<InsertMempodGoal>): Promise<MempodGoal> {
    const [updated] = await db
      .update(mempodGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mempodGoals.id, id))
      .returning();
    return updated;
  }

  async deleteMempodGoal(id: number): Promise<void> {
    await db.delete(mempodGoals).where(eq(mempodGoals.id, id));
  }
}

export const storage = new DatabaseStorage();
