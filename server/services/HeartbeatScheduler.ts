import { storage } from '../storage';
import { Heartbeat, Event, InsertHeartbeat, InsertEvent } from '@shared/schema';

export class HeartbeatScheduler {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  /**
   * Start the heartbeat scheduler
   * Runs every 1 minute to check for pending heartbeats
   */
  start() {
    if (this.isRunning) {
      console.log('Heartbeat scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting heartbeat scheduler...');

    // Run every 1 minute
    this.interval = setInterval(async () => {
      await this.processPendingHeartbeats();
    }, 60 * 1000);

    // Process immediately on start
    this.processPendingHeartbeats();
  }

  /**
   * Stop the heartbeat scheduler
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Heartbeat scheduler stopped');
  }

  /**
   * Process all pending heartbeats that are due
   */
  private async processPendingHeartbeats() {
    try {
      const pendingHeartbeats = await storage.getPendingHeartbeats();
      
      console.log(`Found ${pendingHeartbeats.length} pending heartbeats to process`);

      for (const heartbeat of pendingHeartbeats) {
        await this.executeHeartbeat(heartbeat);
      }
    } catch (error) {
      console.error('Error processing pending heartbeats:', error);
    }
  }

  /**
   * Execute a single heartbeat
   */
  private async executeHeartbeat(heartbeat: Heartbeat) {
    try {
      console.log(`Executing heartbeat ${heartbeat.id} for agent ${heartbeat.agentId}`);

      // Update status to EXECUTING
      const updatedHeartbeat = await storage.updateHeartbeat(heartbeat.id, {
        status: 'EXECUTING',
        startedAt: new Date()
      });

      // Publish HEARTBEAT event
      const eventData: InsertEvent = {
        agentId: heartbeat.agentId,
        eventType: 'HEARTBEAT',
        payload: { 
          heartbeat_id: heartbeat.id,
          scheduled_at: heartbeat.scheduledAt
        },
        source: 'system',
        priority: 1 // High priority for heartbeat events
      };
      await storage.createEvent(eventData);

      // Trigger agent worker (this would be implemented separately)
      await this.triggerAgentWorker(heartbeat.id);

      console.log(`Successfully executed heartbeat ${heartbeat.id}`);

    } catch (error) {
      console.error(`Failed to execute heartbeat ${heartbeat.id}:`, error);
      
      // Mark as failed
      await storage.updateHeartbeat(heartbeat.id, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : String(error),
        completedAt: new Date()
      });
    }
  }

  /**
   * Trigger the agent worker to process a heartbeat
   * This would typically be done via a queue or direct function call
   */
  private async triggerAgentWorker(heartbeatId: string) {
    // Import here to avoid circular dependencies
    const { AgentWorker } = require('./AgentWorker');
    const worker = new AgentWorker();
    
    // Process asynchronously
    worker.processHeartbeat(heartbeatId).catch((error: Error) => {
      console.error(`Agent worker failed for heartbeat ${heartbeatId}:`, error);
    });
  }

  /**
   * Create initial heartbeat for a new agent
   */
  static async createInitialHeartbeat(agentId: number): Promise<Heartbeat> {
    const heartbeatData: InsertHeartbeat = {
      agentId,
      status: 'PENDING',
      scheduledAt: new Date() // Execute immediately
    };
    
    const heartbeat = await storage.createHeartbeat(heartbeatData);

    console.log(`Created initial heartbeat ${heartbeat.id} for agent ${agentId}`);
    return heartbeat;
  }

  /**
   * Schedule the next heartbeat for an agent based on their custom interval
   */
  static async scheduleNextHeartbeat(agentId: number, previousHeartbeatCompletedAt: Date): Promise<Heartbeat> {
    // Get the agent to find their custom heartbeat interval
    const agent = await storage.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Use agent's custom interval or default to 15 minutes
    const intervalMinutes = agent.heartbeatInterval || 15;
    
    // Validate interval is within reasonable bounds (5 minutes to 24 hours)
    const validInterval = Math.max(5, Math.min(1440, intervalMinutes));
    
    const nextScheduledAt = new Date(
      previousHeartbeatCompletedAt.getTime() + validInterval * 60 * 1000
    );

    const heartbeatData: InsertHeartbeat = {
      agentId,
      status: 'PENDING',
      scheduledAt: nextScheduledAt
    };

    const heartbeat = await storage.createHeartbeat(heartbeatData);

    console.log(`Scheduled next heartbeat ${heartbeat.id} for agent ${agentId} in ${validInterval} minutes at ${nextScheduledAt.toISOString()}`);
    return heartbeat;
  }
}
