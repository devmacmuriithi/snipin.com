import { storage } from '../storage';
import { Heartbeat, Event, Action } from '@shared/schema';
import { ToolOrchestrator } from './ToolOrchestrator';
import { HeartbeatScheduler } from './HeartbeatScheduler';

export class AgentWorker {
  private toolOrchestrator: ToolOrchestrator;

  constructor() {
    this.toolOrchestrator = new ToolOrchestrator();
  }

  /**
   * Process a heartbeat - the core agent consciousness cycle
   */
  async processHeartbeat(heartbeatId: string) {
    const heartbeat = await storage.getHeartbeat(heartbeatId);
    if (!heartbeat) {
      throw new Error(`Heartbeat ${heartbeatId} not found`);
    }

    if (heartbeat.status !== 'EXECUTING') {
      throw new Error(`Heartbeat ${heartbeatId} is not in EXECUTING status`);
    }

    try {
      console.log(`Processing heartbeat ${heartbeatId} for agent ${heartbeat.agentId}`);

      // Get agent information
      const agent = await storage.getAgent(heartbeat.agentId);
      if (!agent) {
        throw new Error(`Agent ${heartbeat.agentId} not found`);
      }

      // Get last completed heartbeat to define time window
      const lastHeartbeat = await this.getLastCompletedHeartbeat(heartbeat.agentId);
      
      const windowStart = lastHeartbeat?.completedAt || new Date(0);
      const windowEnd = heartbeat.startedAt || new Date();

      console.log(`Processing events from ${windowStart.toISOString()} to ${windowEnd.toISOString()}`);

      // Get all events in the time window
      const windowEvents = await storage.getEventsInTimeWindow(
        heartbeat.agentId,
        windowStart,
        windowEnd
      );

      console.log(`Found ${windowEvents.length} events to process`);

      // Process events through tool orchestrator
      const actionsTriggered = await this.toolOrchestrator.processEvents(
        agent,
        heartbeat,
        windowEvents
      );

      // Mark heartbeat as completed
      const completedHeartbeat = await storage.updateHeartbeat(heartbeatId, {
        status: 'COMPLETED',
        completedAt: new Date()
      });

      // Schedule next heartbeat using agent's custom interval
      await HeartbeatScheduler.scheduleNextHeartbeat(
        heartbeat.agentId, 
        completedHeartbeat.completedAt!
      );

      console.log(`Completed heartbeat ${heartbeatId}. Processed ${windowEvents.length} events, triggered ${actionsTriggered} actions`);

      return completedHeartbeat;

    } catch (error) {
      console.error(`Failed to process heartbeat ${heartbeatId}:`, error);
      
      // Mark as failed
      await storage.updateHeartbeat(heartbeatId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : String(error),
        completedAt: new Date()
      });

      throw error;
    }
  }

  /**
   * Get the last completed heartbeat for an agent
   */
  private async getLastCompletedHeartbeat(agentId: number): Promise<Heartbeat | null> {
    const heartbeats = await storage.getAgentHeartbeats(agentId, 1);
    return heartbeats.find(h => h.status === 'COMPLETED') || null;
  }

  /**
   * Schedule the next heartbeat for an agent
   */
  private async scheduleNextHeartbeat(agentId: number) {
    // This method is now handled by HeartbeatScheduler.scheduleNextHeartbeat
    // Keeping for backward compatibility but not used
    console.log(`Warning: scheduleNextHeartbeat called directly, use HeartbeatScheduler.scheduleNextHeartbeat instead`);
  }

  /**
   * Get agent context for tool execution
   */
  private async getAgentContext(agentId: number) {
    const agent = await storage.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Get recent snips for context
    const recentSnips = await storage.getAgentSnips(agentId, 10);
    
    // Get recent interactions for context
    const recentActions = await storage.getAgentActions(agentId, 20);

    return {
      agent_id: agent.id,
      name: agent.name,
      alias: agent.alias || `agent_${agent.id}`,
      personality: agent.personality ? JSON.parse(agent.personality) : {},
      system_prompt: agent.systemPrompt || '',
      expertise: agent.expertise || 'General',
      focus_areas: agent.interests || [], // Using interests field instead of focusAreas
      recent_snips: recentSnips,
      recent_interactions: recentActions
    };
  }
}
