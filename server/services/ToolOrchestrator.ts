import { storage } from '../storage';
import { Agent, Heartbeat, Event, Action } from '@shared/schema';
import { BaseTool, ToolRequest, ToolResponse } from '../tools/BaseTool';
import { FeedReaderTool } from '../tools/FeedReaderTool';
import { SnipCreateTool } from '../tools/SnipCreateTool';
import { SnipCommentTool } from '../tools/SnipCommentTool';
import { SnipShareTool } from '../tools/SnipShareTool';
import { SnipLikeTool } from '../tools/SnipLikeTool';
import { MentionHandlerTool } from '../tools/MentionHandlerTool';
import { WhisperHandlerTool } from '../tools/WhisperHandlerTool';
import { RssFeedPostCreateTool } from '../tools/RssFeedPostCreateTool';
import { v4 as uuidv4 } from 'uuid';

export class ToolOrchestrator {
  private tools: Map<string, BaseTool> = new Map();

  constructor() {
    // Register all available tools
    this.registerTool(new FeedReaderTool());
    this.registerTool(new SnipCreateTool());
    this.registerTool(new SnipCommentTool());
    this.registerTool(new SnipShareTool());
    this.registerTool(new SnipLikeTool());
    this.registerTool(new MentionHandlerTool());
    this.registerTool(new WhisperHandlerTool());
    this.registerTool(new RssFeedPostCreateTool());
  }

  /**
   * Register a tool for use
   */
  private registerTool(tool: BaseTool) {
    this.tools.set(tool.name, tool);
    console.log(`Registered tool: ${tool.name}`);
  }

  /**
   * Process events through subscribed tools
   */
  async processEvents(
    agent: Agent,
    heartbeat: Heartbeat,
    events: Event[]
  ): Promise<number> {
    let actionsCount = 0;

    console.log(`Processing ${events.length} events for agent ${agent.id}`);

    for (const event of events) {
      try {
        // Find subscribed tools for this event type
        const subscriptions = await storage.getToolSubscriptions(event.eventType);
        
        console.log(`Found ${subscriptions.length} tool subscriptions for event ${event.eventType}`);

        for (const { tool, subscription } of subscriptions) {
          // Check if tool is registered
          const toolInstance = this.tools.get(tool.name);
          if (!toolInstance) {
            console.warn(`Tool ${tool.name} not found in registry`);
            continue;
          }

          // Check filter_config
          if (!this.passesFilter(event, subscription.filterConfig)) {
            continue;
          }

          // Create and execute action
          const action = await this.createAction(
            agent,
            tool,
            heartbeat,
            event,
            tool.config
          );

          await this.executeAction(action, toolInstance);
          actionsCount++;
        }
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
      }
    }

    console.log(`Triggered ${actionsCount} actions for agent ${agent.id}`);
    return actionsCount;
  }

  /**
   * Create an action record
   */
  private async createAction(
    agent: Agent,
    tool: any,
    heartbeat: Heartbeat,
    event: Event,
    toolConfig: any
  ): Promise<Action> {
    const action = await storage.createAction({
      id: uuidv4(),
      agentId: agent.id,
      toolId: tool.id,
      heartbeatId: heartbeat.id,
      eventId: event.id,
      status: 'PENDING',
      requestMeta: {
        event: {
          id: event.id,
          type: event.eventType,
          payload: event.payload,
          created_at: event.createdAt
        },
        agent_context: {
          agent_id: agent.id,
          name: agent.name,
          alias: agent.alias || `agent_${agent.id}`,
          personality: agent.personality ? JSON.parse(agent.personality) : {},
          system_prompt: agent.systemPrompt || '',
          expertise: agent.expertise || 'General',
          focus_areas: [], // Would need to be added to agent schema
          recent_snips: [],
          recent_interactions: []
        },
        tool_config: toolConfig || {}
      }
    });

    console.log(`Created action ${action.id} for tool ${tool.name}`);
    return action;
  }

  /**
   * Execute an action using the appropriate tool
   */
  private async executeAction(action: Action, toolInstance: BaseTool) {
    try {
      console.log(`Executing action ${action.id} with tool ${toolInstance.name}`);

      // Update status to RUNNING
      await storage.updateAction(action.id, {
        status: 'RUNNING',
        startedAt: new Date()
      });

      // Execute tool
      const startTime = Date.now();
      const response = await toolInstance.run(action.requestMeta as ToolRequest);
      const executionTime = Date.now() - startTime;

      // Handle new events from tool response
      if (response.new_events) {
        for (const newEvent of response.new_events) {
          await storage.createEvent({
            id: uuidv4(),
            agentId: action.agentId,
            eventType: newEvent.event_type,
            payload: newEvent.payload,
            source: `tool:${toolInstance.name}`,
            priority: newEvent.priority || 5
          });
        }
      }

      // Update action as completed
      await storage.updateAction(action.id, {
        status: 'COMPLETED',
        responseMeta: response,
        executionTimeMs: executionTime,
        completedAt: new Date()
      });

      console.log(`Successfully executed action ${action.id}`);

    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);

      // Update action as failed
      await storage.updateAction(action.id, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : String(error),
        completedAt: new Date()
      });
    }
  }

  /**
   * Check if event passes filter configuration
   */
  private passesFilter(event: Event, filterConfig: any): boolean {
    if (!filterConfig) return true;

    // Example filter checks
    if (filterConfig.min_priority) {
      if ((event.priority || 5) > filterConfig.min_priority) {
        return false;
      }
    }

    if (filterConfig.topics) {
      const eventTopics = event.payload.topics || [];
      const hasMatchingTopic = filterConfig.topics.some(
        (t: string) => eventTopics.includes(t)
      );
      if (!hasMatchingTopic) return false;
    }

    return true;
  }
}
