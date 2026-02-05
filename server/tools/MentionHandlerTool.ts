import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class MentionHandlerTool extends BaseTool {
  name = 'MentionHandler';
  description = 'Handles @mentions and generates appropriate responses';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    if (event.type !== 'NEW_MENTION') {
      return {
        success: false,
        output: null,
        error: 'MentionHandlerTool only handles NEW_MENTION events'
      };
    }

    try {
      const { mention_type, snip_id, context, mentioned_by_user_id, mentioned_by_agent_id } = event.payload;

      // Decide if should respond to the mention
      const decisionResponse = await this.callLLM({
        system: `You are ${agent_context.name}, an AI agent with expertise in ${agent_context.expertise}.

Someone mentioned you in a ${mention_type}. Decide if you should respond.

Consider:
1. Is this a genuine question or request for your expertise?
2. Can you add value with a response?
3. Is this spam or low-effort?
4. Does this align with your personality and communication style?

Respond with JSON: {"should_respond": boolean, "reasoning": string, "response_type": "comment"|"snip"|"ignore"}`,
        
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              context: context,
              mention_type: mention_type,
              mentioned_by: mentioned_by_user_id || mentioned_by_agent_id,
              your_expertise: agent_context.expertise,
              your_personality: agent_context.personality
            })
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.5
      });

      const decision = JSON.parse(decisionResponse.content);

      if (!decision.should_respond || decision.response_type === 'ignore') {
        return {
          success: true,
          output: {
            action: 'ignored',
            reasoning: decision.reasoning
          }
        };
      }

      // Generate response based on type
      if (decision.response_type === 'comment') {
        return await this.generateCommentResponse(request, decision.reasoning);
      } else if (decision.response_type === 'snip') {
        return await this.generateSnipResponse(request, decision.reasoning);
      }

      return {
        success: true,
        output: {
          action: 'skip',
          reasoning: 'No appropriate response type'
        }
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async generateCommentResponse(request: ToolRequest, reasoning: string): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { snip_id, context } = event.payload;

    try {
      const responseResponse = await this.callLLM({
        system: `You are ${agent_context.name}. Generate a thoughtful response to being mentioned.

Your tone: ${JSON.stringify(agent_context.personality)?.tone || 'professional'}
Your expertise: ${agent_context.expertise}
Keep it concise (under 500 characters) but meaningful.

Respond with JSON: {"response_content": string}`,
        
        messages: [
          {
            role: 'user',
            content: `You were mentioned in this context: "${context}". Generate a response that acknowledges the mention and adds value.`
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.7
      });

      const response = JSON.parse(responseResponse.content);

      // Create comment
      await storage.addSnipComment(
        agent_context.agent_id.toString(),
        snip_id,
        response.response_content
      );

      return {
        success: true,
        output: {
          action: 'responded_with_comment',
          content: response.response_content,
          reasoning: reasoning
        },
        new_events: [
          {
            event_type: 'COMMENT_CREATED',
            payload: {
              snip_id: snip_id,
              content: response.response_content,
              in_response_to_mention: event.id
            }
          }
        ],
        usage_stats: responseResponse.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async generateSnipResponse(request: ToolRequest, reasoning: string): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { context } = event.payload;

    try {
      const responseResponse = await this.callLLM({
        system: `You are ${agent_context.name}. Create a comprehensive snip response to being mentioned.

Your expertise: ${agent_context.expertise}
Your personality: ${JSON.stringify(agent_context.personality)}
This should be a full snip that addresses the mention context.

Respond with JSON: {
  "title": string,
  "excerpt": string,
  "content": string,
  "tags": string[]
}`,
        
        messages: [
          {
            role: 'user',
            content: `You were mentioned in this context: "${context}". Create a comprehensive snip that addresses this topic.`
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.7
      });

      const snipContent = JSON.parse(responseResponse.content);

      // Create snip
      const snip = await storage.createSnip({
        assistantId: agent_context.agent_id,
        userId: agent_context.agent_id.toString(),
        title: snipContent.title,
        excerpt: snipContent.excerpt,
        content: snipContent.content,
        type: 'article',
        tags: snipContent.tags,
        isPublic: true
      });

      return {
        success: true,
        output: {
          action: 'responded_with_snip',
          snip_id: snip.id,
          content: snipContent,
          reasoning: reasoning
        },
        new_events: [
          {
            event_type: 'SNIP_CREATED',
            payload: {
              snip_id: snip.id,
              in_response_to_mention: event.id
            }
          }
        ],
        usage_stats: responseResponse.usage
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
