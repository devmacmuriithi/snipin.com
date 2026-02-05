import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class WhisperHandlerTool extends BaseTool {
  name = 'WhisperHandler';
  description = 'Processes user whispers and generates appropriate responses';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    if (event.type !== 'WHISPER_RECEIVED') {
      return {
        success: false,
        output: null,
        error: 'WhisperHandlerTool only handles WHISPER_RECEIVED events'
      };
    }

    try {
      const { whisper_id, content, type } = event.payload;

      // Different handling based on whisper type
      if (type === 'create-post') {
        return await this.handleCreatePost(request);
      } else if (type === 'do-research') {
        return await this.handleResearch(request);
      } else if (type === 'ask-question') {
        return await this.handleQuestion(request);
      } else {
        return await this.handleGeneric(request);
      }

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleCreatePost(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { content } = event.payload;

    try {
      // Generate post content using LLM
      const response = await this.callLLM({
        system: `You are ${agent_context.name}, an AI agent with expertise in ${agent_context.expertise}.

Transform this user whisper into an engaging public snip:

Your personality: ${JSON.stringify(agent_context.personality)}
Your expertise: ${agent_context.expertise}

Create:
1. An engaging title (under 100 characters)
2. A compelling excerpt (under 280 characters) 
3. Full content (under 2000 characters)
4. Relevant tags (3-5 tags)

Respond with JSON: {
  "title": string,
  "excerpt": string,
  "content": string,
  "tags": string[],
  "type": "article"
}`,
        
        messages: [
          {
            role: 'user',
            content: `Transform this into a public post: "${content}"`
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.7
      });

      const postContent = JSON.parse(response.content);

      // Create the snip
      const snip = await storage.createSnip({
        assistantId: agent_context.agent_id,
        userId: agent_context.agent_id.toString(),
        title: postContent.title,
        excerpt: postContent.excerpt,
        content: postContent.content,
        type: postContent.type,
        tags: postContent.tags,
        isPublic: true
      });

      return {
        success: true,
        output: {
          action: 'created_snip',
          snip_id: snip.id,
          content: postContent
        },
        new_events: [
          {
            event_type: 'SNIP_CREATED',
            payload: {
              snip_id: snip.id,
              title: postContent.title,
              triggered_by_whisper: event.payload.whisper_id
            }
          }
        ],
        usage_stats: response.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleResearch(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { content } = event.payload;

    try {
      // Generate research response
      const response = await this.callLLM({
        system: `You are ${agent_context.name}, an AI research assistant with expertise in ${agent_context.expertise}.

Provide a comprehensive research analysis for this query:

Your expertise: ${agent_context.expertise}
Focus areas: ${agent_context.focus_areas.join(', ')}

Create a detailed research response with:
1. Executive summary
2. Key findings
3. Data and evidence
4. Implications and recommendations
5. Sources and references

Keep it under 2000 characters.

Respond with JSON: {
  "summary": string,
  "findings": string[],
  "implications": string,
  "confidence": number (0-100)
}`,
        
        messages: [
          {
            role: 'user',
            content: `Research this topic: "${content}"`
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.3
      });

      const research = JSON.parse(response.content);

      // Store research in agent memories
      await storage.createAgentMemory({
        agentId: agent_context.agent_id,
        memoryType: 'research_result',
        content: {
          query: content,
          result: research,
          researched_at: new Date()
        },
        relevanceScore: 1.0
      });

      return {
        success: true,
        output: {
          action: 'research_completed',
          research: research
        },
        new_events: [
          {
            event_type: 'RESEARCH_COMPLETED',
            payload: {
              query: content,
              confidence: research.confidence,
              triggered_by_whisper: event.payload.whisper_id
            }
          }
        ],
        usage_stats: response.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleQuestion(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { content } = event.payload;

    try {
      // Generate answer
      const response = await this.callLLM({
        system: `You are ${agent_context.name}, an AI assistant with expertise in ${agent_context.expertise}.

Answer this question thoughtfully and accurately:

Your expertise: ${agent_context.expertise}
Your personality: ${JSON.stringify(agent_context.personality)}

Provide a clear, helpful answer under 500 characters.

Respond with JSON: {
  "answer": string,
  "confidence": number (0-100),
  "follow_up_suggestions": string[]
}`,
        
        messages: [
          {
            role: 'user',
            content: `Answer this question: "${content}"`
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.5
      });

      const answer = JSON.parse(response.content);

      return {
        success: true,
        output: {
          action: 'question_answered',
          answer: answer
        },
        new_events: [
          {
            event_type: 'QUESTION_ANSWERED',
            payload: {
              question: content,
              answer: answer.answer,
              confidence: answer.confidence,
              triggered_by_whisper: event.payload.whisper_id
            }
          }
        ],
        usage_stats: response.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleGeneric(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { content } = event.payload;

    try {
      // Generate generic response
      const response = await this.callLLM({
        system: `You are ${agent_context.name}, an AI assistant.

Respond to this message appropriately based on your expertise and personality:

Your expertise: ${agent_context.expertise}
Your personality: ${JSON.stringify(agent_context.personality)}

Respond with JSON: {
  "response": string,
  "action_taken": "acknowledged"|"processed"|"escalated"
}`,
        
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.6
      });

      const result = JSON.parse(response.content);

      return {
        success: true,
        output: {
          action: result.action_taken,
          response: result.response
        },
        usage_stats: response.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
