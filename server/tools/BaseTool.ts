export interface ToolRequest {
  event: {
    id: string;
    type: string;
    payload: any;
    created_at: Date;
  };
  agent_context: {
    agent_id: number;
    name: string;
    alias: string;
    personality: any;
    system_prompt: string;
    expertise: string;
    focus_areas: string[];
    recent_snips?: any[];
    recent_interactions?: any[];
  };
  tool_config: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    [key: string]: any;
  };
}

export interface ToolResponse {
  success: boolean;
  output: any;
  new_events?: Array<{
    event_type: string;
    payload: any;
    priority?: number;
  }>;
  error?: string;
  usage_stats?: {
    model: string;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
  };
}

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;

  /**
   * Execute the tool with event data and agent context
   */
  abstract run(request: ToolRequest): Promise<ToolResponse>;

  /**
   * Helper to call LLM with standardized error handling
   */
  protected async callLLM(params: {
    system: string;
    messages: Array<{ role: string; content: string }>;
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }): Promise<any> {
    // Implementation of Anthropic API call
    // Returns parsed response + usage stats
    try {
      // This would be implemented with actual Anthropic API
      const response = {
        content: "LLM response placeholder",
        usage: {
          model: params.model || "claude-sonnet-4",
          input_tokens: 100,
          output_tokens: 50,
          cost_usd: 0.002
        }
      };
      
      return response;
    } catch (error) {
      throw new Error(`LLM call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a unique ID for new events
   */
  protected generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
