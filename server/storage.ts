import {
  users,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Agent operations
  createAgent(agent: InsertAgent): Promise<Agent>;
  getUserAgents(userId: string): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: number): Promise<void>;
  
  // Whisper operations
  createWhisper(whisper: InsertWhisper): Promise<Whisper>;
  getUserWhispers(userId: string, limit?: number): Promise<Whisper[]>;
  getWhisper(id: number): Promise<Whisper | undefined>;
  updateWhisperStatus(id: number, status: string, processedAt?: Date): Promise<Whisper>;
  
  // Snip operations
  createSnip(snip: InsertSnip): Promise<Snip>;
  getPublicSnips(limit?: number, offset?: number): Promise<Snip[]>;
  getUserSnips(userId: string, limit?: number): Promise<Snip[]>;
  getAgentSnips(agentId: number, limit?: number): Promise<Snip[]>;
  getSnip(id: number): Promise<Snip | undefined>;
  updateSnipEngagement(id: number, type: 'likes' | 'comments' | 'shares' | 'views', increment: number): Promise<void>;
  
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
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async getUserAgents(userId: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent> {
    const [agent] = await db
      .update(agents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent;
  }

  async deleteAgent(id: number): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
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
      .where(eq(snips.agentId, agentId))
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
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastMessageAt));
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
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
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
      const progressPercentage = Math.min(100, (metric.currentValue / metric.targetValue) * 100);
      totalProgress += progressPercentage;
    }
    
    const overallProgress = Math.round(totalProgress / metrics.length);
    
    // Update the goal's progress
    await db
      .update(mempodItems)
      .set({ progress: overallProgress, updatedAt: new Date() })
      .where(eq(mempodItems.id, goalId));
  }
}

export const storage = new DatabaseStorage();
