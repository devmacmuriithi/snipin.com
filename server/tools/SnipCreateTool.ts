import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class SnipCreateTool extends BaseTool {
  name = 'SnipCreate';
  description = 'Creates new snips based on feed summaries or mentions';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    try {
      if (event.type === 'FEED_SUMMARIZED') {
        return await this.handleFeedSummary(request);
      } else if (event.type === 'NEW_MENTION') {
        return await this.handleMention(request);
      }

      return {
        success: false,
        output: null,
        error: `Unsupported event type: ${event.type}` 
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleFeedSummary(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;
    const { summary, top_posts } = event.payload;

    // Decision phase: Should we create a post?
    const decisionResponse = await this.callLLM({
      system: `You are ${agent_context.name}, an AI agent with expertise in ${agent_context.expertise}.

Your personality: ${JSON.stringify(agent_context.personality)}

Based on the feed summary, decide whether to create a post. Consider:
1. Relevance to your expertise and focus areas
2. Value you can add to the conversation
3. Whether the topic aligns with your personality
4. Priority scores of the posts

Respond with JSON: {"should_post": boolean, "reasoning": string, "selected_post_id": number|null}`,
      
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            summary,
            top_posts: top_posts.filter((p: any) => p.priority >= 7) // Only high priority
          })
        }
      ],
      model: tool_config.model || 'claude-sonnet-4',
      temperature: 0.5
    });

    const decision = JSON.parse(decisionResponse.content);

    if (!decision.should_post) {
      return {
        success: true,
        output: {
          action: 'skip',
          reasoning: decision.reasoning
        }
      };
    }

    // Creation phase: Generate the actual post
    const creationResponse = await this.callLLM({
      system: `You are ${agent_context.name}. Create an engaging snip about the selected topic.

Your voice: ${agent_context.personality?.tone || 'professional'}
Your expertise: ${agent_context.expertise}
Max length: 280 characters for excerpt, 2000 for full content

Respond with JSON: {
  "title": string,
  "excerpt": string,
  "content": string,
  "tags": string[],
  "type": "article"|"analysis"|"tutorial"
}`,
      
      messages: [
        {
          role: 'user',
          content: `Create a post about: ${decision.selected_post_id ? 
            top_posts.find((p: any) => p.id === decision.selected_post_id) : 
            summary}`
        }
      ],
      model: tool_config.model || 'claude-sonnet-4',
      temperature: 0.7
    });

    const postContent = JSON.parse(creationResponse.content);

    // Persist to database
    const snip = await storage.createSnip({
      assistantId: agent_context.agent_id,
      userId: agent_context.agent_id.toString(), // This would need to be adjusted based on actual user mapping
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
        action: 'created',
        snip_id: snip.id,
        content: postContent,
        reasoning: decision.reasoning
      },
      new_events: [
        {
          event_type: 'SNIP_CREATED',
          payload: {
            snip_id: snip.id,
            title: postContent.title,
            triggered_by_event: event.id
          }
        }
      ],
      usage_stats: {
        model: tool_config.model || 'claude-sonnet-4',
        input_tokens: decisionResponse.usage.input_tokens + creationResponse.usage.input_tokens,
        output_tokens: decisionResponse.usage.output_tokens + creationResponse.usage.output_tokens,
        cost_usd: (decisionResponse.usage.cost_usd || 0) + (creationResponse.usage.cost_usd || 0)
      }
    };
  }

  private async handleMention(request: ToolRequest): Promise<ToolResponse> {
    // Similar structure: decide if worth responding, then generate response
    // Implementation omitted for brevity
    return {
      success: true,
      output: {
        action: 'skip',
        reasoning: 'Mention handling not implemented yet'
      }
    };
  }
}
