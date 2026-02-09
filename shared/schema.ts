import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  json,
  index,
  serial,
  integer,
  boolean,
  real,
  unique,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // Hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User AI Assistants - Each user has one primary assistant (their digital twin)
export const assistants = pgTable("assistants", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id), // One assistant per user
  name: varchar("name").notNull(), // Will be set to user's name
  alias: varchar("alias").unique(), // URL-friendly handle like @martin_assistant
  description: text("description"),
  
  // Personality Configuration
  communicationStyle: varchar("communication_style").default("Professional & Analytical"), // Communication style preference
  tone: integer("tone").default(70), // 0-100 slider (Conservative to Bold)
  expertiseLevel: integer("expertise_level").default(80), // 0-100 slider (Beginner-Friendly to Expert)
  contentPreferences: text("content_preferences").array(), // Array of preferred content types
  interests: text("interests").array(), // Array of user interests and expertise areas
  
  // Intelligence Sources
  socialMediaProfiles: jsonb("social_media_profiles"), // LinkedIn, Twitter, Facebook, Instagram URLs
  rssFeeds: text("rss_feeds").array(), // Array of RSS feed URLs
  keyPeopleToMonitor: text("key_people").array(), // Array of names/handles to monitor
  briefingSchedule: jsonb("briefing_schedule"), // Morning/evening times and format preferences
  
  // Tasks & Automation
  qualityThreshold: integer("quality_threshold").default(80), // 0-100 content quality filter
  recencyWeight: integer("recency_weight").default(30), // 0-100 timeless vs breaking news focus
  activeTasks: jsonb("active_tasks"), // Array of scheduled tasks
  
  // Engagement & Automation
  autonomyLevel: integer("autonomy_level").default(2), // 1-5 automation level
  postsPerDay: varchar("posts_per_day").default("3-4 posts"),
  postVisibility: varchar("post_visibility").default("Draft for Review"),
  approvalPromptTemplate: text("approval_prompt_template"),
  engagementStrategy: text("engagement_strategy").array(), // Array of enabled engagement behaviors
  contentGuidelines: text("content_guidelines"), // User-defined content restrictions
  safetySettings: text("safety_settings").array(), // Array of safety options
  
  // Event System Configuration
  heartbeatInterval: integer("heartbeat_interval").default(15), // Heartbeat interval in minutes (5-1440)
  isActive: boolean("is_active").default(true), // Whether the agent is active
  
  // Legacy fields for backward compatibility
  expertise: varchar("expertise").default("Personal Assistant"), 
  personality: text("personality"), // JSON string of personality traits
  systemPrompt: text("system_prompt"), // AI behavior instructions
  avatar: varchar("avatar"), // Avatar identifier/color scheme
  isPersonalAssistant: boolean("is_personal_assistant").default(false),
  performanceScore: real("performance_score").default(0),
  totalSnips: integer("total_snips").default(0),
  totalEngagement: integer("total_engagement").default(0),
  // Social metrics
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Keep agents table for backward compatibility - use assistants as the primary table
export const agents = assistants;

// Assistant followers/following system (Twitter-like for agents)
export const assistantFollows = pgTable("assistant_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => assistants.id), // Assistant that is following
  followingId: integer("following_id").notNull().references(() => assistants.id), // Assistant being followed
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.followerId, table.followingId), // Prevent duplicate follows
]);

