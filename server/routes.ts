import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertAgentSchema,
  insertWhisperSchema,
  insertSnipSchema,
  insertMessageSchema,
  insertInteractionSchema,
  insertNotificationSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has any agents, if not create a default one
      const existingAgents = await storage.getUserAgents(userId);
      if (existingAgents.length === 0) {
        const userName = req.user.claims.first_name || req.user.claims.email?.split('@')[0] || 'User';
        await storage.createAgent({
          userId: userId,
          name: `${userName}'s Assistant`,
          description: `Your personal AI companion and content creation assistant. I'm here to help transform your thoughts, observations, and ideas into engaging content.`,
          expertise: 'General Assistant',
          personality: 'Helpful, creative, and insightful. I excel at understanding context and crafting engaging content from your personal thoughts and observations.',
          avatar: 'from-blue-500 to-purple-600',
          isActive: true,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Agent routes
  app.post('/api/agents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agentData = insertAgentSchema.parse({ ...req.body, userId });
      const agent = await storage.createAgent(agentData);
      res.json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(400).json({ message: "Failed to create agent" });
    }
  });

  app.get('/api/agents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agents = await storage.getUserAgents(userId);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get('/api/agents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agent = await storage.getAgent(parseInt(req.params.id));
      if (!agent || agent.userId !== userId) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.get('/api/agents/:id/snips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agentId = parseInt(req.params.id);
      
      // Verify agent ownership
      const agent = await storage.getAgent(agentId);
      if (!agent || agent.userId !== userId) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const snips = await storage.getAgentSnips(agentId);
      res.json(snips);
    } catch (error) {
      console.error("Error fetching agent snips:", error);
      res.status(500).json({ message: "Failed to fetch agent snips" });
    }
  });

  app.put('/api/agents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const updates = req.body;
      const agent = await storage.updateAgent(agentId, updates);
      res.json(agent);
    } catch (error) {
      console.error("Error updating agent:", error);
      res.status(400).json({ message: "Failed to update agent" });
    }
  });

  app.delete('/api/agents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const agentId = parseInt(req.params.id);
      await storage.deleteAgent(agentId);
      res.json({ message: "Agent deleted successfully" });
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Whisper routes
  app.post('/api/whispers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const whisperData = insertWhisperSchema.parse({ ...req.body, userId });
      const whisper = await storage.createWhisper(whisperData);

      // Simulate processing delay and create a snip
      setTimeout(async () => {
        try {
          await storage.updateWhisperStatus(whisper.id, 'processing');
          
          // Simulate AI processing to create a snip
          const agent = await storage.getAgent(whisper.agentId!);
          if (agent) {
            const snipData = {
              whisperId: whisper.id,
              agentId: whisper.agentId!,
              userId,
              title: `Generated content from ${agent.name}`,
              content: `This is AI-generated content based on your whisper: "${whisper.content}". The agent ${agent.name} with expertise in ${agent.expertise} has processed your input and created this comprehensive response.`,
              excerpt: `AI response from ${agent.name}`,
              type: 'article' as const,
              tags: [agent.expertise],
            };

            const snip = await storage.createSnip(snipData);
            await storage.updateWhisperStatus(whisper.id, 'processed', new Date());

            // Create notification
            await storage.createNotification({
              userId,
              type: 'snip_published',
              title: 'New Snip Published',
              content: `Your agent ${agent.name} has created a new snip from your whisper.`,
              metadata: { snipId: snip.id, agentId: agent.id },
            });
          }
        } catch (error) {
          console.error("Error processing whisper:", error);
          await storage.updateWhisperStatus(whisper.id, 'failed');
        }
      }, 2000); // 2 second delay

      res.json(whisper);
    } catch (error) {
      console.error("Error creating whisper:", error);
      res.status(400).json({ message: "Failed to create whisper" });
    }
  });

  app.get('/api/whispers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const whispers = await storage.getUserWhispers(userId, limit);
      res.json(whispers);
    } catch (error) {
      console.error("Error fetching whispers:", error);
      res.status(500).json({ message: "Failed to fetch whispers" });
    }
  });

  // Snip routes
  app.get('/api/snips', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const snips = await storage.getPublicSnips(limit, offset);
      res.json(snips);
    } catch (error) {
      console.error("Error fetching snips:", error);
      res.status(500).json({ message: "Failed to fetch snips" });
    }
  });

  app.get('/api/snips/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const snips = await storage.getUserSnips(userId, limit);
      res.json(snips);
    } catch (error) {
      console.error("Error fetching user snips:", error);
      res.status(500).json({ message: "Failed to fetch user snips" });
    }
  });

  app.get('/api/snips/:id', async (req, res) => {
    try {
      const snip = await storage.getSnip(parseInt(req.params.id));
      if (!snip) {
        return res.status(404).json({ message: "Snip not found" });
      }
      res.json(snip);
    } catch (error) {
      console.error("Error fetching snip:", error);
      res.status(500).json({ message: "Failed to fetch snip" });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations/:agentId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agentId = parseInt(req.params.agentId);
      
      const conversation = await storage.getOrCreateConversation(userId, agentId);
      const messageData = insertMessageSchema.parse({
        conversationId: conversation.id,
        sender: 'user',
        content: req.body.content,
        type: req.body.type || 'text',
      });

      const message = await storage.addMessage(messageData);
      
      // Simulate agent response
      setTimeout(async () => {
        const agent = await storage.getAgent(agentId);
        if (agent) {
          const agentResponse = insertMessageSchema.parse({
            conversationId: conversation.id,
            sender: 'agent',
            content: `This is a response from ${agent.name}. I understand you said: "${req.body.content}". Let me help you with that.`,
            type: 'text',
          });
          await storage.addMessage(agentResponse);
        }
      }, 1000);

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getConversationMessages(conversationId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Interaction routes
  app.post('/api/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const interactionData = insertInteractionSchema.parse({ ...req.body, userId });
      const interaction = await storage.createInteraction(interactionData);
      res.json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(400).json({ message: "Failed to create interaction" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unread === 'true';
      const notifications = await storage.getUserNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/agents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const performance = await storage.getAgentPerformance(userId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching agent performance:", error);
      res.status(500).json({ message: "Failed to fetch agent performance" });
    }
  });

  app.get('/api/analytics/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  // Live activity route
  app.get('/api/live-activity', async (req, res) => {
    try {
      // Mock live activity data - in a real app this would come from recent database activities
      const activities = [
        {
          id: 1,
          type: 'whisper_created',
          title: 'New whisper from Alex Chen',
          description: 'Shared thoughts about sustainable AI development',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          agentName: 'EcoMind',
          agentAvatar: 'EC'
        },
        {
          id: 2,
          type: 'snip_generated',
          title: 'CodeMaster generated a snip',
          description: '5 React Performance Tips That Will Blow Your Mind',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          agentName: 'CodeMaster',
          agentAvatar: 'CM'
        },
        {
          id: 3,
          type: 'agent_connected',
          title: 'New agent connection',
          description: 'TechGuru connected with DataWiz',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          type: 'trending_topic',
          title: '#GenerativeAI trending',
          description: '2,847 posts in the last hour',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: 5,
          type: 'agent_created',
          title: 'Sarah Kim created a new agent',
          description: 'WritingPro - Expert in technical documentation',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          agentName: 'WritingPro',
          agentAvatar: 'WP'
        }
      ];
      res.json(activities);
    } catch (error) {
      console.error("Error fetching live activity:", error);
      res.status(500).json({ message: "Failed to fetch live activity" });
    }
  });

  // MemPod routes
  app.get('/api/mempod', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = req.query.type as string;
      const items = await storage.getUserMemPodItems(userId, type);
      res.json(items);
    } catch (error) {
      console.error("Error fetching mempod items:", error);
      res.status(500).json({ message: "Failed to fetch mempod items" });
    }
  });

  app.post('/api/mempod', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = { ...req.body, userId };
      const item = await storage.createMemPodItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating mempod item:", error);
      res.status(500).json({ message: "Failed to create mempod item" });
    }
  });

  app.put('/api/mempod/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      // Verify ownership
      const existingItem = await storage.getMemPodItem(itemId);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "MemPod item not found" });
      }
      
      const updatedItem = await storage.updateMemPodItem(itemId, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating mempod item:", error);
      res.status(500).json({ message: "Failed to update mempod item" });
    }
  });

  app.delete('/api/mempod/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      // Verify ownership
      const existingItem = await storage.getMemPodItem(itemId);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "MemPod item not found" });
      }
      
      await storage.deleteMemPodItem(itemId);
      res.json({ message: "MemPod item deleted successfully" });
    } catch (error) {
      console.error("Error deleting mempod item:", error);
      res.status(500).json({ message: "Failed to delete mempod item" });
    }
  });

  // Goal metrics routes
  app.get('/api/goals/:id/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify goal ownership
      const goal = await storage.getMemPodItem(goalId);
      if (!goal || goal.userId !== userId || goal.type !== 'goal') {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const metrics = await storage.getGoalMetrics(goalId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching goal metrics:", error);
      res.status(500).json({ message: "Failed to fetch goal metrics" });
    }
  });

  app.post('/api/goals/:id/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify goal ownership
      const goal = await storage.getMemPodItem(goalId);
      if (!goal || goal.userId !== userId || goal.type !== 'goal') {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const metric = await storage.createGoalMetric({ ...req.body, goalId });
      res.json(metric);
    } catch (error) {
      console.error("Error creating goal metric:", error);
      res.status(500).json({ message: "Failed to create goal metric" });
    }
  });

  app.post('/api/metrics/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const metricId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify metric ownership through goal
      const metrics = await storage.getGoalMetrics(0); // We'll need to modify this
      const metric = metrics.find(m => m.id === metricId);
      if (!metric) {
        return res.status(404).json({ message: "Metric not found" });
      }
      
      const goal = await storage.getMemPodItem(metric.goalId);
      if (!goal || goal.userId !== userId) {
        return res.status(404).json({ message: "Metric not found" });
      }
      
      const progress = await storage.addGoalProgress({ ...req.body, metricId });
      res.json(progress);
    } catch (error) {
      console.error("Error adding goal progress:", error);
      res.status(500).json({ message: "Failed to add goal progress" });
    }
  });

  app.get('/api/metrics/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const metricId = parseInt(req.params.id);
      const progress = await storage.getMetricProgress(metricId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching metric progress:", error);
      res.status(500).json({ message: "Failed to fetch metric progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
