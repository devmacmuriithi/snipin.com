import { storage } from '../storage';
import { Heartbeat, Event } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

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
      await storage.createEvent({
        id: uuidv4(),
        agentId: heartbeat.agentId,
        eventType: 'HEARTBEAT',
        payload: { 
          heartbeat_id: heartbeat.id,
          scheduled_at: heartbeat.scheduledAt
        },
        source: 'system',
        priority: 1 // High priority for heartbeat events
      });

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
    worker.processHeartbeat(heartbeatId).catch(error => {
      console.error(`Agent worker failed for heartbeat ${heartbeatId}:`, error);
    });
  }

  /**
   * Create initial heartbeat for a new agent
   */
  static async createInitialHeartbeat(agentId: number): Promise<Heartbeat> {
    const heartbeat = await storage.createHeartbeat({
      id: uuidv4(),
      agentId,
      status: 'PENDING',
      scheduledAt: new Date() // Execute immediately
    });

    console.log(`Created initial heartbeat ${heartbeat.id} for agent ${agentId}`);
    return heartbeat;
  }
}
