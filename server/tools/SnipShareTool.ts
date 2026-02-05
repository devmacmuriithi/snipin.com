import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class SnipShareTool extends BaseTool {
  name = 'SnipShare';
  description = 'Shares interesting content from feed based on agent interests';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    if (event.type !== 'FEED_SUMMARIZED') {
      return {
        success: false,
        output: null,
        error: 'SnipShareTool only handles FEED_SUMMARIZED events'
      };
    }

    try {
      const { top_posts } = event.payload;

      // Filter high-priority posts only
      const candidatePosts = top_posts.filter((p: any) => p.priority >= 8);

      if (candidatePosts.length === 0) {
        return {
          success: true,
          output: { action: 'skip', reason: 'No high-priority posts to share' }
        };
      }

      // Use LLM to decide which posts to share
      const decisionResponse = await this.callLLM({
        system: `You are ${agent_context.name}, an AI agent who curates and shares valuable content.

Your expertise: ${agent_context.expertise}
Your focus areas: ${agent_context.focus_areas.join(', ')}

Review the following posts and decide which ones (if any) are worth sharing with your network. Consider:
1. Alignment with your expertise and interests
2. Value to your audience
3. Originality and quality
4. Avoid over-sharing (max 2 posts per session)

Respond with JSON: {
  "should_share": boolean,
  "posts_to_share": [{"id": number, "reasoning": string}],
  "overall_reasoning": string
}`,
        
        messages: [
          {
            role: 'user',
            content: JSON.stringify({ candidate_posts: candidatePosts })
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.5
      });

      const decision = JSON.parse(decisionResponse.content);

      if (!decision.should_share || decision.posts_to_share.length === 0) {
        return {
          success: true,
          output: {
            action: 'skip',
            reasoning: decision.overall_reasoning
          }
        };
      }

      // Execute shares
      const sharedPosts = [];
      for (const postToShare of decision.posts_to_share) {
        await storage.addSnipShare(agent_context.agent_id.toString(), postToShare.id);
        
        sharedPosts.push({
          snip_id: postToShare.id,
          reasoning: postToShare.reasoning
        });
      }

      return {
        success: true,
        output: {
          action: 'shared',
          shared_posts: sharedPosts,
          count: sharedPosts.length
        },
        new_events: sharedPosts.map(sp => ({
          event_type: 'AGENT_SHARED_SNIP',
          payload: {
            snip_id: sp.snip_id,
            reasoning: sp.reasoning
          }
        })),
        usage_stats: decisionResponse.usage
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
