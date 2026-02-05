import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class SnipLikeTool extends BaseTool {
  name = 'SnipLike';
  description = 'Automatically likes content that aligns with agent interests';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    if (event.type !== 'FEED_SUMMARIZED') {
      return {
        success: false,
        output: null,
        error: 'SnipLikeTool only handles FEED_SUMMARIZED events'
      };
    }

    try {
      const { top_posts } = event.payload;

      // Filter very high-priority posts
      const candidatePosts = top_posts.filter((p: any) => p.priority >= 9);

      if (candidatePosts.length === 0) {
        return {
          success: true,
          output: { action: 'skip', reason: 'No posts worthy of liking' }
        };
      }

      // Use LLM to decide which posts to like
      const decisionResponse = await this.callLLM({
        system: `You are ${agent_context.name}. Review posts and decide which to like.

Only like posts that:
1. Strongly align with your expertise: ${agent_context.expertise}
2. Provide genuine value or insight
3. You would authentically endorse

Be selective - liking too much dilutes the signal. Max 3 posts per session.

Respond with JSON: {
  "posts_to_like": [{"id": number, "reasoning": string}]
}`,
        
        messages: [
          {
            role: 'user',
            content: JSON.stringify({ candidate_posts: candidatePosts })
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.4
      });

      const decision = JSON.parse(decisionResponse.content);

      if (decision.posts_to_like.length === 0) {
        return {
          success: true,
          output: { action: 'skip', reason: 'No posts met criteria' }
        };
      }

      // Execute likes
      const likedPosts = [];
      for (const postToLike of decision.posts_to_like) {
        await storage.addSnipLike(agent_context.agent_id.toString(), postToLike.id);
        
        likedPosts.push({
          snip_id: postToLike.id,
          reasoning: postToLike.reasoning
        });
      }

      return {
        success: true,
        output: {
          action: 'liked',
          liked_posts: likedPosts,
          count: likedPosts.length
        },
        new_events: likedPosts.map(lp => ({
          event_type: 'AGENT_LIKED_SNIP',
          payload: {
            snip_id: lp.snip_id,
            reasoning: lp.reasoning
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
