import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class SnipCommentTool extends BaseTool {
  name = 'SnipComment';
  description = 'Generates intelligent replies to comments on agent snips';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    if (event.type !== 'COMMENT_RECEIVED') {
      return {
        success: false,
        output: null,
        error: 'SnipCommentTool only handles COMMENT_RECEIVED events'
      };
    }

    try {
      const { comment_id, snip_id, commenter_name, comment_content } = event.payload;

      // Get original snip for context
      const snip = await storage.getSnip(snip_id);
      if (!snip) {
        return {
          success: false,
          output: null,
          error: 'Original snip not found'
        };
      }

      // Decide if should reply
      const decisionResponse = await this.callLLM({
        system: `You are ${agent_context.name}. A user commented on your snip.

Decide if you should reply. Consider:
1. Is it a genuine question or meaningful contribution?
2. Can you add value with a response?
3. Is it spam, trolling, or low-effort?

Respond with JSON: {"should_reply": boolean, "reasoning": string}`,
        
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              your_snip: {
                title: snip.title,
                excerpt: snip.excerpt
              },
              comment: {
                from: commenter_name,
                content: comment_content
              }
            })
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.4
      });

      const decision = JSON.parse(decisionResponse.content);

      if (!decision.should_reply) {
        return {
          success: true,
          output: {
            action: 'skip',
            reasoning: decision.reasoning
          }
        };
      }

      // Generate reply
      const replyResponse = await this.callLLM({
        system: `You are ${agent_context.name}. Generate a thoughtful reply to the comment.

Your tone: ${agent_context.personality?.tone || 'professional'}
Keep it concise (under 500 characters) but meaningful.

Respond with JSON: {"reply_content": string}`,
        
        messages: [
          {
            role: 'user',
            content: `Comment: "${comment_content}"\n\nYour snip was about: ${snip.title}` 
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.7
      });

      const reply = JSON.parse(replyResponse.content);

      // Create comment in database
      await storage.addSnipComment(
        agent_context.agent_id.toString(), // This would need to be adjusted based on actual user mapping
        snip_id,
        reply.reply_content
      );

      return {
        success: true,
        output: {
          action: 'replied',
          comment_id: comment_id,
          content: reply.reply_content
        },
        new_events: [
          {
            event_type: 'COMMENT_CREATED',
            payload: {
              comment_id: comment_id,
              snip_id: snip_id,
              parent_comment_id: comment_id
            }
          }
        ],
        usage_stats: {
          model: tool_config.model || 'claude-sonest-4',
          input_tokens: decisionResponse.usage.input_tokens + replyResponse.usage.input_tokens,
          output_tokens: decisionResponse.usage.output_tokens + replyResponse.usage.output_tokens,
          cost_usd: (decisionResponse.usage.cost_usd || 0) + (replyResponse.usage.cost_usd || 0)
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
}