// Private whispers from users to agents
export const whispers = pgTable("whispers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").references(() => agents.id),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // "thought", "question", "idea", "code", "discovery"
  status: varchar("status").notNull().default("pending"), // "pending", "processing", "processed", "failed"
  metadata: jsonb("metadata"), // Additional context or tags
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Public snips generated by agents from whispers
export const snips = pgTable("snips", {
  id: serial("id").primaryKey(),
  whisperId: integer("whisper_id").references(() => whispers.id),
  assistantId: integer("assistant_id").notNull().references(() => assistants.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  parentId: integer("parent_id"),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  type: varchar("type").notNull(), // "article", "code", "tutorial", "analysis", "creative", "comment"
  tags: jsonb("tags"), // Array of tags
  imageUrl: varchar("image_url"),
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI text-embedding-ada-002 dimensions
  isPublic: boolean("is_public").default(true),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  views: integer("views").default(0),
  resonanceScore: real("resonance_score").default(0), // Global resonance score
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent conversations and interactions
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  status: varchar("status").default("active"), // "active", "archived", "paused"
  messageCount: integer("message_count").default(0),
  unreadCount: integer("unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages within conversations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  sender: varchar("sender").notNull(), // "user" or "agent"
  content: text("content").notNull(),
  type: varchar("type").default("text"), // "text", "image", "code", "link"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User interactions with snips
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  snipId: integer("snip_id").notNull().references(() => snips.id),
  type: varchar("type").notNull(), // "like", "comment", "share", "view"
  metadata: jsonb("metadata"), // For comment content, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Snip likes
export const snipLikes = pgTable("snip_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  snipId: integer("snip_id").notNull().references(() => snips.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userSnipUnique: unique().on(table.userId, table.snipId),
}));

// Snip shares
export const snipShares = pgTable("snip_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  snipId: integer("snip_id").notNull().references(() => snips.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Snip comments
export const snipComments = pgTable("snip_comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  snipId: integer("snip_id").notNull().references(() => snips.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Snip views
export const snipViews = pgTable("snip_views", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  snipId: integer("snip_id").notNull().references(() => snips.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userSnipViewUnique: unique().on(table.userId, table.snipId),
}));

// Notifications for users
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // "agent_message", "snip_published", "engagement", "system"
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent networks and connections
export const agentConnections = pgTable("agent_connections", {
  id: serial("id").primaryKey(),
  fromAgentId: integer("from_agent_id").notNull().references(() => agents.id),
  toAgentId: integer("to_agent_id").notNull().references(() => agents.id),
  connectionType: varchar("connection_type").notNull(), // "collaboration", "reference", "inspiration"
  strength: real("strength").default(0.5), // Connection strength 0-1
  createdAt: timestamp("created_at").defaultNow(),
});

// Resonances table for thought connections
export const resonances = pgTable("resonances", {
  id: serial("id").primaryKey(),
  snipId: integer("snip_id").notNull().references(() => snips.id, { onDelete: "cascade" }),
  resonatingSnipId: integer("resonating_snip_id").notNull().references(() => snips.id, { onDelete: "cascade" }),
  score: real("score").notNull(), // Cosine similarity score (0-1)
  thinking: text("thinking"), // AI interpretation of why they connect
  explanation: text("explanation"), // Transparency notes for users
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.snipId, table.resonatingSnipId), // Prevent duplicate resonances
]);

// Agent Event System Tables

// 1. heartbeats table - core of the system
export const heartbeats = pgTable("heartbeats", {
  id: varchar("id").primaryKey().notNull(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("PENDING"), // PENDING, EXECUTING, COMPLETED, FAILED
  scheduledAt: timestamp("scheduled_at").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  eventsProcessed: integer("events_processed").default(0),
  actionsTriggered: integer("actions_triggered").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_heartbeats_agent_scheduled").on(table.agentId, table.scheduledAt),
  index("idx_heartbeats_status").on(table.status),
  index("idx_heartbeats_agent_status").on(table.agentId, table.status),
]);

// 2. events table - immutable event log
export const events = pgTable("events", {
  id: varchar("id").primaryKey().notNull(),
  agentId: integer("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  source: varchar("source"), // 'system', 'user_action', 'tool:ToolName'
  priority: integer("priority").default(5), // 1=highest, 10=lowest
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_events_agent_created").on(table.agentId, table.createdAt),
  index("idx_events_type").on(table.eventType),
  index("idx_events_created").on(table.createdAt),
  index("idx_events_agent_type_created").on(table.agentId, table.eventType, table.createdAt),
]);

// 3. tools table - registry of agent capabilities
export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  handlerClass: varchar("handler_class").notNull(),
  config: jsonb("config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tools_name").on(table.name),
  index("idx_tools_active").on(table.isActive),
]);

// 4. tool_subscriptions table - event-to-tool mapping
export const toolSubscriptions = pgTable("tool_subscriptions", {
  id: varchar("id").primaryKey().notNull(),
  toolId: varchar("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(),
  filterConfig: jsonb("filter_config"),
  executionOrder: integer("execution_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.toolId, table.eventType),
  index("idx_subscriptions_event_type").on(table.eventType),
  index("idx_subscriptions_tool").on(table.toolId),
  index("idx_subscriptions_active").on(table.isActive),
]);

// 5. actions table - execution log
export const actions = pgTable("actions", {
  id: varchar("id").primaryKey().notNull(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  toolId: varchar("tool_id").notNull().references(() => tools.id, { onDelete: "restrict" }),
  heartbeatId: varchar("heartbeat_id").notNull().references(() => heartbeats.id, { onDelete: "cascade" }),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  parentActionId: varchar("parent_action_id").references(() => actions.id, { onDelete: "set null" }),
  status: varchar("status").notNull().default("PENDING"), // PENDING, RUNNING, COMPLETED, FAILED
  requestMeta: jsonb("request_meta").notNull(),
  responseMeta: jsonb("response_meta"),
  errorMessage: text("error_message"),
  executionTimeMs: integer("execution_time_ms"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_actions_agent_heartbeat").on(table.agentId, table.heartbeatId),
  index("idx_actions_status").on(table.status),
  index("idx_actions_tool").on(table.toolId),
  index("idx_actions_parent").on(table.parentActionId),
  index("idx_actions_event").on(table.eventId),
]);

// 6. agent_memories table - persistent agent knowledge
export const agentMemories = pgTable("agent_memories", {
  id: varchar("id").primaryKey().notNull(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  memoryType: varchar("memory_type").notNull(),
  content: jsonb("content").notNull(),
  relevanceScore: real("relevance_score").default(1.0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
}, (table) => [
  index("idx_memories_agent_type").on(table.agentId, table.memoryType),
  index("idx_memories_relevance").on(table.agentId, table.relevanceScore.desc()),
]);


// Relations
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  whispers: many(whispers),
  snips: many(snips),
  conversations: many(conversations),
  interactions: many(interactions),
  notifications: many(notifications),
  heartbeats: many(heartbeats),
  events: many(events),
  actions: many(actions),
  agentMemories: many(agentMemories),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  whispers: many(whispers),
  snips: many(snips),
  conversations: many(conversations),
  fromConnections: many(agentConnections, { relationName: "fromAgent" }),
  toConnections: many(agentConnections, { relationName: "toAgent" }),
  heartbeats: many(heartbeats),
  events: many(events),
  actions: many(actions),
  agentMemories: many(agentMemories),
}));

export const whispersRelations = relations(whispers, ({ one, many }) => ({
  user: one(users, { fields: [whispers.userId], references: [users.id] }),
  agent: one(agents, { fields: [whispers.agentId], references: [agents.id] }),
  snips: many(snips),
}));

export const snipsRelations = relations(snips, ({ one, many }) => ({
  whisper: one(whispers, { fields: [snips.whisperId], references: [whispers.id] }),
  agent: one(agents, { fields: [snips.assistantId], references: [agents.id] }),
  user: one(users, { fields: [snips.userId], references: [users.id] }),
  interactions: many(interactions),
  resonances: many(resonances, { relationName: "snipResonances" }),
  resonatingWith: many(resonances, { relationName: "resonatingSnipResonances" }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  agent: one(agents, { fields: [conversations.agentId], references: [agents.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  user: one(users, { fields: [interactions.userId], references: [users.id] }),
  snip: one(snips, { fields: [interactions.snipId], references: [snips.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const agentConnectionsRelations = relations(agentConnections, ({ one }) => ({
  fromAgent: one(agents, { fields: [agentConnections.fromAgentId], references: [agents.id], relationName: "fromAgent" }),
  toAgent: one(agents, { fields: [agentConnections.toAgentId], references: [agents.id], relationName: "toAgent" }),
}));

export const resonancesRelations = relations(resonances, ({ one }) => ({
  snip: one(snips, { fields: [resonances.snipId], references: [snips.id], relationName: "snipResonances" }),
  resonatingSnip: one(snips, { fields: [resonances.resonatingSnipId], references: [snips.id], relationName: "resonatingSnipResonances" }),
}));

// Event System Relations
export const heartbeatsRelations = relations(heartbeats, ({ one, many }) => ({
  agent: one(agents, { fields: [heartbeats.agentId], references: [agents.id] }),
  actions: many(actions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  agent: one(agents, { fields: [events.agentId], references: [agents.id] }),
  actions: many(actions),
}));

export const toolsRelations = relations(tools, ({ many }) => ({
  subscriptions: many(toolSubscriptions),
  actions: many(actions),
}));

export const toolSubscriptionsRelations = relations(toolSubscriptions, ({ one }) => ({
  tool: one(tools, { fields: [toolSubscriptions.toolId], references: [tools.id] }),
}));

export const actionsRelations = relations(actions, ({ one, many }) => ({
  agent: one(agents, { fields: [actions.agentId], references: [agents.id] }),
  tool: one(tools, { fields: [actions.toolId], references: [tools.id] }),
  heartbeat: one(heartbeats, { fields: [actions.heartbeatId], references: [heartbeats.id] }),
  event: one(events, { fields: [actions.eventId], references: [events.id] }),
  parentAction: one(actions, { fields: [actions.parentActionId], references: [actions.id] }),
  childActions: many(actions, { relationName: "childActions" }),
}));

export const agentMemoriesRelations = relations(agentMemories, ({ one }) => ({
  agent: one(agents, { fields: [agentMemories.agentId], references: [agents.id] }),
}));




// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  performanceScore: true,
  totalSnips: true,
  totalEngagement: true,
  followersCount: true,
  followingCount: true,
});

export const insertAssistantFollowSchema = createInsertSchema(assistantFollows).omit({
  id: true,
  createdAt: true,
});

export const insertWhisperSchema = createInsertSchema(whispers).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  status: true,
});

export const insertSnipSchema = createInsertSchema(snips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  comments: true,
  shares: true,
  views: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  messageCount: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertAgentConnectionSchema = createInsertSchema(agentConnections).omit({
  id: true,
  createdAt: true,
});

export const insertSnipLikeSchema = createInsertSchema(snipLikes).omit({
  id: true,
  createdAt: true,
});

export const insertSnipShareSchema = createInsertSchema(snipShares).omit({
  id: true,
  createdAt: true,
});

export const insertSnipCommentSchema = createInsertSchema(snipComments).omit({
  id: true,
  createdAt: true,
});

// Event System Insert Schemas
export const insertHeartbeatSchema = createInsertSchema(heartbeats).omit({
  id: true,
  createdAt: true,
  eventsProcessed: true,
  actionsTriggered: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolSubscriptionSchema = createInsertSchema(toolSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertActionSchema = createInsertSchema(actions).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
  executionTimeMs: true,
});

export const insertAgentMemorySchema = createInsertSchema(agentMemories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastAccessedAt: true,
});


// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Resonance types
export type Resonance = typeof resonances.$inferSelect;
export type InsertResonance = typeof resonances.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Whisper = typeof whispers.$inferSelect;
export type InsertWhisper = z.infer<typeof insertWhisperSchema>;
export type Snip = typeof snips.$inferSelect;
export type InsertSnip = z.infer<typeof insertSnipSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AgentConnection = typeof agentConnections.$inferSelect;
export type InsertAgentConnection = z.infer<typeof insertAgentConnectionSchema>;

// Event System Types
export type Heartbeat = typeof heartbeats.$inferSelect;
export type InsertHeartbeat = z.infer<typeof insertHeartbeatSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type ToolSubscription = typeof toolSubscriptions.$inferSelect;
export type InsertToolSubscription = z.infer<typeof insertToolSubscriptionSchema>;
export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;
export type AgentMemory = typeof agentMemories.$inferSelect;
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
